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
} from "../../components/index.js";

/**
 * B2 — Seller application submitted → Admin / Support ops
 */
export const buildApplicationSubmittedAdminEmail = (data = {}) => {
  const {
    storeName = "Untitled store",
    sellerName = "—",
    sellerEmail = "—",
    sellerMobile = "—",
    applicationId,
    nationalId,
    tinNumber,
    city,
    country,
    submittedAt = new Date(),
    adminReviewUrl,
    documentStatus = {},
  } = data;

  const docsSummary = [
    documentStatus.idProof ? "ID proof ✓" : "ID proof ✗",
    documentStatus.businessProof ? "Business proof ✓" : "Business proof ✗",
    documentStatus.addressProof ? "Address proof ✓" : "Address proof ✗",
  ].join(", ");

  const preheader = `KYC queue: ${storeName} needs review.`;

  const html = Layout({
    title: `New seller application — ${storeName}`,
    preheader,
    supportEmail: defaults.supportEmail,
    showSocial: false,
    children: `
      ${StatusBadge({ label: "Action required", tone: "warning" })}
      ${Heading({ children: `New seller application` })}
      ${Paragraph({
        children: `A new seller has applied to join <strong>${escapeHtml(brand.name)}</strong>. Please complete KYC review.`,
      })}
      ${AlertBox({
        tone: "warning",
        title: "Review queue",
        body: `Prioritize applications older than ${defaults.reviewTimelineDays} business days to meet SLA.`,
      })}
      ${Card({
        children: InfoTable({
          rows: [
            { label: "Store", value: storeName },
            { label: "Seller name", value: sellerName },
            { label: "Email", value: sellerEmail },
            { label: "Mobile", value: sellerMobile },
            ...(nationalId ? [{ label: "National ID", value: nationalId }] : []),
            ...(tinNumber ? [{ label: "TIN", value: tinNumber }] : []),
            ...(city || country
              ? [
                  {
                    label: "Location",
                    value: [city, country].filter(Boolean).join(", "),
                  },
                ]
              : []),
            { label: "Documents", value: docsSummary },
            ...(applicationId
              ? [{ label: "Seller ID", value: String(applicationId) }]
              : []),
            { label: "Submitted", value: formatDate(submittedAt) },
          ],
        }),
      })}
      ${
        adminReviewUrl
          ? Button({
              href: adminReviewUrl,
              label: "Review application",
              variant: "secondary",
            })
          : ""
      }
      ${Paragraph({
        children: `This alert was sent to platform operations. Do not forward externally.`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `New seller application on ${brand.name}`,
      ``,
      `Store: ${storeName}`,
      `Seller: ${sellerName} <${sellerEmail}>`,
      `Mobile: ${sellerMobile}`,
      nationalId ? `National ID: ${nationalId}` : null,
      `Documents: ${docsSummary}`,
      applicationId ? `Seller ID: ${applicationId}` : null,
      `Submitted: ${formatDate(submittedAt)}`,
      adminReviewUrl ? `Review: ${adminReviewUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
