import { appConfig } from "../config/index.js";
import { sendOrderEmail } from "./email.service.js";
import * as UserRepository from "../repositories/user.repository.js";
import * as ProductRepository from "../repositories/product.repository.js";
import * as SellerRepository from "../repositories/seller.repository.js";

const joinUrl = (base, path = "") => {
  if (!base) return path || undefined;
  const normalized = String(base).replace(/\/$/, "");
  if (!path) return normalized;
  return `${normalized}${path.startsWith("/") ? path : `/${path}`}`;
};

const storefrontBase = () => appConfig.storefrontUrl || "http://localhost:3000";
const dashboardBase = () =>
  appConfig.dashboardUrl || appConfig.clientUrl || "http://localhost:5173";

const currency = () =>
  appConfig.payment?.currencySymbol || appConfig.payment?.currency || "";

const safeSend = async (label, fn) => {
  try {
    return await fn();
  } catch (error) {
    console.error(`[orderEmail] ${label} failed:`, error.message || error);
    return { sent: false, error };
  }
};

const mapItems = (items = []) =>
  items.map((item) => ({
    title: item.title,
    quantity: item.quantity,
    price: item.price,
    size: item.size,
    color: item.color,
    variantSku: item.variantSku,
    product: item.product?._id || item.product,
  }));

const customerUrls = (order) => ({
  orderUrl: joinUrl(storefrontBase(), `/orders/${order._id}`),
  payUrl: joinUrl(storefrontBase(), `/checkout/payment?orderId=${order._id}`),
});

const sellerOrderUrl = (orderId) =>
  joinUrl(dashboardBase(), `/seller/orders/${orderId}`);

const resolveCustomer = async (order) => {
  if (order.user?.email) {
    return {
      email: order.user.email,
      name: order.user.name || order.shippingAddress?.fullName || "Customer",
    };
  }

  const userId = order.user?._id || order.user;
  if (!userId) {
    return {
      email: null,
      name: order.shippingAddress?.fullName || "Customer",
    };
  }

  const user = await UserRepository.findById(userId, "email name");
  return {
    email: user?.email || null,
    name: user?.name || order.shippingAddress?.fullName || "Customer",
  };
};

/**
 * Group order line items by seller (supports multi-vendor carts).
 */
export const groupOrderItemsBySeller = async (order) => {
  const items = order.items || [];
  const productIds = [
    ...new Set(
      items
        .map((i) => String(i.product?._id || i.product))
        .filter((id) => id && id !== "undefined")
    ),
  ];

  if (!productIds.length) return [];

  const products = await ProductRepository.find({
    _id: { $in: productIds },
  }).select("seller title");

  const productSellerMap = new Map(
    products.map((p) => [String(p._id), String(p.seller)])
  );

  const bySeller = new Map();
  for (const item of items) {
    const productId = String(item.product?._id || item.product);
    const sellerId = productSellerMap.get(productId);
    if (!sellerId) continue;

    if (!bySeller.has(sellerId)) bySeller.set(sellerId, []);
    bySeller.get(sellerId).push(item);
  }

  const sellerIds = [...bySeller.keys()];
  const sellers = await SellerRepository.find({
    _id: { $in: sellerIds },
  }).populate("user", "name email");

  return sellers.map((seller) => ({
    seller,
    items: bySeller.get(String(seller._id)) || [],
  }));
};

const STATUS_EVENT = {
  confirmed: "ORDER_CONFIRMED_CUSTOMER",
  packed: "ORDER_PACKED_CUSTOMER",
  shipped: "ORDER_SHIPPED_CUSTOMER",
  out_for_delivery: "ORDER_OUT_FOR_DELIVERY_CUSTOMER",
  delivered: "ORDER_DELIVERED_CUSTOMER",
};

/** E1 + E2 — order placed (COD or card checkout started) */
export const notifyOrderPlaced = async (order) => {
  if (!order) return { sent: false };

  const customer = await resolveCustomer(order);
  const urls = customerUrls(order);
  const items = mapItems(order.items);
  const results = {};

  const customerData = {
    customerName: customer.name,
    orderNumber: order.orderNumber,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    items,
    subtotal: order.subtotal,
    discount: order.discount,
    shippingFee: order.shippingFee,
    total: order.total,
    currency: currency(),
    shippingAddress: order.shippingAddress || {},
    placedAt: order.createdAt || new Date(),
    ...urls,
  };

  if (customer.email) {
    results.customer = await safeSend("E1", () =>
      sendOrderEmail("ORDER_PLACED_CUSTOMER", {
        to: customer.email,
        data: customerData,
      })
    );
  }

  const sellerGroups = await groupOrderItemsBySeller(order);
  results.sellers = [];

  for (const { seller, items: sellerItems } of sellerGroups) {
    const to = seller.user?.email;
    if (!to) continue;

    // For unpaid card orders, still notify seller but template says wait
    const result = await safeSend("E2", () =>
      sendOrderEmail("ORDER_PLACED_SELLER", {
        to,
        data: {
          sellerName: seller.user?.name || seller.storeName || "Seller",
          storeName: seller.storeName,
          orderNumber: order.orderNumber,
          customerName: customer.name,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          items: mapItems(sellerItems),
          itemCount: sellerItems.reduce((n, i) => n + (i.quantity || 0), 0),
          currency: currency(),
          shippingAddress: order.shippingAddress || {},
          placedAt: order.createdAt || new Date(),
          sellerOrderUrl: sellerOrderUrl(order._id),
        },
      })
    );
    results.sellers.push({ sellerId: String(seller._id), ...result });
  }

  return results;
};

/** E5–E11 — fulfillment status change */
export const notifyOrderStatusChanged = async (
  order,
  { status, note, previousStatus } = {}
) => {
  if (!order) return { sent: false };

  const nextStatus = status || order.orderStatus;
  if (previousStatus && previousStatus === nextStatus) {
    return { sent: false, reason: "unchanged" };
  }

  const eventKey = STATUS_EVENT[nextStatus];
  if (!eventKey) return { sent: false, reason: "unsupported_status" };

  const customer = await resolveCustomer(order);
  const urls = customerUrls(order);
  const results = {};

  if (customer.email) {
    results.customer = await safeSend(eventKey, () =>
      sendOrderEmail(eventKey, {
        to: customer.email,
        data: {
          status: nextStatus,
          customerName: customer.name,
          orderNumber: order.orderNumber,
          note,
          items: mapItems(order.items),
          currency: currency(),
          updatedAt: new Date(),
          ...urls,
        },
      })
    );
  }

  if (nextStatus === "delivered") {
    const sellerGroups = await groupOrderItemsBySeller(order);
    results.sellers = [];
    for (const { seller, items: sellerItems } of sellerGroups) {
      const to = seller.user?.email;
      if (!to) continue;
      const result = await safeSend("E11", () =>
        sendOrderEmail("ORDER_DELIVERED_SELLER", {
          to,
          data: {
            sellerName: seller.user?.name || seller.storeName || "Seller",
            storeName: seller.storeName,
            orderNumber: order.orderNumber,
            items: mapItems(sellerItems),
            currency: currency(),
            deliveredAt: order.deliveredAt || new Date(),
            sellerOrderUrl: sellerOrderUrl(order._id),
          },
        })
      );
      results.sellers.push({ sellerId: String(seller._id), ...result });
    }
  }

  return results;
};

/** G1 + G2 — cancellation */
export const notifyOrderCancelled = async (
  order,
  { cancelledBy = "customer", reason } = {}
) => {
  if (!order) return { sent: false };

  const customer = await resolveCustomer(order);
  const urls = customerUrls(order);
  const results = {};
  const cancelReason = reason || order.cancelReason;

  if (customer.email) {
    results.customer = await safeSend("G1", () =>
      sendOrderEmail("ORDER_CANCELLED_CUSTOMER", {
        to: customer.email,
        data: {
          customerName: customer.name,
          orderNumber: order.orderNumber,
          cancelReason,
          cancelledBy,
          total: order.total,
          currency: currency(),
          items: mapItems(order.items),
          cancelledAt: order.cancelledAt || new Date(),
          ...urls,
        },
      })
    );
  }

  const sellerGroups = await groupOrderItemsBySeller(order);
  results.sellers = [];
  for (const { seller, items: sellerItems } of sellerGroups) {
    const to = seller.user?.email;
    if (!to) continue;
    const result = await safeSend("G2", () =>
      sendOrderEmail("ORDER_CANCELLED_SELLER", {
        to,
        data: {
          sellerName: seller.user?.name || seller.storeName || "Seller",
          storeName: seller.storeName,
          orderNumber: order.orderNumber,
          cancelReason,
          items: mapItems(sellerItems),
          currency: currency(),
          cancelledAt: order.cancelledAt || new Date(),
          sellerOrderUrl: sellerOrderUrl(order._id),
        },
      })
    );
    results.sellers.push({ sellerId: String(seller._id), ...result });
  }

  return results;
};
