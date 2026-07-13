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

const money = (amount, currency = "") => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return currency ? `${currency} ${n.toLocaleString("en-US")}` : String(n);
};

/**
 * Cancellation → Customer
 */
export const buildOrderCancelledCustomerEmail = (data = {}) => {
  const {
    customerName = "Customer",
    orderNumber = "—",
    cancelReason,
    cancelledBy = "customer",
    total,
    currency = "",
    items = [],
    cancelledAt = new Date(),
    orderUrl,
  } = data;

  const html = Layout({
    title: `Order ${orderNumber} cancelled`,
    preheader: `Order ${orderNumber} has been cancelled`,
    children: `
      ${StatusBadge({ label: "Cancelled", tone: "danger" })}
      ${Heading({ children: `Order cancelled` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(customerName)}, order <strong>${escapeHtml(orderNumber)}</strong> on ${escapeHtml(brand.name)} has been cancelled.`,
      })}
      ${AlertBox({
        tone: "danger",
        title: cancelledBy === "payment" ? "Payment unsuccessful" : "Cancellation confirmed",
        body: cancelReason
          ? escapeHtml(cancelReason)
          : `This order was cancelled${cancelledBy === "admin" ? " by our team" : ""}.`,
      })}
      ${Card({
        children: `
          ${InfoTable({
            rows: [
              { label: "Order", value: orderNumber },
              ...(total != null
                ? [{ label: "Amount", value: money(total, currency) }]
                : []),
              { label: "Cancelled", value: formatDate(cancelledAt) },
            ],
          })}
          ${items.length ? OrderItemsTable({ items, currency }) : ""}
        `,
      })}
      ${
        orderUrl
          ? Button({ href: orderUrl, label: "View order details", variant: "outline" })
          : ""
      }
      ${Paragraph({
        children: `If you have questions, contact <a href="mailto:${defaults.supportEmail}">${defaults.supportEmail}</a>.`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Hi ${customerName},`,
      `Order ${orderNumber} cancelled.`,
      cancelReason ? `Reason: ${cancelReason}` : null,
      orderUrl ? `View: ${orderUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};

/**
 * Cancellation → Seller
 */
export const buildOrderCancelledSellerEmail = (data = {}) => {
  const {
    sellerName = "Seller",
    storeName = "Your store",
    orderNumber = "—",
    cancelReason,
    items = [],
    currency = "",
    cancelledAt = new Date(),
    sellerOrderUrl,
  } = data;

  const html = Layout({
    title: `Order ${orderNumber} cancelled`,
    preheader: `Stop fulfillment — order ${orderNumber} cancelled`,
    children: `
      ${StatusBadge({ label: "Cancelled", tone: "danger" })}
      ${Heading({ children: `Order cancelled — stop fulfillment` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}, order <strong>${escapeHtml(orderNumber)}</strong> for <strong>${escapeHtml(storeName)}</strong> was cancelled. Do not ship these items.`,
      })}
      ${
        cancelReason
          ? AlertBox({
              tone: "danger",
              title: "Reason",
              body: escapeHtml(cancelReason),
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
          ${OrderItemsTable({ items, currency })}
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
      `Order ${orderNumber} cancelled — stop fulfillment.`,
      cancelReason ? `Reason: ${cancelReason}` : null,
      sellerOrderUrl ? `Dashboard: ${sellerOrderUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
