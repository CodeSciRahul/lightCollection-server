import { colors, typography } from "../design/tokens.js";
import { escapeHtml, styleAttr, textStyle } from "../design/utils.js";

/**
 * Email-safe CTA button (bulletproof pattern with VML fallback for Outlook).
 */
export const Button = ({
  href,
  label,
  variant = "primary",
  align = "left",
} = {}) => {
  const variants = {
    primary: {
      bg: colors.amber,
      color: colors.ink,
      border: colors.amber,
    },
    secondary: {
      bg: colors.ink,
      color: colors.white,
      border: colors.ink,
    },
    outline: {
      bg: colors.white,
      color: colors.ink,
      border: colors.border,
    },
    danger: {
      bg: colors.danger,
      color: colors.white,
      border: colors.danger,
    },
  };

  const v = variants[variant] || variants.primary;
  const safeHref = escapeHtml(href || "#");
  const safeLabel = escapeHtml(label || "Continue");

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;" align="${align}">
      <tr>
        <td align="${align}" bgcolor="${v.bg}" style="border-radius:8px;background-color:${v.bg};border:1px solid ${v.border};">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeHref}" style="height:44px;v-text-anchor:middle;width:220px;" arcsize="18%" stroke="f" fillcolor="${v.bg}">
            <w:anchorlock/>
            <center style="color:${v.color};font-family:Segoe UI,sans-serif;font-size:15px;font-weight:700;">${safeLabel}</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${safeHref}" style="${styleAttr({
            ...textStyle({
              display: "inline-block",
              padding: "14px 28px",
              fontSize: typography.fontSize.sm,
              fontWeight: "700",
              color: v.color,
              textDecoration: "none",
              borderRadius: "8px",
              lineHeight: "1.2",
            }),
          })}">${safeLabel}</a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>
  `;
};
