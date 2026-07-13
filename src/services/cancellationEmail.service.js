import { appConfig } from "../config/index.js";
import { sendCancellationEmail } from "./email.service.js";
import { groupOrderItemsBySeller } from "./orderEmail.service.js";
import * as UserRepository from "../repositories/user.repository.js";

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
    console.error(`[cancellationEmail] ${label} failed:`, error.message || error);
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
  supportUrl: joinUrl(storefrontBase(), "/help"),
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

const isRefundEligible = (order) =>
  order.paymentMethod === "card" && order.paymentStatus === "paid";

/** G1 + G2 — customer cancels (placed / confirmed) */
export const notifyCustomerCancellation = async (
  order,
  { reason } = {}
) => {
  if (!order) return { sent: false };

  const customer = await resolveCustomer(order);
  const urls = customerUrls(order);
  const results = {};
  const cancelReason = reason || order.cancelReason;

  if (customer.email) {
    results.customer = await safeSend("G1", () =>
      sendCancellationEmail("CANCEL_CUSTOMER_CONFIRMED", {
        to: customer.email,
        data: {
          customerName: customer.name,
          orderNumber: order.orderNumber,
          cancelReason,
          total: order.total,
          currency: currency(),
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          refundEligible: isRefundEligible(order),
          items: mapItems(order.items),
          cancelledAt: order.cancelledAt || new Date(),
          ...urls,
        },
      })
    );
  }

  const sellerGroups = await groupOrderItemsBySeller(order);
  results.sellers = [];
  for (const { seller, items } of sellerGroups) {
    const to = seller.user?.email;
    if (!to) continue;
    const result = await safeSend("G2", () =>
      sendCancellationEmail("CANCEL_CUSTOMER_TO_SELLER", {
        to,
        data: {
          sellerName: seller.user?.name || seller.storeName || "Seller",
          storeName: seller.storeName,
          orderNumber: order.orderNumber,
          cancelReason,
          items: mapItems(items),
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

/** G3 — paid card cancel blocked */
export const notifyPaidCancelBlocked = async (order) => {
  if (!order) return { sent: false };

  const customer = await resolveCustomer(order);
  if (!customer.email) return { sent: false, reason: "missing_email" };

  const urls = customerUrls(order);
  return safeSend("G3", () =>
    sendCancellationEmail("CANCEL_PAID_BLOCKED", {
      to: customer.email,
      data: {
        customerName: customer.name,
        orderNumber: order.orderNumber,
        total: order.total,
        currency: currency(),
        ...urls,
      },
    })
  );
};

/** G4 + G5 — seller/admin cancels */
export const notifyOpsCancellation = async (
  order,
  { cancelledBy = "admin", reason, stockRestored = true } = {}
) => {
  if (!order) return { sent: false };

  const customer = await resolveCustomer(order);
  const urls = customerUrls(order);
  const results = {};
  const cancelReason = reason || order.cancelReason;

  if (customer.email) {
    results.customer = await safeSend("G4", () =>
      sendCancellationEmail("CANCEL_OPS_TO_CUSTOMER", {
        to: customer.email,
        data: {
          customerName: customer.name,
          orderNumber: order.orderNumber,
          cancelReason,
          cancelledBy,
          total: order.total,
          currency: currency(),
          paymentMethod: order.paymentMethod,
          refundEligible: isRefundEligible(order),
          items: mapItems(order.items),
          cancelledAt: order.cancelledAt || new Date(),
          ...urls,
        },
      })
    );
  }

  const sellerGroups = await groupOrderItemsBySeller(order);
  results.sellers = [];
  for (const { seller, items } of sellerGroups) {
    const to = seller.user?.email;
    if (!to) continue;
    const result = await safeSend("G5", () =>
      sendCancellationEmail("CANCEL_OPS_TO_SELLER", {
        to,
        data: {
          sellerName: seller.user?.name || seller.storeName || "Seller",
          storeName: seller.storeName,
          orderNumber: order.orderNumber,
          cancelReason,
          cancelledBy,
          stockRestored,
          items: mapItems(items),
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

/**
 * G6 — COD refusal / failed delivery (future).
 * Sends to customer and all sellers on the order.
 */
export const notifyCodRefusal = async (
  order,
  { failureReason, attemptNumber = 1, attemptedAt } = {}
) => {
  if (!order) return { sent: false };

  const customer = await resolveCustomer(order);
  const urls = customerUrls(order);
  const results = {};
  const base = {
    orderNumber: order.orderNumber,
    attemptNumber,
    failureReason:
      failureReason || "Customer refused delivery / not available",
    attemptedAt: attemptedAt || new Date(),
    currency: currency(),
  };

  if (customer.email) {
    results.customer = await safeSend("G6-customer", () =>
      sendCancellationEmail("CANCEL_COD_REFUSAL", {
        to: customer.email,
        data: {
          ...base,
          audience: "customer",
          recipientName: customer.name,
          items: mapItems(order.items),
          ...urls,
          rescheduleUrl: joinUrl(
            storefrontBase(),
            `/orders/${order._id}/reschedule`
          ),
        },
      })
    );
  }

  const sellerGroups = await groupOrderItemsBySeller(order);
  results.sellers = [];
  for (const { seller, items } of sellerGroups) {
    const to = seller.user?.email;
    if (!to) continue;
    const result = await safeSend("G6-seller", () =>
      sendCancellationEmail("CANCEL_COD_REFUSAL", {
        to,
        data: {
          ...base,
          audience: "seller",
          recipientName: seller.user?.name || seller.storeName || "Seller",
          storeName: seller.storeName,
          items: mapItems(items),
          sellerOrderUrl: sellerOrderUrl(order._id),
        },
      })
    );
    results.sellers.push({ sellerId: String(seller._id), ...result });
  }

  return results;
};
