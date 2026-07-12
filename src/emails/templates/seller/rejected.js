import { brand, defaults } from "../../design/tokens.js";
import { escapeHtml, formatDate } from "../../design/utils.js";
import {
  Layout,
  Heading,
  Paragraph,
  List,
  Button,
  Card,
  StatusBadge,
  InfoTable,
  AlertBox,
} from "../../components/index.js";

/**
 * B4 — Seller rejected → Seller
 */
export const buildSellerRejectedEmail = (data = {}) => {
  const {
    sellerName = "Seller",
    storeName = "Your store",
    rejectionReason = "Your application did not meet our current seller requirements.",
    rejectedAt = new Date(),
    reapplyUrl,
    supportUrl,
  } = data;

  const preheader = `Update on your ${brand.name} seller application for ${storeName}.`;

  const html = Layout({
    title: `Application update — ${brand.name}`,
    preheader,
    children: `
      ${StatusBadge({ label: "Not approved", tone: "danger" })}
      ${Heading({ children: `Update on your seller application` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}, we reviewed your application for <strong>${escapeHtml(storeName)}</strong> and are unable to approve it at this time.`,
      })}
      ${AlertBox({
        tone: "danger",
        title: "Reason",
        body: escapeHtml(rejectionReason),
      })}
      ${Card({
        children: InfoTable({
          rows: [
            { label: "Store", value: storeName },
            { label: "Status", value: "Rejected" },
            { label: "Reviewed on", value: formatDate(rejectedAt) },
          ],
        }),
      })}
      ${Paragraph({ children: `<strong>How to move forward</strong>` })}
      ${List({
        items: [
          "Address the feedback above carefully",
          "Ensure KYC documents are clear, valid, and match your store details",
          "Update your application from the seller dashboard when ready",
          `Contact <a href="mailto:${defaults.supportEmail}">${defaults.supportEmail}</a> if you need clarification`,
        ],
      })}
      ${
        reapplyUrl
          ? Button({
              href: reapplyUrl,
              label: "Update & resubmit application",
              variant: "primary",
            })
          : ""
      }
      ${
        supportUrl
          ? Paragraph({
              children: `<a href="${escapeHtml(supportUrl)}">Contact seller support</a>`,
              muted: true,
            })
          : Paragraph({
              children: `We're here to help at <a href="mailto:${defaults.supportEmail}">${defaults.supportEmail}</a>.`,
              muted: true,
            })
      }
    `,
  });

  return {
    html,
    text: [
      `Hi ${sellerName},`,
      ``,
      `Update on your ${brand.name} seller application for ${storeName}.`,
      `Status: Rejected`,
      `Reason: ${rejectionReason}`,
      `Reviewed on: ${formatDate(rejectedAt)}`,
      ``,
      `You may update your details and resubmit when ready.`,
      reapplyUrl ? `Dashboard: ${reapplyUrl}` : null,
      `Support: ${defaults.supportEmail}`,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
