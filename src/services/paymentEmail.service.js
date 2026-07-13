import { appConfig } from "../config/index.js";
import { sendPaymentEmail } from "./email.service.js";
import { groupOrderItemsBySeller } from "./orderEmail.service.js";
import * as UserRepository from "../repositories/user.repository.js";
import * as OrderRepository from "../repositories/order.repository.js";

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

const reminderMinutes = () => {
  const n = Number(appConfig.payment?.pendingReminderMinutes);
  return Number.isFinite(n) && n > 0 ? n : 30;
};

const safeSend = async (label, fn) => {
  try {
    return await fn();
  } catch (error) {
    console.error(`[paymentEmail] ${label} failed:`, error.message || error);
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
  payUrl:
    order.flutterwave?.checkoutUrl ||
    joinUrl(storefrontBase(), `/checkout/payment?orderId=${order._id}`),
  retryUrl: joinUrl(
    storefrontBase(),
    `/checkout/payment/retry?orderId=${order._id}`
  ),
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

const adminRecipients = () => {
  if (appConfig.email?.adminNotifyEmails?.length) {
    return appConfig.email.adminNotifyEmails;
  }
  return appConfig.admin?.email ? [appConfig.admin.email] : [];
};

/** F1 + F2 — payment successful */
export const notifyPaymentSuccessful = async (order) => {
  if (!order) return { sent: false };

  const customer = await resolveCustomer(order);
  const urls = customerUrls(order);
  const results = {};
  const paidAt = order.flutterwave?.paidAt || new Date();

  if (customer.email) {
    results.customer = await safeSend("F1", () =>
      sendPaymentEmail("PAYMENT_SUCCESS_CUSTOMER", {
        to: customer.email,
        data: {
          customerName: customer.name,
          orderNumber: order.orderNumber,
          amount: order.total,
          currency: currency(),
          channel: order.flutterwave?.channel,
          txRef: order.flutterwave?.txRef,
          transactionId: order.flutterwave?.transactionId,
          paidAt,
          items: mapItems(order.items),
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
    const result = await safeSend("F2", () =>
      sendPaymentEmail("PAYMENT_SUCCESS_SELLER", {
        to,
        data: {
          sellerName: seller.user?.name || seller.storeName || "Seller",
          storeName: seller.storeName,
          orderNumber: order.orderNumber,
          items: mapItems(items),
          currency: currency(),
          paidAt,
          sellerOrderUrl: sellerOrderUrl(order._id),
        },
      })
    );
    results.sellers.push({ sellerId: String(seller._id), ...result });
  }

  return results;
};

/**
 * F3 + F4 — payment failed / cancelled at gateway.
 * When order is cancelled + stock restored, sellers get F4.
 */
export const notifyPaymentFailed = async (
  order,
  { reason, orderCancelled = true, allowRetry = false } = {}
) => {
  if (!order) return { sent: false };

  const customer = await resolveCustomer(order);
  const urls = customerUrls(order);
  const results = {};

  if (customer.email) {
    results.customer = await safeSend("F3", () =>
      sendPaymentEmail("PAYMENT_FAILED_CUSTOMER", {
        to: customer.email,
        data: {
          customerName: customer.name,
          orderNumber: order.orderNumber,
          amount: order.total,
          currency: currency(),
          reason: reason || order.cancelReason,
          failedAt: order.cancelledAt || new Date(),
          orderCancelled,
          retryUrl: allowRetry && !orderCancelled ? urls.retryUrl : urls.payUrl,
          orderUrl: urls.orderUrl,
        },
      })
    );
  }

  if (orderCancelled) {
    const sellerGroups = await groupOrderItemsBySeller(order);
    results.sellers = [];
    for (const { seller, items } of sellerGroups) {
      const to = seller.user?.email;
      if (!to) continue;
      const result = await safeSend("F4", () =>
        sendPaymentEmail("PAYMENT_FAILED_SELLER", {
          to,
          data: {
            sellerName: seller.user?.name || seller.storeName || "Seller",
            storeName: seller.storeName,
            orderNumber: order.orderNumber,
            reason: reason || order.cancelReason,
            items: mapItems(items),
            currency: currency(),
            cancelledAt: order.cancelledAt || new Date(),
            sellerOrderUrl: sellerOrderUrl(order._id),
          },
        })
      );
      results.sellers.push({ sellerId: String(seller._id), ...result });
    }
  }

  return results;
};

/** F5 — pending payment reminder */
export const notifyPaymentPendingReminder = async (order) => {
  if (!order) return { sent: false };

  const customer = await resolveCustomer(order);
  if (!customer.email) return { sent: false, reason: "missing_email" };

  const urls = customerUrls(order);
  return safeSend("F5", () =>
    sendPaymentEmail("PAYMENT_PENDING_REMINDER", {
      to: customer.email,
      data: {
        customerName: customer.name,
        orderNumber: order.orderNumber,
        amount: order.total,
        currency: currency(),
        placedAt: order.createdAt,
        reminderMinutes: reminderMinutes(),
        ...urls,
      },
    })
  );
};

/** F6 — retry checkout session created */
export const notifyPaymentRetry = async (order) => {
  if (!order) return { sent: false };

  const customer = await resolveCustomer(order);
  if (!customer.email) return { sent: false, reason: "missing_email" };

  return safeSend("F6", () =>
    sendPaymentEmail("PAYMENT_RETRY", {
      to: customer.email,
      data: {
        customerName: customer.name,
        orderNumber: order.orderNumber,
        amount: order.total,
        currency: currency(),
        checkoutUrl: order.flutterwave?.checkoutUrl,
        txRef: order.flutterwave?.txRef,
        createdAt: new Date(),
      },
    })
  );
};

/** F7 — verification mismatch → admin/ops */
export const notifyPaymentMismatch = async ({
  order,
  txRef,
  expectedAmount,
  receivedAmount,
  mismatchType = "amount",
  source = "system",
  details,
} = {}) => {
  const recipients = adminRecipients();
  if (!recipients.length) return { sent: false, reason: "no_admin_recipients" };

  return safeSend("F7", () =>
    sendPaymentEmail("PAYMENT_MISMATCH_ADMIN", {
      to: recipients,
      data: {
        orderNumber: order?.orderNumber,
        orderId: order?._id ? String(order._id) : undefined,
        txRef: txRef || order?.flutterwave?.txRef,
        expectedAmount:
          expectedAmount != null ? expectedAmount : order?.total,
        receivedAmount,
        currency: currency(),
        mismatchType,
        source,
        details,
        detectedAt: new Date(),
      },
    })
  );
};

/** F8 — future helper */
export const notifyPaymentAdjustment = async (order, payload = {}) => {
  const customer = await resolveCustomer(order);
  if (!customer.email) return { sent: false, reason: "missing_email" };
  const urls = customerUrls(order);

  return safeSend("F8", () =>
    sendPaymentEmail("PAYMENT_ADJUSTMENT", {
      to: customer.email,
      data: {
        customerName: customer.name,
        orderNumber: order.orderNumber,
        ...payload,
        currency: payload.currency || currency(),
        ...urls,
      },
    })
  );
};

/** F9 — future helper */
export const notifySellerPayout = async (seller, payload = {}) => {
  const to = seller?.user?.email || seller?.email;
  if (!to) return { sent: false, reason: "missing_email" };

  return safeSend("F9", () =>
    sendPaymentEmail("SELLER_PAYOUT", {
      to,
      data: {
        sellerName: seller.user?.name || seller.storeName || "Seller",
        storeName: seller.storeName,
        ...payload,
        currency: payload.currency || currency(),
      },
    })
  );
};

/** F10 — future helper */
export const notifyPayoutFailed = async (seller, payload = {}) => {
  const to = seller?.user?.email || seller?.email;
  if (!to) return { sent: false, reason: "missing_email" };

  return safeSend("F10", () =>
    sendPaymentEmail("PAYOUT_FAILED", {
      to,
      data: {
        sellerName: seller.user?.name || seller.storeName || "Seller",
        storeName: seller.storeName,
        bankUrl: joinUrl(dashboardBase(), "/seller/profile"),
        ...payload,
        currency: payload.currency || currency(),
      },
    })
  );
};

/** F11 — future helper */
export const notifyCommissionStatement = async (seller, payload = {}) => {
  const to = seller?.user?.email || seller?.email;
  if (!to) return { sent: false, reason: "missing_email" };

  return safeSend("F11", () =>
    sendPaymentEmail("COMMISSION_STATEMENT", {
      to,
      data: {
        sellerName: seller.user?.name || seller.storeName || "Seller",
        storeName: seller.storeName,
        commissionRate: seller.commissionRate,
        ...payload,
        currency: payload.currency || currency(),
      },
    })
  );
};

/**
 * Scan pending card checkouts and send F5 once per order after N minutes.
 */
export const processPendingPaymentReminders = async () => {
  const minutes = reminderMinutes();
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);

  const orders = await OrderRepository.find({
    paymentMethod: "card",
    paymentStatus: "pending",
    orderStatus: "placed",
    createdAt: { $lte: cutoff },
    "flutterwave.paymentReminderSentAt": { $exists: false },
  }).limit(50);

  const results = [];
  for (const order of orders) {
    const sendResult = await notifyPaymentPendingReminder(order);
    order.flutterwave = {
      ...order.flutterwave?.toObject?.() ?? order.flutterwave ?? {},
      paymentReminderSentAt: new Date(),
    };
    await order.save();
    results.push({ orderId: String(order._id), ...sendResult });
  }

  return { scanned: orders.length, results, reminderMinutes: minutes };
};
