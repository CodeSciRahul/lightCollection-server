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

const STATUS_COPY = {
  confirmed: {
    badge: "Confirmed",
    tone: "success",
    heading: "We’re preparing your order",
    body: "Your payment is confirmed and the seller is preparing your items.",
  },
  packed: {
    badge: "Packed",
    tone: "info",
    heading: "Your order is packed",
    body: "Your items are packed and will ship soon.",
  },
  shipped: {
    badge: "Shipped",
    tone: "info",
    heading: "Your order has shipped",
    body: "Your package is on the way. We’ll update you when it’s out for delivery.",
  },
  out_for_delivery: {
    badge: "Out for delivery",
    tone: "warning",
    heading: "Out for delivery",
    body: "Your order is out for delivery today. Please keep your phone nearby.",
  },
  delivered: {
    badge: "Delivered",
    tone: "success",
    heading: "Delivered — enjoy your order",
    body: "Your order was marked as delivered. We hope you love it.",
  },
};

/**
 * E5–E10 — Order status update → Customer
 */
export const buildOrderStatusCustomerEmail = (data = {}) => {
  const {
    status = "confirmed",
    customerName = "Customer",
    orderNumber = "—",
    note,
    items = [],
    currency = "",
    updatedAt = new Date(),
    orderUrl,
    trackingUrl,
  } = data;

  const copy = STATUS_COPY[status] || {
    badge: status,
    tone: "info",
    heading: `Order update: ${status}`,
    body: `Your order status is now ${status}.`,
  };

  const preheader = `Order ${orderNumber}: ${copy.badge}`;

  const html = Layout({
    title: `Order ${orderNumber} — ${copy.badge}`,
    preheader,
    children: `
      ${StatusBadge({ label: copy.badge, tone: copy.tone })}
      ${Heading({ children: escapeHtml(copy.heading) })}
      ${Paragraph({
        children: `Hi ${escapeHtml(customerName)}, ${escapeHtml(copy.body)}`,
      })}
      ${
        note
          ? AlertBox({
              tone: "info",
              title: "Update note",
              body: escapeHtml(note),
            })
          : ""
      }
      ${Card({
        children: `
          ${InfoTable({
            rows: [
              { label: "Order", value: orderNumber },
              { label: "Status", value: copy.badge },
              { label: "Updated", value: formatDate(updatedAt) },
            ],
          })}
          ${items.length ? OrderItemsTable({ items, currency }) : ""}
        `,
      })}
      ${
        trackingUrl
          ? Button({ href: trackingUrl, label: "Track shipment", variant: "primary" })
          : orderUrl
            ? Button({ href: orderUrl, label: "View order", variant: "primary" })
            : ""
      }
      ${
        status === "delivered"
          ? Paragraph({
              children: `If anything’s wrong, contact <a href="mailto:${defaults.supportEmail}">${defaults.supportEmail}</a> promptly.`,
              muted: true,
            })
          : Paragraph({
              children: `Need help? <a href="mailto:${defaults.supportEmail}">${defaults.supportEmail}</a>`,
              muted: true,
            })
      }
    `,
  });

  return {
    html,
    text: [
      `Hi ${customerName},`,
      ``,
      `Order ${orderNumber} status: ${copy.badge}`,
      copy.body,
      note ? `Note: ${note}` : null,
      orderUrl ? `View: ${orderUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};

/**
 * E11 — Delivered → Seller
 */
export const buildOrderDeliveredSellerEmail = (data = {}) => {
  const {
    sellerName = "Seller",
    storeName = "Your store",
    orderNumber = "—",
    items = [],
    currency = "",
    deliveredAt = new Date(),
    sellerOrderUrl,
  } = data;

  const html = Layout({
    title: `Order ${orderNumber} delivered`,
    preheader: `Order ${orderNumber} marked delivered`,
    children: `
      ${StatusBadge({ label: "Delivered", tone: "success" })}
      ${Heading({ children: `Order delivered` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}, order <strong>${escapeHtml(orderNumber)}</strong> for <strong>${escapeHtml(storeName)}</strong> is marked delivered.`,
      })}
      ${Card({
        children: `
          ${InfoTable({
            rows: [
              { label: "Order", value: orderNumber },
              { label: "Delivered", value: formatDate(deliveredAt) },
            ],
          })}
          ${OrderItemsTable({ items, currency })}
        `,
      })}
      ${
        sellerOrderUrl
          ? Button({
              href: sellerOrderUrl,
              label: "View order",
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
      `Order ${orderNumber} delivered.`,
      sellerOrderUrl ? `View: ${sellerOrderUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
