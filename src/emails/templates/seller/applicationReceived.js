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
 * B1 — Seller application submitted (Pending) → Seller
 */
export const buildApplicationReceivedSellerEmail = (data = {}) => {
  const {
    sellerName = "Seller",
    storeName = "Your store",
    applicationId,
    submittedAt = new Date(),
    reviewTimelineDays = defaults.reviewTimelineDays,
    dashboardUrl,
  } = data;

  const preheader = `Thanks ${sellerName} — your application for ${storeName} is under review.`;

  const html = Layout({
    title: `Application received — ${brand.name}`,
    preheader,
    children: `
      ${StatusBadge({ label: "Pending review", tone: "pending" })}
      ${Heading({
        children: `We received your seller application`,
      })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}, thanks for applying to sell on <strong>${escapeHtml(brand.name)}</strong>. Our team is reviewing <strong>${escapeHtml(storeName)}</strong>.`,
      })}
      ${AlertBox({
        tone: "info",
        title: "What happens next",
        body: `Most applications are reviewed within <strong>${escapeHtml(String(reviewTimelineDays))} business days</strong>. You'll get an email as soon as a decision is made — no action needed right now.`,
      })}
      ${Card({
        children: InfoTable({
          rows: [
            { label: "Store", value: storeName },
            { label: "Status", value: "Pending" },
            ...(applicationId
              ? [{ label: "Application ID", value: String(applicationId) }]
              : []),
            { label: "Submitted", value: formatDate(submittedAt) },
          ],
        }),
      })}
      ${Paragraph({
        children: `While you wait, you can review your application details in the seller dashboard.`,
        muted: true,
      })}
      ${
        dashboardUrl
          ? Button({
              href: dashboardUrl,
              label: "View application status",
              variant: "primary",
            })
          : ""
      }
      ${Paragraph({
        children: `If you didn't submit this application, contact <a href="mailto:${defaults.supportEmail}">${defaults.supportEmail}</a> immediately.`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Hi ${sellerName},`,
      ``,
      `We received your ${brand.name} seller application for ${storeName}.`,
      `Status: Pending`,
      `Typical review time: ${reviewTimelineDays} business days.`,
      applicationId ? `Application ID: ${applicationId}` : null,
      `Submitted: ${formatDate(submittedAt)}`,
      dashboardUrl ? `Dashboard: ${dashboardUrl}` : null,
      ``,
      `— ${brand.name} Sellers`,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
