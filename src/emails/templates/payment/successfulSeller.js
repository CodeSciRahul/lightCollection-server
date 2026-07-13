import { defaults } from "../../design/tokens.js";
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

/** F2 — Payment successful → Seller */
export const buildPaymentSuccessSellerEmail = (data = {}) => {
  const {
    sellerName = "Seller",
    storeName = "Your store",
    orderNumber = "—",
    items = [],
    currency = "",
    paidAt = new Date(),
    sellerOrderUrl,
  } = data;

  const html = Layout({
    title: `Paid order ${orderNumber}`,
    preheader: `Paid order ready to ship: ${orderNumber}`,
    children: `
      ${StatusBadge({ label: "Paid — ship now", tone: "success" })}
      ${Heading({ children: `Paid order ready to ship` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}, payment is confirmed for order <strong>${escapeHtml(orderNumber)}</strong> (${escapeHtml(storeName)}). You can fulfill these items now.`,
      })}
      ${AlertBox({
        tone: "success",
        title: "Action required",
        body: `Confirm, pack, and ship as soon as you’re ready. Stock is already reserved.`,
      })}
      ${Card({
        children: `
          ${InfoTable({
            rows: [
              { label: "Order", value: orderNumber },
              { label: "Paid at", value: formatDate(paidAt) },
              {
                label: "Items total",
                value: money(
                  items.reduce(
                    (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0),
                    0
                  ),
                  currency
                ),
              },
            ],
          })}
          ${OrderItemsTable({ items, currency })}
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
      `Paid order ready to ship: ${orderNumber}`,
      `Items: ${items.map((i) => `${i.title} ×${i.quantity}`).join(", ")}`,
      sellerOrderUrl ? `Dashboard: ${sellerOrderUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
