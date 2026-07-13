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
  List,
} from "../../components/index.js";

const money = (amount, currency = "") => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return currency ? `${currency} ${n.toLocaleString("en-US")}` : String(n);
};

/** G3 — Paid card cancel blocked → Customer */
export const buildCancelPaidBlockedEmail = (data = {}) => {
  const {
    customerName = "Customer",
    orderNumber = "—",
    total,
    currency = "",
    orderUrl,
    supportUrl,
    supportEmail = defaults.supportEmail,
  } = data;

  const html = Layout({
    title: `Need to cancel a paid order?`,
    preheader: `Need to cancel a paid order?`,
    supportEmail,
    children: `
      ${StatusBadge({ label: "Contact support", tone: "warning" })}
      ${Heading({ children: `Need to cancel a paid order?` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(customerName)}, paid online orders can’t be cancelled instantly in your account for security and refund-control reasons.`,
      })}
      ${AlertBox({
        tone: "warning",
        title: `Order ${escapeHtml(orderNumber)}`,
        body: `Our support team can help cancel or start a refund if the order hasn’t already shipped.`,
      })}
      ${Card({
        children: InfoTable({
          rows: [
            { label: "Order", value: orderNumber },
            ...(total != null
              ? [{ label: "Amount", value: money(total, currency) }]
              : []),
          ],
        }),
      })}
      ${Paragraph({ children: `<strong>What to do next</strong>` })}
      ${List({
        items: [
          `Email <a href="mailto:${escapeHtml(supportEmail)}?subject=${encodeURIComponent(`Cancel paid order ${orderNumber}`)}">${escapeHtml(supportEmail)}</a> with your order number`,
          "Share why you’d like to cancel",
          "We’ll confirm eligibility and next steps for any refund",
        ],
      })}
      ${
        supportUrl
          ? Button({
              href: supportUrl,
              label: "Open support",
              variant: "primary",
            })
          : Button({
              href: `mailto:${supportEmail}?subject=${encodeURIComponent(`Cancel paid order ${orderNumber}`)}`,
              label: "Email support",
              variant: "primary",
            })
      }
      ${
        orderUrl
          ? Paragraph({
              children: `<a href="${escapeHtml(orderUrl)}">View order ${escapeHtml(orderNumber)}</a>`,
              muted: true,
            })
          : ""
      }
    `,
  });

  return {
    html,
    text: [
      `Hi ${customerName},`,
      `Paid online orders cannot be cancelled in-app.`,
      `Order: ${orderNumber}`,
      `Contact support: ${supportEmail}`,
      supportUrl ? `Support: ${supportUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};

/** G4 — Seller/admin cancels → Customer */
export const buildCancelOpsToCustomerEmail = (data = {}) => {
  const {
    customerName = "Customer",
    orderNumber = "—",
    cancelReason,
    cancelledBy = "admin",
    total,
    currency = "",
    paymentMethod,
    refundEligible = false,
    items = [],
    cancelledAt = new Date(),
    orderUrl,
  } = data;

  const actor = cancelledBy === "seller" ? "the seller" : "our team";

  const html = Layout({
    title: `Order ${orderNumber} was cancelled`,
    preheader: `Order ${orderNumber} was cancelled`,
    children: `
      ${StatusBadge({ label: "Cancelled", tone: "danger" })}
      ${Heading({ children: `Order ${escapeHtml(orderNumber)} was cancelled` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(customerName)}, order <strong>${escapeHtml(orderNumber)}</strong> on ${escapeHtml(brand.name)} was cancelled by ${escapeHtml(actor)}.`,
      })}
      ${AlertBox({
        tone: "danger",
        title: "What happens next",
        body: refundEligible
          ? `If you were charged, a refund will be initiated to your original payment method. You’ll get a separate email when it’s processed.`
          : paymentMethod === "cod"
            ? `No payment was collected for this cash-on-delivery order.`
            : `We’re sorry for the inconvenience. You can browse and place a new order anytime.`,
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
              ...(cancelReason
                ? [{ label: "Reason", value: cancelReason }]
                : []),
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
        children: `Questions? <a href="mailto:${defaults.supportEmail}">${defaults.supportEmail}</a>`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Hi ${customerName},`,
      `Order ${orderNumber} was cancelled by ${actor}.`,
      cancelReason ? `Reason: ${cancelReason}` : null,
      refundEligible ? `A refund will follow if you were charged.` : null,
      orderUrl ? `View: ${orderUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};

/** G5 — Seller/admin cancels → Seller (stock restore confirm) */
export const buildCancelOpsToSellerEmail = (data = {}) => {
  const {
    sellerName = "Seller",
    storeName = "Your store",
    orderNumber = "—",
    cancelReason,
    cancelledBy = "admin",
    stockRestored = true,
    items = [],
    currency = "",
    cancelledAt = new Date(),
    sellerOrderUrl,
  } = data;

  const html = Layout({
    title: `Cancellation processed: ${orderNumber}`,
    preheader: `Cancellation processed: ${orderNumber}`,
    children: `
      ${StatusBadge({
        label: stockRestored ? "Stock restored" : "Cancelled",
        tone: stockRestored ? "info" : "warning",
      })}
      ${Heading({ children: `Cancellation processed` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}, cancellation for order <strong>${escapeHtml(orderNumber)}</strong> (${escapeHtml(storeName)}) has been processed${
          cancelledBy === "admin" ? " by platform admin" : ""
        }.`,
      })}
      ${AlertBox({
        tone: stockRestored ? "success" : "warning",
        title: stockRestored ? "Inventory updated" : "Check inventory",
        body: stockRestored
          ? `Your item quantities for this order have been restored to available stock. Do not ship.`
          : `Please verify inventory levels for the affected SKUs in your dashboard.`,
      })}
      ${Card({
        children: `
          ${InfoTable({
            rows: [
              { label: "Order", value: orderNumber },
              { label: "Cancelled", value: formatDate(cancelledAt) },
              ...(cancelReason
                ? [{ label: "Reason", value: cancelReason }]
                : []),
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
      ${Paragraph({
        children: `Seller support: <a href="mailto:${defaults.sellerEmail}">${defaults.sellerEmail}</a>`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Hi ${sellerName},`,
      `Cancellation processed: ${orderNumber}`,
      stockRestored ? `Stock restored. Do not ship.` : null,
      cancelReason ? `Reason: ${cancelReason}` : null,
      sellerOrderUrl ? `Dashboard: ${sellerOrderUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
