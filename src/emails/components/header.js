import { brand, colors, layout, typography } from "../design/tokens.js";
import { escapeHtml, styleAttr, textStyle } from "../design/utils.js";

/**
 * Brand header — table-based for Outlook/Gmail compatibility.
 */
export const Header = ({ preheader = "" } = {}) => {
  const safePreheader = escapeHtml(preheader);

  return `
    ${
      safePreheader
        ? `<div style="display:none;font-size:1px;color:${colors.cream};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${safePreheader}</div>`
        : ""
    }
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${colors.ink};">
      <tr>
        <td align="center" style="padding:28px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:${layout.maxWidth};">
            <tr>
              <td align="left" style="vertical-align:middle;">
                <a href="https://${brand.domain}" style="text-decoration:none;">
                  <span style="${styleAttr({
                    ...textStyle({
                      fontSize: typography.fontSize.xl,
                      fontWeight: "700",
                      letterSpacing: "-0.02em",
                      color: colors.amber,
                      lineHeight: typography.lineHeight.tight,
                    }),
                  })}">${escapeHtml(brand.name)}</span>
                </a>
                <div style="${styleAttr({
                  ...textStyle({
                    fontSize: typography.fontSize.xs,
                    color: colors.cream,
                    marginTop: "4px",
                    opacity: "0.85",
                  }),
                })}">Seller Hub</div>
              </td>
              <td align="right" style="vertical-align:middle;">
                <span style="display:inline-block;background-color:${colors.amber};color:${colors.ink};font-family:${typography.fontFamily};font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:6px 10px;border-radius:999px;">Marketplace</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};
