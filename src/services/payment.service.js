import * as UserRepository from "../repositories/user.repository.js";
import * as OrderRepository from "../repositories/order.repository.js";
import { appConfig } from "../config/index.js";
import { buildOrderFromCart } from "../utils/helpers/orderBuilder.js";
import {
  applyPaymentVerification,
  failPaymentAndCancelOrder,
  findOrderByPaymentReference,
  recordWebhookEvent,
} from "../utils/helpers/paymentHelpers.js";
import {
  generatePaymentReference,
  initiateStandardCheckout,
  verifyTransaction,
  verifyTransactionByReference,
  getFlutterwaveCapabilities,
  FlutterwaveServiceError,
} from "../services/flutterwave.service.js";
import { isFlutterwaveV3Configured } from "../vendor/flutterwave.vendor.js";
import { createError } from "../utils/AppError.js";
import * as OrderEmail from "./orderEmail.service.js";
import * as PaymentEmail from "./paymentEmail.service.js";

const buildRedirectUrl = () =>
  `${appConfig.storefrontUrl.replace(/\/$/, "")}/checkout/payment/callback`;

const formatOrderForClient = (order) => ({
  _id: order._id,
  orderNumber: order.orderNumber,
  total: order.total,
  paymentStatus: order.paymentStatus,
  paymentMethod: order.paymentMethod,
  orderStatus: order.orderStatus,
});

export const initializeCheckout = async (userId, { addressId }) => {
  if (!isFlutterwaveV3Configured()) {
    throw createError(
      "Online payments are not configured. Set FLUTTERWAVE_PUBLIC_KEY and FLUTTERWAVE_SECRET_KEY.",
      503
    );
  }

  if (!addressId) {
    throw createError("Shipping address is required", 400);
  }

  const txRef = generatePaymentReference("ORD");

  let order;
  try {
    order = await buildOrderFromCart(userId, {
      addressId,
      paymentMethod: "card",
      paymentTxRef: txRef,
    });
  } catch (err) {
    throw createError(err.message, err.statusCode || 500);
  }

  const user = await UserRepository.findById(userId, "email name");

  try {
    const checkout = await initiateStandardCheckout({
      txRef,
      amount: order.total,
      currency: appConfig.payment.currency,
      redirectUrl: buildRedirectUrl(),
      customer: {
        email: user?.email,
        phonenumber: order.shippingAddress?.mobileNumber,
        name: order.shippingAddress?.fullName || user?.name,
      },
      customizations: {
        title: "NileCart",
        description: `Order ${order.orderNumber}`,
        logo: appConfig.payment.logoUrl,
      },
      paymentOptions: appConfig.payment.options,
      meta: {
        order_id: String(order._id),
        order_number: order.orderNumber,
        user_id: String(userId),
      },
    });

    const checkoutUrl = checkout?.link;
    if (!checkoutUrl) {
      await failPaymentAndCancelOrder(order, "Checkout initialization failed", "system");
      throw createError("Could not initialize payment checkout", 502);
    }

    order.flutterwave = {
      ...order.flutterwave?.toObject?.() ?? order.flutterwave ?? {},
      txRef,
      checkoutUrl,
      currency: appConfig.payment.currency,
    };
    await order.save();

    await OrderEmail.notifyOrderPlaced(order);

    return {
      order: formatOrderForClient(order),
      checkoutUrl,
      txRef,
    };
  } catch (err) {
    await failPaymentAndCancelOrder(
      order,
      err.message || "Payment initialization failed",
      "system"
    );

    const statusCode = err instanceof FlutterwaveServiceError ? err.statusCode : 502;
    throw createError(err.message || "Could not initialize payment", statusCode);
  }
};

export const verifyCheckoutPayment = async (
  userId,
  { txRef, transactionId, redirectStatus }
) => {
  if (!txRef) {
    throw createError("Payment reference (tx_ref) is required", 400);
  }

  const order = await OrderRepository.findOne({
    "flutterwave.txRef": txRef,
    user: userId,
  });

  if (!order) {
    throw createError("Order not found for this payment reference", 404);
  }

  if (redirectStatus === "cancelled" || redirectStatus === "canceled") {
    await failPaymentAndCancelOrder(order, "Payment cancelled by customer", "redirect");
    return {
      order: formatOrderForClient(order),
      failed: true,
      cancelled: true,
    };
  }

  if (order.paymentStatus === "paid") {
    return {
      order: formatOrderForClient(order),
      alreadyPaid: true,
    };
  }

  try {
    const verification = transactionId
      ? await verifyTransaction(transactionId)
      : await verifyTransactionByReference(txRef);

    const result = await applyPaymentVerification(order, verification, "redirect");

    return {
      order: formatOrderForClient(result.order),
      alreadyPaid: result.alreadyPaid,
      paid: result.paid,
      failed: result.failed,
    };
  } catch (err) {
    const statusCode = err.statusCode || 502;

    if (statusCode === 409) {
      throw createError(err.message, 409);
    }

    if (statusCode === 400) {
      await failPaymentAndCancelOrder(order, err.message, "redirect");
    }

    throw createError(err.message || "Payment verification failed", statusCode);
  }
};

export const retryCheckout = async (userId, orderId) => {
  if (!isFlutterwaveV3Configured()) {
    throw createError("Online payments are not configured", 503);
  }

  const order = await OrderRepository.findOne({
    _id: orderId,
    user: userId,
    paymentMethod: "card",
    paymentStatus: "pending",
    orderStatus: { $ne: "cancelled" },
  });

  if (!order) {
    throw createError("No pending online order found to retry", 404);
  }

  const txRef = generatePaymentReference("ORD");
  const user = await UserRepository.findById(userId, "email name");

  try {
    const checkout = await initiateStandardCheckout({
      txRef,
      amount: order.total,
      currency: appConfig.payment.currency,
      redirectUrl: buildRedirectUrl(),
      customer: {
        email: user?.email,
        phonenumber: order.shippingAddress?.mobileNumber,
        name: order.shippingAddress?.fullName || user?.name,
      },
      customizations: {
        title: "NileCart",
        description: `Order ${order.orderNumber}`,
      },
      paymentOptions: appConfig.payment.options,
      meta: {
        order_id: String(order._id),
        order_number: order.orderNumber,
        user_id: String(userId),
        retry: true,
      },
    });

    order.flutterwave = {
      ...order.flutterwave?.toObject?.() ?? order.flutterwave ?? {},
      txRef,
      checkoutUrl: checkout.link,
      currency: appConfig.payment.currency,
    };
    // Allow a fresh F5 reminder window for the new checkout session
    if (order.flutterwave.paymentReminderSentAt) {
      order.flutterwave.paymentReminderSentAt = undefined;
    }
    order.markModified("flutterwave");
    await order.save();

    await PaymentEmail.notifyPaymentRetry(order);

    return {
      order: formatOrderForClient(order),
      checkoutUrl: checkout.link,
      txRef,
    };
  } catch (err) {
    const statusCode = err instanceof FlutterwaveServiceError ? err.statusCode : 502;
    throw createError(err.message || "Could not retry payment", statusCode);
  }
};

export const getPaymentConfig = async () => ({
  currency: appConfig.payment.currency,
  currencySymbol: appConfig.payment.currencySymbol,
  onlinePaymentsEnabled: isFlutterwaveV3Configured(),
  capabilities: getFlutterwaveCapabilities(),
  paymentOptions: appConfig.payment.options.split(","),
});

export const handleFlutterwaveWebhook = async (payload) => {
  const eventType = payload?.event || payload?.type;
  const data = payload?.data;

  if (!eventType || !data) {
    return { __rawResponse: true, status: 200, body: { received: true, ignored: true } };
  }

  const txRef = data.tx_ref || data.reference;
  const transactionId = data.id != null ? String(data.id) : undefined;
  const webhookId = payload.id || payload.webhook_id;

  const { duplicate } = await recordWebhookEvent({
    eventId: webhookId,
    eventType,
    txRef,
    transactionId,
    payload,
  });

  if (duplicate) {
    return { __rawResponse: true, status: 200, body: { received: true, duplicate: true } };
  }

  const completedEvents = new Set(["charge.completed", "charge.succeeded"]);
  if (!completedEvents.has(eventType)) {
    return {
      __rawResponse: true,
      status: 200,
      body: { received: true, event: eventType, handled: false },
    };
  }

  const order = await findOrderByPaymentReference(txRef);
  if (!order) {
    console.warn(`[webhook] No order for tx_ref=${txRef}`);
    return { __rawResponse: true, status: 200, body: { received: true, orderFound: false } };
  }

  try {
    let verification = { data };

    if (transactionId && isFlutterwaveV3Configured()) {
      try {
        verification = await verifyTransaction(transactionId);
      } catch (verifyErr) {
        console.warn("[webhook] Server verify fallback to payload:", verifyErr.message);
      }
    }

    await applyPaymentVerification(order, verification, "webhook");
    return { __rawResponse: true, status: 200, body: { received: true, handled: true } };
  } catch (err) {
    console.error("[webhook] Processing error:", err.message);

    if (err.statusCode === 409) {
      return { __rawResponse: true, status: 200, body: { received: true, pending: true } };
    }

    return { __rawResponse: true, status: 200, body: { received: true, error: err.message } };
  }
};
