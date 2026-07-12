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
 * B5 — Seller deactivated → Seller
 */
export const buildSellerDeactivatedEmail = (data = {}) => {
  const {
    sellerName = "Seller",
    storeName = "Your store",
    reason,
    deactivatedAt = new Date(),
    appealUrl,
    supportEmail = defaults.supportEmail,
  } = data;

  const preheader = `Your ${brand.name} seller account for ${storeName} has been deactivated.`;

  const html = Layout({
    title: `Seller account deactivated — ${brand.name}`,
    preheader,
    children: `
      ${StatusBadge({ label: "Deactivated", tone: "danger" })}
      ${Heading({ children: `Your seller account is deactivated` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}, your seller account for <strong>${escapeHtml(storeName)}</strong> on ${escapeHtml(brand.name)} has been deactivated.`,
      })}
      ${AlertBox({
        tone: "danger",
        title: "What this means",
        body: `Your storefront listings are hidden, and you cannot accept new orders until the account is reactivated.`,
      })}
      ${Card({
        children: InfoTable({
          rows: [
            { label: "Store", value: storeName },
            { label: "Status", value: "Deactivated" },
            ...(reason ? [{ label: "Reason", value: reason }] : []),
            { label: "Effective", value: formatDate(deactivatedAt) },
          ],
        }),
      })}
      ${Paragraph({ children: `<strong>Appeal or reinstate</strong>` })}
      ${List({
        items: [
          "Review our seller policies and the reason for deactivation",
          "Gather any supporting documents if requested",
          `Reply to <a href="mailto:${escapeHtml(supportEmail)}">${escapeHtml(supportEmail)}</a> to open an appeal`,
        ],
      })}
      ${
        appealUrl
          ? Button({
              href: appealUrl,
              label: "Start an appeal",
              variant: "danger",
            })
          : Button({
              href: `mailto:${supportEmail}?subject=${encodeURIComponent(`Appeal: ${storeName} seller deactivation`)}`,
              label: "Contact support to appeal",
              variant: "danger",
            })
      }
      ${Paragraph({
        children: `If you believe this was a mistake, contact us as soon as possible so we can investigate.`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Hi ${sellerName},`,
      ``,
      `Your ${brand.name} seller account for ${storeName} is deactivated.`,
      reason ? `Reason: ${reason}` : null,
      `Effective: ${formatDate(deactivatedAt)}`,
      ``,
      `Listings are hidden and new orders are paused.`,
      `To appeal, contact ${supportEmail}.`,
      appealUrl ? `Appeal: ${appealUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
