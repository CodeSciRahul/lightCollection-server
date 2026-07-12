import { colors, typography } from "../design/tokens.js";
import { escapeHtml, styleAttr, textStyle } from "../design/utils.js";

/**
 * Key/value info table for application summaries.
 * @param {{ rows: Array<{ label: string, value: string }> }} props
 */
export const InfoTable = ({ rows = [] } = {}) => {
  const body = rows
    .map(
      (row, index) => `
      <tr>
        <td style="${styleAttr({
          ...textStyle({
            fontSize: typography.fontSize.sm,
            color: colors.gray,
            padding: "10px 0",
            width: "38%",
            verticalAlign: "top",
            borderTop: index === 0 ? "none" : `1px solid ${colors.border}`,
          }),
        })}">${escapeHtml(row.label)}</td>
        <td style="${styleAttr({
          ...textStyle({
            fontSize: typography.fontSize.sm,
            color: colors.ink,
            fontWeight: "600",
            padding: "10px 0",
            verticalAlign: "top",
            borderTop: index === 0 ? "none" : `1px solid ${colors.border}`,
          }),
        })}">${escapeHtml(row.value)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${body}
    </table>
  `;
};
