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
  Divider,
} from "../../components/index.js";

/**
 * B9 — Policy / commission change → Seller
 */
export const buildPolicyUpdateEmail = (data = {}) => {
  const {
    sellerName = "Seller",
    storeName,
    updateTitle = "Seller terms update",
    summary = "We are updating our seller terms and commercial policies.",
    changes = [],
    effectiveDate,
    previousCommission,
    newCommission,
    policyUrl,
    acknowledgeUrl,
  } = data;

  const changeItems =
    changes.length > 0
      ? changes
      : [
          "Updated seller performance and listing quality guidelines",
          "Clarified payout and dispute timelines",
          "Revised prohibited items and content rules",
        ];

  const preheader = `Important update to ${brand.name} seller terms${
    effectiveDate ? ` — effective ${formatDate(effectiveDate)}` : ""
  }.`;

  const html = Layout({
    title: `Seller terms update — ${brand.name}`,
    preheader,
    supportEmail: defaults.legalEmail,
    children: `
      ${StatusBadge({ label: "Policy update", tone: "info" })}
      ${Heading({ children: escapeHtml(updateTitle) })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}${
          storeName ? ` (${escapeHtml(storeName)})` : ""
        }, we're writing to share an important update that affects sellers on ${escapeHtml(brand.name)}.`,
      })}
      ${AlertBox({
        tone: "info",
        title: "Please review",
        body: escapeHtml(summary),
      })}
      ${Card({
        children: `
          ${Paragraph({
            children: `<strong style="font-size:14px;">What's changing</strong>`,
          })}
          ${List({ items: changeItems.map((c) => escapeHtml(c)) })}
          ${Divider({ margin: "12px 0 4px" })}
          ${InfoTable({
            rows: [
              ...(effectiveDate
                ? [{ label: "Effective date", value: formatDate(effectiveDate) }]
                : []),
              ...(previousCommission != null && newCommission != null
                ? [
                    {
                      label: "Commission",
                      value: `${previousCommission}% → ${newCommission}%`,
                    },
                  ]
                : newCommission != null
                  ? [{ label: "New commission", value: `${newCommission}%` }]
                  : []),
            ],
          })}
        `,
      })}
      ${Paragraph({
        children: `Continued use of the ${escapeHtml(brand.name)} seller platform after the effective date constitutes acceptance of the updated terms, unless otherwise required by law.`,
        muted: true,
      })}
      ${
        policyUrl
          ? Button({
              href: policyUrl,
              label: "Read full seller terms",
              variant: "secondary",
            })
          : ""
      }
      ${
        acknowledgeUrl
          ? Button({
              href: acknowledgeUrl,
              label: "Acknowledge update",
              variant: "outline",
            })
          : ""
      }
      ${Paragraph({
        children: `Questions about this change? Contact <a href="mailto:${defaults.legalEmail}">${defaults.legalEmail}</a> or seller support at <a href="mailto:${defaults.sellerEmail}">${defaults.sellerEmail}</a>.`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Hi ${sellerName},`,
      ``,
      `Important update to ${brand.name} seller terms.`,
      updateTitle,
      summary,
      ``,
      `Changes:`,
      ...changeItems.map((c) => `- ${c}`),
      effectiveDate ? `Effective: ${formatDate(effectiveDate)}` : null,
      previousCommission != null && newCommission != null
        ? `Commission: ${previousCommission}% → ${newCommission}%`
        : null,
      policyUrl ? `Full terms: ${policyUrl}` : null,
      ``,
      `Legal: ${defaults.legalEmail}`,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
