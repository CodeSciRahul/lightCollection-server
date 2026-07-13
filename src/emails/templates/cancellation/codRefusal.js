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
  OrderItemsTable,
} from "../../components/index.js";

/**
 * G6 — COD refusal / failed delivery attempt (future RTO) → Customer or Seller
 * Same template; copy adapts via `audience`.
 */
export const buildCodRefusalEmail = (data = {}) => {
  const {
    audience = "customer",
    recipientName = audience === "seller" ? "Seller" : "Customer",
    storeName,
    orderNumber = "—",
    attemptNumber = 1,
    failureReason = "Customer refused delivery / not available",
    attemptedAt = new Date(),
    items = [],
    currency = "",
    orderUrl,
    sellerOrderUrl,
    rescheduleUrl,
  } = data;

  const isSeller = audience === "seller";

  const html = Layout({
    title: `Delivery attempt failed — ${orderNumber}`,
    preheader: `Delivery attempt failed for ${orderNumber}`,
    children: `
      ${StatusBadge({ label: "Delivery failed", tone: "warning" })}
      ${Heading({ children: `Delivery attempt failed` })}
      ${Paragraph({
        children: isSeller
          ? `Hi ${escapeHtml(recipientName)}${
              storeName ? ` (${escapeHtml(storeName)})` : ""
            }, a delivery attempt for order <strong>${escapeHtml(orderNumber)}</strong> was unsuccessful.`
          : `Hi ${escapeHtml(recipientName)}, we couldn’t complete delivery for order <strong>${escapeHtml(orderNumber)}</strong> on ${escapeHtml(brand.name)}.`,
      })}
      ${AlertBox({
        tone: "warning",
        title: isSeller ? "Return to origin (RTO) may follow" : "What this means",
        body: isSeller
          ? `If the shipment returns, stock and payout adjustments may apply. Wait for ops confirmation before restocking returned units.`
          : `We’ll try again or arrange a return. You can reschedule where available, or contact support for help.`,
      })}
      ${Card({
        children: `
          ${InfoTable({
            rows: [
              { label: "Order", value: orderNumber },
              { label: "Attempt", value: String(attemptNumber) },
              { label: "Reason", value: failureReason },
              { label: "Attempted", value: formatDate(attemptedAt) },
            ],
          })}
          ${items.length ? OrderItemsTable({ items, currency }) : ""}
        `,
      })}
      ${
        isSeller
          ? sellerOrderUrl
            ? Button({
                href: sellerOrderUrl,
                label: "View order",
                variant: "secondary",
              })
            : ""
          : rescheduleUrl || orderUrl
            ? Button({
                href: rescheduleUrl || orderUrl,
                label: rescheduleUrl ? "Reschedule delivery" : "View order",
                variant: "primary",
              })
            : ""
      }
      ${Paragraph({
        children: isSeller
          ? `Questions? <a href="mailto:${defaults.sellerEmail}">${defaults.sellerEmail}</a>`
          : `Need help? <a href="mailto:${defaults.supportEmail}">${defaults.supportEmail}</a>`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Hi ${recipientName},`,
      `Delivery attempt failed for ${orderNumber}.`,
      `Reason: ${failureReason}`,
      `Attempt #${attemptNumber}`,
      isSeller
        ? sellerOrderUrl
          ? `Dashboard: ${sellerOrderUrl}`
          : null
        : orderUrl
          ? `Order: ${orderUrl}`
          : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
