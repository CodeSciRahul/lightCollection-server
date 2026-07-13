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
  Divider,
} from "../../components/index.js";

const money = (amount, currency = "") => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return currency ? `${currency} ${n.toLocaleString("en-US")}` : String(n);
};

/**
 * E2 — Order placed → Seller (their items only)
 */
export const buildOrderPlacedSellerEmail = (data = {}) => {
  const {
    sellerName = "Seller",
    storeName = "Your store",
    orderNumber = "—",
    customerName = "Customer",
    paymentMethod = "cod",
    paymentStatus = "pending",
    items = [],
    itemCount,
    currency = "",
    shippingAddress = {},
    placedAt = new Date(),
    sellerOrderUrl,
  } = data;

  const isPaid = paymentStatus === "paid" || paymentMethod === "cod";
  const preheader = `New order ${orderNumber} — ${itemCount || items.length} item(s) to fulfill`;

  const addressLine = [
    shippingAddress.fullName,
    shippingAddress.addressLine,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.pincode,
    shippingAddress.mobileNumber,
  ]
    .filter(Boolean)
    .join(", ");

  const html = Layout({
    title: `New order ${orderNumber} — ${brand.name}`,
    preheader,
    children: `
      ${StatusBadge({
        label: isPaid ? "Action required" : "Awaiting payment",
        tone: isPaid ? "warning" : "info",
      })}
      ${Heading({ children: `New order to fulfill` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}, <strong>${escapeHtml(storeName)}</strong> received items from order <strong>${escapeHtml(orderNumber)}</strong>.`,
      })}
      ${AlertBox({
        tone: isPaid ? "warning" : "info",
        title: isPaid ? "Ready to prepare" : "Do not ship yet",
        body: isPaid
          ? `Confirm and pack these items when ready. Payment: ${
              paymentMethod === "cod" ? "Cash on delivery" : "Paid online"
            }.`
          : `Online payment is still pending. Wait for confirmation before fulfilling.`,
      })}
      ${Card({
        children: `
          ${OrderItemsTable({ items, currency })}
          ${Divider({ margin: "8px 0 4px" })}
          ${InfoTable({
            rows: [
              { label: "Order", value: orderNumber },
              { label: "Customer", value: customerName },
              { label: "Payment", value: paymentMethod === "cod" ? "COD" : paymentStatus },
              { label: "Placed", value: formatDate(placedAt) },
              ...(addressLine ? [{ label: "Ship to", value: addressLine }] : []),
            ],
          })}
        `,
      })}
      ${
        sellerOrderUrl
          ? Button({
              href: sellerOrderUrl,
              label: "Open order in dashboard",
              variant: "secondary",
            })
          : ""
      }
      ${Paragraph({
        children: `Seller support: <a href="mailto:${defaults.sellerEmail}">${defaults.sellerEmail}</a>.`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Hi ${sellerName},`,
      ``,
      `New order ${orderNumber} for ${storeName}.`,
      `Items: ${items.map((i) => `${i.title} ×${i.quantity}`).join(", ")}`,
      `Payment: ${paymentMethod === "cod" ? "COD" : paymentStatus}`,
      sellerOrderUrl ? `Dashboard: ${sellerOrderUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
