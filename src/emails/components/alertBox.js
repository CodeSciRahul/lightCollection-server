import { colors, typography } from "../design/tokens.js";
import { escapeHtml, styleAttr, textStyle } from "../design/utils.js";

const TONES = {
  pending: { bg: colors.warningBg, border: colors.warningBorder, color: colors.warning },
  warning: { bg: colors.warningBg, border: colors.warningBorder, color: colors.warning },
  success: { bg: colors.successBg, border: colors.successBorder, color: colors.success },
  danger: { bg: colors.dangerBg, border: colors.dangerBorder, color: colors.danger },
  info: { bg: colors.infoBg, border: colors.infoBorder, color: colors.info },
  neutral: { bg: colors.surface, border: colors.border, color: colors.gray },
};

export const StatusBadge = ({ label, tone = "neutral" } = {}) => {
  const t = TONES[tone] || TONES.neutral;
  return `
    <span style="display:inline-block;background-color:${t.bg};border:1px solid ${t.border};color:${t.color};font-family:${typography.fontFamily};font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;padding:6px 12px;border-radius:999px;">${escapeHtml(label)}</span>
  `;
};

export const AlertBox = ({ title, body, tone = "info" } = {}) => {
  const t = TONES[tone] || TONES.info;
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
      <tr>
        <td style="${styleAttr({
          backgroundColor: t.bg,
          border: `1px solid ${t.border}`,
          borderRadius: "8px",
          padding: "16px 18px",
        })}">
          ${
            title
              ? `<p style="${styleAttr({
                  ...textStyle({
                    fontSize: typography.fontSize.sm,
                    fontWeight: "700",
                    color: t.color,
                    marginBottom: "6px",
                  }),
                })}">${escapeHtml(title)}</p>`
              : ""
          }
          <p style="${styleAttr({
            ...textStyle({
              fontSize: typography.fontSize.sm,
              color: colors.ink,
            }),
          })}">${body || ""}</p>
        </td>
      </tr>
    </table>
  `;
};
