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
 * B3 — Seller approved → Seller
 */
export const buildSellerApprovedEmail = (data = {}) => {
  const {
    sellerName = "Seller",
    storeName = "Your store",
    commissionRate,
    approvedAt = new Date(),
    dashboardUrl,
    addProductUrl,
    storefrontUrl,
  } = data;

  const preheader = `Congratulations — ${storeName} is approved on ${brand.name}.`;

  const html = Layout({
    title: `You're approved — ${brand.name}`,
    preheader,
    children: `
      ${StatusBadge({ label: "Approved", tone: "success" })}
      ${Heading({ children: `You're approved — start selling` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}, great news — <strong>${escapeHtml(storeName)}</strong> is approved on ${escapeHtml(brand.name)}. Your catalog and orders are unlocked.`,
      })}
      ${AlertBox({
        tone: "success",
        title: "You're live",
        body: `You can add products, manage inventory, and fulfill orders from your seller dashboard.`,
      })}
      ${Card({
        children: InfoTable({
          rows: [
            { label: "Store", value: storeName },
            { label: "Status", value: "Approved" },
            ...(commissionRate !== undefined && commissionRate !== null
              ? [
                  {
                    label: "Commission",
                    value: `${commissionRate}%`,
                  },
                ]
              : []),
            { label: "Approved on", value: formatDate(approvedAt) },
          ],
        }),
      })}
      ${Paragraph({ children: `<strong>Recommended next steps</strong>` })}
      ${List({
        items: [
          "Complete your store logo, banner, and description",
          "Add your first products with clear photos and sizes",
          "Confirm bank details for payouts",
          "Review shipping and return expectations",
        ],
      })}
      ${
        addProductUrl || dashboardUrl
          ? Button({
              href: addProductUrl || dashboardUrl,
              label: "Add your first product",
              variant: "primary",
            })
          : ""
      }
      ${
        storefrontUrl
          ? Paragraph({
              children: `Public store: <a href="${escapeHtml(storefrontUrl)}">${escapeHtml(storefrontUrl)}</a>`,
              muted: true,
            })
          : ""
      }
      ${
        dashboardUrl && addProductUrl
          ? Paragraph({
              children: `<a href="${escapeHtml(dashboardUrl)}">Open seller dashboard</a>`,
              muted: true,
            })
          : ""
      }
      ${Paragraph({
        children: `Questions? We're here at <a href="mailto:${defaults.sellerEmail}">${defaults.sellerEmail}</a>.`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Hi ${sellerName},`,
      ``,
      `You're approved — start selling on ${brand.name}.`,
      `Store: ${storeName}`,
      commissionRate != null ? `Commission: ${commissionRate}%` : null,
      `Approved on: ${formatDate(approvedAt)}`,
      ``,
      `Next steps: complete store profile, add products, confirm bank details.`,
      dashboardUrl ? `Dashboard: ${dashboardUrl}` : null,
      storefrontUrl ? `Storefront: ${storefrontUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
