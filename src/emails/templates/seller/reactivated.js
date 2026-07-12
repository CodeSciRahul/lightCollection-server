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
 * B6 — Seller reactivated → Seller
 */
export const buildSellerReactivatedEmail = (data = {}) => {
  const {
    sellerName = "Seller",
    storeName = "Your store",
    reactivatedAt = new Date(),
    dashboardUrl,
    ordersUrl,
  } = data;

  const preheader = `${storeName} is active again on ${brand.name}.`;

  const html = Layout({
    title: `Seller account reactivated — ${brand.name}`,
    preheader,
    children: `
      ${StatusBadge({ label: "Active", tone: "success" })}
      ${Heading({ children: `Your seller account is active again` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}, good news — <strong>${escapeHtml(storeName)}</strong> has been reactivated on ${escapeHtml(brand.name)}. You can resume selling.`,
      })}
      ${AlertBox({
        tone: "success",
        title: "You're back online",
        body: `Approved listings can be shown again, and you can fulfill new orders from your dashboard.`,
      })}
      ${Card({
        children: InfoTable({
          rows: [
            { label: "Store", value: storeName },
            { label: "Status", value: "Active" },
            { label: "Reactivated on", value: formatDate(reactivatedAt) },
          ],
        }),
      })}
      ${Paragraph({ children: `<strong>Suggested checklist</strong>` })}
      ${List({
        items: [
          "Confirm product stock levels are accurate",
          "Review any open or pending orders",
          "Ensure payout bank details are still correct",
          "Check store profile and policies are up to date",
        ],
      })}
      ${
        dashboardUrl
          ? Button({
              href: ordersUrl || dashboardUrl,
              label: "Open seller dashboard",
              variant: "primary",
            })
          : ""
      }
      ${Paragraph({
        children: `Need help getting back up to speed? Email <a href="mailto:${defaults.sellerEmail}">${defaults.sellerEmail}</a>.`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Hi ${sellerName},`,
      ``,
      `Your seller account for ${storeName} is active again on ${brand.name}.`,
      `Reactivated on: ${formatDate(reactivatedAt)}`,
      dashboardUrl ? `Dashboard: ${dashboardUrl}` : null,
      ``,
      `Confirm stock, orders, and bank details before you resume selling.`,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
