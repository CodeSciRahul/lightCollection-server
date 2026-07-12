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
 * B7 — KYC / docs incomplete or expired → Seller
 */
export const buildKycIncompleteEmail = (data = {}) => {
  const {
    sellerName = "Seller",
    storeName = "Your store",
    missingDocuments = [],
    expiredDocuments = [],
    dueDate,
    verificationUrl,
  } = data;

  const missing =
    missingDocuments.length > 0
      ? missingDocuments
      : ["Identity proof", "Business registration", "Address proof"];

  const preheader = `Action required: complete seller verification for ${storeName}.`;

  const html = Layout({
    title: `Complete seller verification — ${brand.name}`,
    preheader,
    children: `
      ${StatusBadge({ label: "Action required", tone: "warning" })}
      ${Heading({ children: `Complete your seller verification` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}, we need additional verification for <strong>${escapeHtml(storeName)}</strong> to keep your ${escapeHtml(brand.name)} seller account in good standing.`,
      })}
      ${AlertBox({
        tone: "warning",
        title: "Compliance deadline",
        body: dueDate
          ? `Please submit the required documents by <strong>${escapeHtml(formatDate(dueDate))}</strong> to avoid selling restrictions.`
          : `Please submit the required documents as soon as possible to avoid selling restrictions.`,
      })}
      ${Card({
        children: `
          ${Paragraph({
            children: `<strong style="font-size:14px;">Missing or incomplete</strong>`,
          })}
          ${List({ items: missing.map((d) => escapeHtml(d)) })}
          ${
            expiredDocuments.length
              ? `
                ${Paragraph({
                  children: `<strong style="font-size:14px;">Expired</strong>`,
                })}
                ${List({
                  items: expiredDocuments.map((d) => escapeHtml(d)),
                })}
              `
              : ""
          }
          ${InfoTable({
            rows: [
              { label: "Store", value: storeName },
              ...(dueDate
                ? [{ label: "Due by", value: formatDate(dueDate) }]
                : []),
            ],
          })}
        `,
      })}
      ${
        verificationUrl
          ? Button({
              href: verificationUrl,
              label: "Upload verification documents",
              variant: "primary",
            })
          : ""
      }
      ${Paragraph({
        children: `Documents must be clear, unedited, and match the legal name on your seller profile. Need help? <a href="mailto:${defaults.sellerEmail}">${defaults.sellerEmail}</a>`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Hi ${sellerName},`,
      ``,
      `Action required: complete seller verification for ${storeName}.`,
      `Missing: ${missing.join(", ")}`,
      expiredDocuments.length
        ? `Expired: ${expiredDocuments.join(", ")}`
        : null,
      dueDate ? `Due by: ${formatDate(dueDate)}` : null,
      verificationUrl ? `Upload: ${verificationUrl}` : null,
      ``,
      `Support: ${defaults.sellerEmail}`,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
