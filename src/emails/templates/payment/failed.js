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

/** F3 — Payment failed → Customer */
export const buildPaymentFailedCustomerEmail = (data = {}) => {
  const {
    customerName = "Customer",
    orderNumber = "—",
    amount,
    currency = "",
    reason,
    failedAt = new Date(),
    orderCancelled = true,
    retryUrl,
    orderUrl,
  } = data;

  const html = Layout({
    title: `Payment failed — ${orderNumber}`,
    preheader: `Payment failed for order ${orderNumber}`,
    children: `
      ${StatusBadge({ label: "Payment failed", tone: "danger" })}
      ${Heading({ children: `Payment unsuccessful` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(customerName)}, we couldn’t complete payment for order <strong>${escapeHtml(orderNumber)}</strong> on ${escapeHtml(brand.name)}.`,
      })}
      ${AlertBox({
        tone: "danger",
        title: orderCancelled ? "Order cancelled" : "Try again",
        body: reason
          ? escapeHtml(reason)
          : orderCancelled
            ? `Your order was cancelled and reserved stock was released. You can place a new order anytime.`
            : `Your payment didn’t go through. You can retry with another method.`,
      })}
      ${Card({
        children: InfoTable({
          rows: [
            { label: "Order", value: orderNumber },
            ...(amount != null
              ? [{ label: "Amount", value: money(amount, currency) }]
              : []),
            { label: "Failed at", value: formatDate(failedAt) },
          ],
        }),
      })}
      ${
        retryUrl
          ? Button({ href: retryUrl, label: "Retry payment", variant: "primary" })
          : orderUrl
            ? Button({ href: orderUrl, label: "View order", variant: "outline" })
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
      `Payment failed for order ${orderNumber}.`,
      reason ? `Reason: ${reason}` : null,
      retryUrl ? `Retry: ${retryUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};

/** F4 — Payment failed / order cancelled → Seller */
export const buildPaymentFailedSellerEmail = (data = {}) => {
  const {
    sellerName = "Seller",
    storeName = "Your store",
    orderNumber = "—",
    reason,
    items = [],
    currency = "",
    cancelledAt = new Date(),
    sellerOrderUrl,
  } = data;

  const html = Layout({
    title: `Order ${orderNumber} cancelled — payment`,
    preheader: `Order ${orderNumber} cancelled — payment unsuccessful`,
    children: `
      ${StatusBadge({ label: "Do not ship", tone: "danger" })}
      ${Heading({ children: `Order cancelled — payment unsuccessful` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}, order <strong>${escapeHtml(orderNumber)}</strong> for <strong>${escapeHtml(storeName)}</strong> was cancelled because payment failed. Stock for your items has been restored.`,
      })}
      ${
        reason
          ? AlertBox({
              tone: "danger",
              title: "Reason",
              body: escapeHtml(reason),
            })
          : ""
      }
      ${Card({
        children: `
          ${InfoTable({
            rows: [
              { label: "Order", value: orderNumber },
              { label: "Cancelled", value: formatDate(cancelledAt) },
            ],
          })}
          ${
            items.length
              ? `<p style="margin:12px 0 0;font-size:14px;font-weight:700;">Affected items</p>
                 <ul style="margin:8px 0 0;padding-left:18px;">
                   ${items
                     .map(
                       (i) =>
                         `<li style="margin-bottom:4px;">${escapeHtml(i.title)} ×${escapeHtml(String(i.quantity))}${
                           i.price != null
                             ? ` (${escapeHtml(money(i.price * i.quantity, currency))})`
                             : ""
                         }</li>`
                     )
                     .join("")}
                 </ul>`
              : ""
          }
        `,
      })}
      ${
        sellerOrderUrl
          ? Button({
              href: sellerOrderUrl,
              label: "View in dashboard",
              variant: "secondary",
            })
          : ""
      }
    `,
  });

  return {
    html,
    text: [
      `Hi ${sellerName},`,
      `Order ${orderNumber} cancelled — payment unsuccessful.`,
      reason ? `Reason: ${reason}` : null,
      `Do not ship. Stock restored.`,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
