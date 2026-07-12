import { brand, colors, defaults, layout, typography } from "../design/tokens.js";
import { escapeHtml, styleAttr, textStyle } from "../design/utils.js";
import { SocialLinks } from "./socialLinks.js";
import { Divider } from "./divider.js";

export const Footer = ({
  supportEmail = defaults.supportEmail,
  showSocial = true,
} = {}) => {
  const year = new Date().getFullYear();

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${colors.surface};border-top:1px solid ${colors.border};">
      <tr>
        <td align="center" style="padding:28px 24px 36px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${layout.maxWidth};">
            <tr>
              <td align="center">
                ${showSocial ? SocialLinks() : ""}
                ${showSocial ? Divider({ margin: "20px 0" }) : ""}
                <p style="${styleAttr({
                  ...textStyle({
                    fontSize: typography.fontSize.sm,
                    color: colors.gray,
                    textAlign: "center",
                    marginBottom: "8px",
                  }),
                })}">
                  Need help? Contact
                  <a href="mailto:${escapeHtml(supportEmail)}" style="color:${colors.ink};font-weight:600;text-decoration:underline;">${escapeHtml(supportEmail)}</a>
                </p>
                <p style="${styleAttr({
                  ...textStyle({
                    fontSize: typography.fontSize.xs,
                    color: colors.muted,
                    textAlign: "center",
                    marginBottom: "8px",
                  }),
                })}">
                  © ${year} ${escapeHtml(brand.name)}. All rights reserved.
                </p>
                <p style="${styleAttr({
                  ...textStyle({
                    fontSize: typography.fontSize.xs,
                    color: colors.muted,
                    textAlign: "center",
                  }),
                })}">
                  This is a transactional message related to your seller account on ${escapeHtml(brand.name)}.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};
