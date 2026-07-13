import * as OrderRepository from "../repositories/order.repository.js";
import * as ProductRepository from "../repositories/product.repository.js";
import { FREE_SHIPPING_THRESHOLD } from "../utils/helpers/orderHelpers.js";
import { buildOrderFromCart } from "../utils/helpers/orderBuilder.js";
import { restoreOrderStock } from "../utils/helpers/paymentHelpers.js";
import { restoreCouponOnCancel } from "../utils/helpers/couponHelpers.js";
import { createError } from "../utils/AppError.js";
import * as OrderEmail from "./orderEmail.service.js";

export const placeOrder = async (userId, { addressId, paymentMethod = "cod" }) => {
  if (paymentMethod !== "cod") {
    throw createError(
      "Online payments must be initiated via POST /payments/checkout",
      400
    );
  }

  let order;
  try {
    order = await buildOrderFromCart(userId, {
      addressId,
      paymentMethod: "cod",
    });
  } catch (err) {
    throw createError(err.message, err.statusCode || 500);
  }

  await OrderEmail.notifyOrderPlaced(order);

  return { order, __status: 201 };
};

export const getMyOrders = async (userId, { page = 1, limit = 10, status }) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(30, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const filter = { user: userId };
  if (status) filter.orderStatus = status;

  const orders = await OrderRepository.find(filter)
    .sort("-createdAt")
    .skip(skip)
    .limit(limitNum);

  const total = await OrderRepository.countDocuments(filter);

  return {
    orders,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  };
};

export const getOrderById = async (userId, orderId) => {
  const order = await OrderRepository.findOne({
    _id: orderId,
    user: userId,
  }).populate("items.product", "title slug images");

  if (!order) throw createError("Order not found", 404);
  return { order };
};

export const cancelOrder = async (userId, orderId, { reason }) => {
  const order = await OrderRepository.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) throw createError("Order not found", 404);

  if (order.paymentMethod === "card" && order.paymentStatus === "paid") {
    throw createError(
      "Paid online orders cannot be cancelled online. Please contact support.",
      400
    );
  }

  if (!["placed", "confirmed"].includes(order.orderStatus)) {
    throw createError("Order cannot be cancelled at this stage");
  }

  await restoreOrderStock(order);

  order.orderStatus = "cancelled";
  order.cancelledAt = new Date();
  order.cancelReason = reason || "Cancelled by customer";
  order.statusHistory.push({
    status: "cancelled",
    note: order.cancelReason,
  });

  if (order.paymentMethod === "card" && order.paymentStatus === "pending") {
    order.paymentStatus = "failed";
  }

  await restoreCouponOnCancel(order);
  await order.save();

  await OrderEmail.notifyOrderCancelled(order, {
    cancelledBy: "customer",
    reason: order.cancelReason,
  });

  return { order };
};

export const getOrderSummary = async () => ({
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  standardShippingFee: 79,
});

const getSellerProductIds = async (sellerId) => {
  const products = await ProductRepository.findBySeller(sellerId).select("_id");
  return products.map((p) => p._id);
};

const orderContainsSellerProducts = (order, productIds) =>
  order.items.some((item) =>
    productIds.some((id) => String(item.product?._id) === String(id))
  );

const SELLER_STATUS_FLOW = [
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

export const getSellerOrders = async (sellerId, { page = 1, limit = 10, status }) => {
  const productIds = await getSellerProductIds(sellerId);
  if (!productIds.length) {
    return {
      orders: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(30, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const filter = { "items.product": { $in: productIds } };
  if (status) filter.orderStatus = status;

  const orders = await OrderRepository.find(filter)
    .populate("user", "name email")
    .sort("-createdAt")
    .skip(skip)
    .limit(limitNum);

  const total = await OrderRepository.countDocuments(filter);

  return {
    orders,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  };
};

export const getSellerOrderById = async (sellerId, orderId) => {
  const productIds = await getSellerProductIds(sellerId);
  const order = await OrderRepository.findById(orderId)
    .populate("user", "name email mobileNumber")
    .populate("items.product", "title slug seller");

  if (!order || !orderContainsSellerProducts(order, productIds)) {
    throw createError("Order not found", 404);
  }

  return { order };
};

export const updateSellerOrderStatus = async (sellerId, orderId, { status, note }) => {
  if (!status) throw createError("Status is required");

  if (!SELLER_STATUS_FLOW.includes(status)) {
    throw createError("Invalid status for seller update");
  }

  const productIds = await getSellerProductIds(sellerId);
  const order = await OrderRepository.findById(orderId);

  if (!order || !orderContainsSellerProducts(order, productIds)) {
    throw createError("Order not found", 404);
  }

  if (order.orderStatus === "cancelled" || order.orderStatus === "returned") {
    throw createError("Cannot update a cancelled or returned order");
  }

  if (
    order.paymentMethod === "card" &&
    order.paymentStatus !== "paid" &&
    status !== "cancelled"
  ) {
    throw createError("Cannot fulfill an order with unpaid online payment", 400);
  }

  const previousStatus = order.orderStatus;
  order.orderStatus = status;
  order.statusHistory.push({
    status,
    note: note || `Status updated to ${status} by seller`,
  });

  if (status === "delivered") {
    order.deliveredAt = new Date();
  }

  await order.save();

  await OrderEmail.notifyOrderStatusChanged(order, {
    status,
    note,
    previousStatus,
  });

  return { order };
};

export const getAdminOrders = async ({ page = 1, limit = 10, status }) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const filter = {};
  if (status) filter.orderStatus = status;

  const orders = await OrderRepository.find(filter)
    .populate("user", "name email")
    .sort("-createdAt")
    .skip(skip)
    .limit(limitNum);

  const total = await OrderRepository.countDocuments(filter);

  return {
    orders,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  };
};

export const updateAdminOrderStatus = async (orderId, { status, note }) => {
  if (!status) throw createError("Status is required");

  const order = await OrderRepository.findById(orderId);
  if (!order) throw createError("Order not found", 404);

  const previousStatus = order.orderStatus;
  order.orderStatus = status;
  order.statusHistory.push({
    status,
    note: note || `Status updated to ${status} by admin`,
  });

  if (status === "delivered") order.deliveredAt = new Date();
  if (status === "cancelled") {
    order.cancelledAt = new Date();
    await restoreCouponOnCancel(order);
  }

  await order.save();

  if (status === "cancelled") {
    await OrderEmail.notifyOrderCancelled(order, {
      cancelledBy: "admin",
      reason: note || order.cancelReason || "Cancelled by admin",
    });
  } else {
    await OrderEmail.notifyOrderStatusChanged(order, {
      status,
      note,
      previousStatus,
    });
  }

  return { order };
};
