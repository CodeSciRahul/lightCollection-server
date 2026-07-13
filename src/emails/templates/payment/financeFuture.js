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
  List,
} from "../../components/index.js";

const money = (amount, currency = "") => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return currency ? `${currency} ${n.toLocaleString("en-US")}` : String(n);
};

/** F8 — Partial capture / adjustment (future) → Customer */
export const buildPaymentAdjustmentEmail = (data = {}) => {
  const {
    customerName = "Customer",
    orderNumber = "—",
    previousAmount,
    newAmount,
    currency = "",
    reason,
    adjustedAt = new Date(),
    orderUrl,
  } = data;

  const html = Layout({
    title: `Payment adjustment — ${orderNumber}`,
    preheader: `Payment adjustment for order ${orderNumber}`,
    children: `
      ${StatusBadge({ label: "Amount updated", tone: "info" })}
      ${Heading({ children: `Payment adjustment` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(customerName)}, the charged amount for order <strong>${escapeHtml(orderNumber)}</strong> has been adjusted.`,
      })}
      ${
        reason
          ? AlertBox({
              tone: "info",
              title: "Why this changed",
              body: escapeHtml(reason),
            })
          : ""
      }
      ${Card({
        children: InfoTable({
          rows: [
            { label: "Order", value: orderNumber },
            ...(previousAmount != null
              ? [{ label: "Previous", value: money(previousAmount, currency) }]
              : []),
            ...(newAmount != null
              ? [{ label: "Updated amount", value: money(newAmount, currency) }]
              : []),
            { label: "Adjusted", value: formatDate(adjustedAt) },
          ],
        }),
      })}
      ${
        orderUrl
          ? Button({ href: orderUrl, label: "View order", variant: "primary" })
          : ""
      }
    `,
  });

  return {
    html,
    text: [
      `Hi ${customerName},`,
      `Payment adjustment for order ${orderNumber}.`,
      previousAmount != null
        ? `Previous: ${money(previousAmount, currency)}`
        : null,
      newAmount != null ? `New: ${money(newAmount, currency)}` : null,
      reason ? `Reason: ${reason}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};

/** F9 — Seller payout statement (future) */
export const buildSellerPayoutEmail = (data = {}) => {
  const {
    sellerName = "Seller",
    storeName = "Your store",
    period = "this period",
    payoutAmount,
    currency = "",
    payoutDate,
    bankLast4,
    statementUrl,
  } = data;

  const html = Layout({
    title: `Payout — ${period}`,
    preheader: `Your ${brand.name} payout for ${period}`,
    children: `
      ${StatusBadge({ label: "Payout sent", tone: "success" })}
      ${Heading({ children: `Your payout is on the way` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}, a settlement for <strong>${escapeHtml(storeName)}</strong> covering <strong>${escapeHtml(period)}</strong> has been generated.`,
      })}
      ${Card({
        children: InfoTable({
          rows: [
            { label: "Period", value: period },
            ...(payoutAmount != null
              ? [{ label: "Payout", value: money(payoutAmount, currency) }]
              : []),
            ...(payoutDate
              ? [{ label: "Initiated", value: formatDate(payoutDate) }]
              : []),
            ...(bankLast4
              ? [{ label: "Bank account", value: `•••• ${bankLast4}` }]
              : []),
          ],
        }),
      })}
      ${
        statementUrl
          ? Button({
              href: statementUrl,
              label: "Download statement",
              variant: "secondary",
            })
          : ""
      }
      ${Paragraph({
        children: `Finance questions? <a href="mailto:${defaults.sellerEmail}">${defaults.sellerEmail}</a>`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Hi ${sellerName},`,
      `Your ${brand.name} payout for ${period}.`,
      payoutAmount != null
        ? `Amount: ${money(payoutAmount, currency)}`
        : null,
      statementUrl ? `Statement: ${statementUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};

/** F10 — Payout failed (future) */
export const buildPayoutFailedEmail = (data = {}) => {
  const {
    sellerName = "Seller",
    storeName = "Your store",
    period = "this period",
    payoutAmount,
    currency = "",
    failureReason,
    bankUrl,
  } = data;

  const html = Layout({
    title: `Payout failed — action required`,
    preheader: `Action required: payout could not be sent`,
    children: `
      ${StatusBadge({ label: "Action required", tone: "danger" })}
      ${Heading({ children: `We couldn’t send your payout` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}, the payout for <strong>${escapeHtml(storeName)}</strong> (${escapeHtml(period)}) could not be completed.`,
      })}
      ${AlertBox({
        tone: "danger",
        title: "Update your bank details",
        body: failureReason
          ? escapeHtml(failureReason)
          : `Please verify your payout bank account and try again, or contact support.`,
      })}
      ${Card({
        children: InfoTable({
          rows: [
            { label: "Store", value: storeName },
            { label: "Period", value: period },
            ...(payoutAmount != null
              ? [{ label: "Amount", value: money(payoutAmount, currency) }]
              : []),
          ],
        }),
      })}
      ${
        bankUrl
          ? Button({
              href: bankUrl,
              label: "Update bank details",
              variant: "danger",
            })
          : ""
      }
    `,
  });

  return {
    html,
    text: [
      `Hi ${sellerName},`,
      `Payout for ${period} could not be sent.`,
      failureReason ? `Reason: ${failureReason}` : null,
      bankUrl ? `Update bank: ${bankUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};

/** F11 — Commission statement (future) */
export const buildCommissionStatementEmail = (data = {}) => {
  const {
    sellerName = "Seller",
    storeName = "Your store",
    period = "this period",
    grossSales,
    commissionAmount,
    netPayout,
    currency = "",
    commissionRate,
    statementUrl,
  } = data;

  const html = Layout({
    title: `Commission statement — ${period}`,
    preheader: `Commission statement — ${period}`,
    children: `
      ${StatusBadge({ label: "Finance statement", tone: "info" })}
      ${Heading({ children: `Commission statement` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}, here’s your ${escapeHtml(brand.name)} commission summary for <strong>${escapeHtml(storeName)}</strong> — <strong>${escapeHtml(period)}</strong>.`,
      })}
      ${Card({
        children: InfoTable({
          rows: [
            { label: "Period", value: period },
            ...(commissionRate != null
              ? [{ label: "Rate", value: `${commissionRate}%` }]
              : []),
            ...(grossSales != null
              ? [{ label: "Gross sales", value: money(grossSales, currency) }]
              : []),
            ...(commissionAmount != null
              ? [
                  {
                    label: "Commission",
                    value: money(commissionAmount, currency),
                  },
                ]
              : []),
            ...(netPayout != null
              ? [{ label: "Net payout", value: money(netPayout, currency) }]
              : []),
          ],
        }),
      })}
      ${Paragraph({ children: `<strong>Keep for your records</strong>` })}
      ${List({
        items: [
          "This statement is for tax and bookkeeping purposes",
          "Figures exclude any pending disputes or refunds not yet settled",
        ],
      })}
      ${
        statementUrl
          ? Button({
              href: statementUrl,
              label: "Download PDF statement",
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
      `Commission statement — ${period}`,
      grossSales != null ? `Gross: ${money(grossSales, currency)}` : null,
      commissionAmount != null
        ? `Commission: ${money(commissionAmount, currency)}`
        : null,
      netPayout != null ? `Net: ${money(netPayout, currency)}` : null,
      statementUrl ? `Download: ${statementUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
