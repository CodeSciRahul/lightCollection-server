import { brand, defaults } from "../../design/tokens.js";
import { escapeHtml } from "../../design/utils.js";
import {
  Layout,
  Heading,
  Paragraph,
  List,
  Button,
  Card,
  StatusBadge,
  AlertBox,
} from "../../components/index.js";

/**
 * B8 — Store profile incomplete reminder → Seller
 */
export const buildProfileIncompleteEmail = (data = {}) => {
  const {
    sellerName = "Seller",
    storeName = "Your store",
    incompleteFields = [],
    completionPercent,
    profileUrl,
  } = data;

  const fields =
    incompleteFields.length > 0
      ? incompleteFields
      : ["Store logo", "Store banner", "Store description", "Bank payout details"];

  const preheader = `Finish setting up ${storeName} to attract more buyers.`;

  const html = Layout({
    title: `Finish your store setup — ${brand.name}`,
    preheader,
    children: `
      ${StatusBadge({ label: "Setup incomplete", tone: "info" })}
      ${Heading({ children: `Finish setting up your store` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}, your store <strong>${escapeHtml(storeName)}</strong> is almost ready. Completing your profile helps buyers trust your brand and improves discoverability on ${escapeHtml(brand.name)}.`,
      })}
      ${
        completionPercent !== undefined && completionPercent !== null
          ? AlertBox({
              tone: "info",
              title: "Profile progress",
              body: `Your store profile is <strong>${escapeHtml(String(completionPercent))}%</strong> complete.`,
            })
          : ""
      }
      ${Card({
        children: `
          ${Paragraph({
            children: `<strong style="font-size:14px;">Still missing</strong>`,
          })}
          ${List({ items: fields.map((f) => escapeHtml(f)) })}
        `,
      })}
      ${Paragraph({
        children: `Sellers with complete profiles typically see stronger conversion once products go live.`,
        muted: true,
      })}
      ${
        profileUrl
          ? Button({
              href: profileUrl,
              label: "Complete store profile",
              variant: "primary",
            })
          : ""
      }
      ${Paragraph({
        children: `Questions about setup? <a href="mailto:${defaults.sellerEmail}">${defaults.sellerEmail}</a>`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Hi ${sellerName},`,
      ``,
      `Finish setting up your ${brand.name} store: ${storeName}.`,
      completionPercent != null
        ? `Profile progress: ${completionPercent}%`
        : null,
      `Still missing: ${fields.join(", ")}`,
      profileUrl ? `Complete profile: ${profileUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
