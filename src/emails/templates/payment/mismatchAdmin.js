import { brand, defaults } from "../../design/tokens.js";
import { escapeHtml, formatDate } from "../../design/utils.js";
import {
  Layout,
  Heading,
  Paragraph,
  Card,
  StatusBadge,
  InfoTable,
  AlertBox,
} from "../../components/index.js";

const money = (amount, currency = "") => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return currency ? `${currency} ${n.toLocaleString("en-US")}` : String(n);
};

/** F7 — Webhook / verification mismatch → Admin */
export const buildPaymentMismatchAdminEmail = (data = {}) => {
  const {
    orderNumber,
    orderId,
    txRef = "unknown",
    expectedAmount,
    receivedAmount,
    currency = "",
    mismatchType = "amount",
    source = "system",
    details,
    detectedAt = new Date(),
  } = data;

  const html = Layout({
    title: `Payment mismatch — ${txRef}`,
    preheader: `Payment verification mismatch: ${txRef}`,
    showSocial: false,
    supportEmail: defaults.supportEmail,
    children: `
      ${StatusBadge({ label: "Ops alert", tone: "danger" })}
      ${Heading({ children: `Payment verification mismatch` })}
      ${Paragraph({
        children: `A payment verification issue was detected on ${escapeHtml(brand.name)}. Review immediately for fraud or gateway reconciliation.`,
      })}
      ${AlertBox({
        tone: "danger",
        title: mismatchType === "tx_ref" ? "Reference mismatch" : "Amount mismatch",
        body: details
          ? escapeHtml(details)
          : `Expected and received payment details do not match for tx_ref <strong>${escapeHtml(String(txRef))}</strong>.`,
      })}
      ${Card({
        children: InfoTable({
          rows: [
            ...(orderNumber ? [{ label: "Order", value: orderNumber }] : []),
            ...(orderId ? [{ label: "Order ID", value: String(orderId) }] : []),
            { label: "tx_ref", value: String(txRef) },
            { label: "Source", value: String(source) },
            ...(expectedAmount != null
              ? [{ label: "Expected", value: money(expectedAmount, currency) }]
              : []),
            ...(receivedAmount != null
              ? [{ label: "Received", value: money(receivedAmount, currency) }]
              : []),
            { label: "Detected", value: formatDate(detectedAt) },
          ],
        }),
      })}
      ${Paragraph({
        children: `This alert was sent to platform operations. Do not forward externally.`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Payment verification mismatch on ${brand.name}`,
      `tx_ref: ${txRef}`,
      orderNumber ? `Order: ${orderNumber}` : null,
      expectedAmount != null
        ? `Expected: ${money(expectedAmount, currency)}`
        : null,
      receivedAmount != null
        ? `Received: ${money(receivedAmount, currency)}`
        : null,
      details ? `Details: ${details}` : null,
      `Source: ${source}`,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
