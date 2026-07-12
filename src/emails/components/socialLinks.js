import { brand, colors, typography } from "../design/tokens.js";
import { escapeHtml, styleAttr, textStyle } from "../design/utils.js";

const DEFAULT_LINKS = [
  { label: "Website", href: `https://${brand.domain}` },
  { label: "Help Center", href: `https://${brand.domain}/help` },
  { label: "Seller Guide", href: `https://${brand.domain}/sellers/guide` },
];

export const SocialLinks = ({ links = DEFAULT_LINKS } = {}) => {
  const items = links
    .map(
      (link, index) => `
      <a href="${escapeHtml(link.href)}" style="${styleAttr({
        ...textStyle({
          fontSize: typography.fontSize.xs,
          color: colors.ink,
          fontWeight: "600",
          textDecoration: "none",
        }),
      })}">${escapeHtml(link.label)}</a>
      ${
        index < links.length - 1
          ? `<span style="color:${colors.border};padding:0 10px;">·</span>`
          : ""
      }
    `
    )
    .join("");

  return `
    <p style="${styleAttr({
      ...textStyle({
        fontSize: typography.fontSize.xs,
        textAlign: "center",
        margin: "0",
      }),
    })}">${items}</p>
  `;
};
