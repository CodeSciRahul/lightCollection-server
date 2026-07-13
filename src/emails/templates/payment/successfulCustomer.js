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

/** F1 — Payment successful → Customer (receipt) */
export const buildPaymentSuccessCustomerEmail = (data = {}) => {
  const {
    customerName = "Customer",
    orderNumber = "—",
    amount,
    currency = "",
    channel,
    txRef,
    transactionId,
    paidAt = new Date(),
    items = [],
    orderUrl,
  } = data;

  const html = Layout({
    title: `Payment received — ${orderNumber}`,
    preheader: `Payment received for order ${orderNumber}`,
    children: `
      ${StatusBadge({ label: "Paid", tone: "success" })}
      ${Heading({ children: `Payment received` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(customerName)}, we’ve received your payment for order <strong>${escapeHtml(orderNumber)}</strong> on ${escapeHtml(brand.name)}.`,
      })}
      ${AlertBox({
        tone: "success",
        title: "Receipt",
        body: `Amount paid: <strong>${escapeHtml(money(amount, currency))}</strong>. Your order is confirmed and being prepared.`,
      })}
      ${Card({
        children: `
          ${InfoTable({
            rows: [
              { label: "Order", value: orderNumber },
              { label: "Amount", value: money(amount, currency) },
              ...(channel ? [{ label: "Method", value: String(channel) }] : []),
              ...(txRef ? [{ label: "Reference", value: String(txRef) }] : []),
              ...(transactionId
                ? [{ label: "Transaction ID", value: String(transactionId) }]
                : []),
              { label: "Paid at", value: formatDate(paidAt) },
            ],
          })}
          ${items.length ? `${Divider({ margin: "8px 0 4px" })}${OrderItemsTable({ items, currency })}` : ""}
        `,
      })}
      ${
        orderUrl
          ? Button({ href: orderUrl, label: "View order", variant: "primary" })
          : ""
      }
      ${Paragraph({
        children: `Questions about this charge? Contact <a href="mailto:${defaults.supportEmail}">${defaults.supportEmail}</a>.`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Hi ${customerName},`,
      `Payment received for order ${orderNumber}.`,
      `Amount: ${money(amount, currency)}`,
      txRef ? `Reference: ${txRef}` : null,
      orderUrl ? `View: ${orderUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
