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
 * E1 / E4 — Order placed → Customer
 */
export const buildOrderPlacedCustomerEmail = (data = {}) => {
  const {
    customerName = "Customer",
    orderNumber = "—",
    paymentMethod = "cod",
    paymentStatus = "pending",
    items = [],
    subtotal,
    discount = 0,
    shippingFee = 0,
    total,
    currency = "",
    shippingAddress = {},
    placedAt = new Date(),
    orderUrl,
    payUrl,
  } = data;

  const isCod = paymentMethod === "cod";
  const needsPayment = !isCod && paymentStatus !== "paid";
  const preheader = needsPayment
    ? `Complete payment for order ${orderNumber}`
    : `Order ${orderNumber} placed successfully`;

  const addressLine = [
    shippingAddress.addressLine,
    shippingAddress.locality,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.pincode,
    shippingAddress.country,
  ]
    .filter(Boolean)
    .join(", ");

  const html = Layout({
    title: `Order ${orderNumber} — ${brand.name}`,
    preheader,
    children: `
      ${StatusBadge({
        label: needsPayment ? "Payment pending" : isCod ? "COD placed" : "Order placed",
        tone: needsPayment ? "warning" : "success",
      })}
      ${Heading({
        children: needsPayment
          ? `Complete payment for your order`
          : `Thanks — your order is placed`,
      })}
      ${Paragraph({
        children: `Hi ${escapeHtml(customerName)}, we received order <strong>${escapeHtml(orderNumber)}</strong> on ${escapeHtml(brand.name)}.`,
      })}
      ${
        needsPayment
          ? AlertBox({
              tone: "warning",
              title: "Action needed",
              body: `Your order is reserved. Complete payment to confirm fulfillment.`,
            })
          : isCod
            ? AlertBox({
                tone: "info",
                title: "Cash on delivery",
                body: `Please keep <strong>${escapeHtml(money(total, currency))}</strong> ready for the delivery partner.`,
              })
            : ""
      }
      ${Card({
        children: `
          ${OrderItemsTable({ items, currency })}
          ${Divider({ margin: "8px 0 4px" })}
          ${InfoTable({
            rows: [
              { label: "Subtotal", value: money(subtotal, currency) },
              ...(discount
                ? [{ label: "Discount", value: `−${money(discount, currency)}` }]
                : []),
              { label: "Shipping", value: money(shippingFee, currency) },
              { label: "Total", value: money(total, currency) },
              { label: "Payment", value: isCod ? "Cash on delivery" : "Online payment" },
              { label: "Placed", value: formatDate(placedAt) },
              ...(addressLine ? [{ label: "Ship to", value: addressLine }] : []),
            ],
          })}
        `,
      })}
      ${
        needsPayment && payUrl
          ? Button({ href: payUrl, label: "Complete payment", variant: "primary" })
          : orderUrl
            ? Button({ href: orderUrl, label: "View order", variant: "primary" })
            : ""
      }
      ${Paragraph({
        children: `Questions? Contact <a href="mailto:${defaults.supportEmail}">${defaults.supportEmail}</a>.`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Hi ${customerName},`,
      ``,
      `Order ${orderNumber} placed on ${brand.name}.`,
      `Total: ${money(total, currency)}`,
      `Payment: ${isCod ? "COD" : needsPayment ? "Pending online payment" : "Paid"}`,
      orderUrl ? `View: ${orderUrl}` : null,
      needsPayment && payUrl ? `Pay: ${payUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
