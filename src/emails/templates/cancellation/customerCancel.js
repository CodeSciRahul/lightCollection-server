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

/** G1 — Customer cancels → Customer */
export const buildCancelCustomerConfirmedEmail = (data = {}) => {
  const {
    customerName = "Customer",
    orderNumber = "—",
    cancelReason,
    total,
    currency = "",
    paymentMethod,
    paymentStatus,
    refundEligible = false,
    items = [],
    cancelledAt = new Date(),
    orderUrl,
    supportUrl,
  } = data;

  const html = Layout({
    title: `Order ${orderNumber} cancelled`,
    preheader: `Order ${orderNumber} cancelled`,
    supportEmail: defaults.returnsEmail,
    children: `
      ${StatusBadge({ label: "Cancelled", tone: "danger" })}
      ${Heading({ children: `Your order is cancelled` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(customerName)}, we’ve cancelled order <strong>${escapeHtml(orderNumber)}</strong> on ${escapeHtml(brand.name)} as requested.`,
      })}
      ${AlertBox({
        tone: "info",
        title: refundEligible
          ? "Refund path"
          : paymentMethod === "cod"
            ? "No payment was collected"
            : "Cancellation confirmed",
        body: refundEligible
          ? `If a payment was captured, a refund will be processed to your original payment method. You’ll receive a separate confirmation when it completes.`
          : paymentMethod === "cod"
            ? `Since this was cash on delivery, no charge was made. Inventory has been released.`
            : cancelReason
              ? escapeHtml(cancelReason)
              : `Your cancellation is complete. Inventory has been released.`,
      })}
      ${Card({
        children: `
          ${InfoTable({
            rows: [
              { label: "Order", value: orderNumber },
              ...(total != null
                ? [{ label: "Amount", value: money(total, currency) }]
                : []),
              ...(paymentMethod
                ? [
                    {
                      label: "Payment",
                      value:
                        paymentMethod === "cod"
                          ? "Cash on delivery"
                          : `Card (${paymentStatus || "n/a"})`,
                    },
                  ]
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
          ? Button({ href: orderUrl, label: "View order", variant: "outline" })
          : ""
      }
      ${Paragraph({
        children: `Need help? <a href="mailto:${defaults.returnsEmail}">${defaults.returnsEmail}</a>${
          supportUrl ? ` or <a href="${escapeHtml(supportUrl)}">visit support</a>` : ""
        }.`,
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
      refundEligible
        ? `If payment was captured, a refund will follow separately.`
        : null,
      orderUrl ? `View: ${orderUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};

/** G2 — Customer cancels → Seller */
export const buildCancelCustomerToSellerEmail = (data = {}) => {
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
    title: `Order ${orderNumber} cancelled by customer`,
    preheader: `Order ${orderNumber} was cancelled by customer`,
    children: `
      ${StatusBadge({ label: "Stop fulfillment", tone: "danger" })}
      ${Heading({ children: `Order cancelled by customer` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}, the customer cancelled order <strong>${escapeHtml(orderNumber)}</strong> for <strong>${escapeHtml(storeName)}</strong>. Do not ship these items — stock has been restored.`,
      })}
      ${
        cancelReason
          ? AlertBox({
              tone: "info",
              title: "Customer reason",
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
      `Order ${orderNumber} was cancelled by customer.`,
      `Stop fulfillment. Stock restored.`,
      cancelReason ? `Reason: ${cancelReason}` : null,
      sellerOrderUrl ? `Dashboard: ${sellerOrderUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
