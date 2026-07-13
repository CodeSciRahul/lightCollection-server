import { brand, defaults } from "../../design/tokens.js";
import { escapeHtml, formatDate } from "../../design/utils.js";
import {
  Layout,
  Heading,
  Paragraph,
  Button,
  Card,
  StatusBadge,
  InfoTable,
  AlertBox,
} from "../../components/index.js";

const money = (amount, currency = "") => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return currency ? `${currency} ${n.toLocaleString("en-US")}` : String(n);
};

/** F5 — Payment pending reminder → Customer */
export const buildPaymentPendingReminderEmail = (data = {}) => {
  const {
    customerName = "Customer",
    orderNumber = "—",
    amount,
    currency = "",
    placedAt,
    reminderMinutes,
    payUrl,
    orderUrl,
  } = data;

  const html = Layout({
    title: `Complete payment — ${orderNumber}`,
    preheader: `Reminder: complete payment for ${orderNumber}`,
    children: `
      ${StatusBadge({ label: "Payment pending", tone: "warning" })}
      ${Heading({ children: `Complete your payment` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(customerName)}, your ${escapeHtml(brand.name)} order <strong>${escapeHtml(orderNumber)}</strong> is still waiting for payment.`,
      })}
      ${AlertBox({
        tone: "warning",
        title: "Stock is reserved temporarily",
        body: reminderMinutes
          ? `You started checkout about ${escapeHtml(String(reminderMinutes))} minutes ago. Complete payment soon to keep your items.`
          : `Complete payment soon to keep your items reserved.`,
      })}
      ${Card({
        children: InfoTable({
          rows: [
            { label: "Order", value: orderNumber },
            ...(amount != null
              ? [{ label: "Amount due", value: money(amount, currency) }]
              : []),
            ...(placedAt
              ? [{ label: "Started", value: formatDate(placedAt) }]
              : []),
          ],
        }),
      })}
      ${
        payUrl
          ? Button({ href: payUrl, label: "Complete payment", variant: "primary" })
          : ""
      }
      ${
        orderUrl
          ? Paragraph({
              children: `<a href="${escapeHtml(orderUrl)}">View order details</a>`,
              muted: true,
            })
          : ""
      }
      ${Paragraph({
        children: `If you already paid, you can ignore this email — confirmation may take a moment.`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Hi ${customerName},`,
      `Reminder: complete payment for ${orderNumber}.`,
      amount != null ? `Amount: ${money(amount, currency)}` : null,
      payUrl ? `Pay: ${payUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};

/** F6 — Payment retry session → Customer */
export const buildPaymentRetryEmail = (data = {}) => {
  const {
    customerName = "Customer",
    orderNumber = "—",
    amount,
    currency = "",
    checkoutUrl,
    txRef,
    createdAt = new Date(),
  } = data;

  const html = Layout({
    title: `Retry payment — ${orderNumber}`,
    preheader: `Retry payment for order ${orderNumber}`,
    children: `
      ${StatusBadge({ label: "New checkout link", tone: "info" })}
      ${Heading({ children: `Your payment link is ready` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(customerName)}, we’ve created a new secure checkout session for order <strong>${escapeHtml(orderNumber)}</strong>.`,
      })}
      ${AlertBox({
        tone: "info",
        title: "Use this new link",
        body: `Previous payment links for this order may no longer work. Use the button below to complete payment.`,
      })}
      ${Card({
        children: InfoTable({
          rows: [
            { label: "Order", value: orderNumber },
            ...(amount != null
              ? [{ label: "Amount", value: money(amount, currency) }]
              : []),
            ...(txRef ? [{ label: "Reference", value: String(txRef) }] : []),
            { label: "Created", value: formatDate(createdAt) },
          ],
        }),
      })}
      ${
        checkoutUrl
          ? Button({
              href: checkoutUrl,
              label: "Pay now",
              variant: "primary",
            })
          : ""
      }
      ${Paragraph({
        children: `Need help? <a href="mailto:${defaults.supportEmail}">${defaults.supportEmail}</a>`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Hi ${customerName},`,
      `Retry payment for order ${orderNumber}.`,
      amount != null ? `Amount: ${money(amount, currency)}` : null,
      checkoutUrl ? `Pay: ${checkoutUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
