import { colors, layout } from "../design/tokens.js";
import { styleAttr } from "../design/utils.js";

export const Card = ({ children, padding = "24px", background } = {}) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
    <tr>
      <td style="${styleAttr({
        backgroundColor: background || colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: layout.borderRadius,
        padding,
      })}">
        ${children || ""}
      </td>
    </tr>
  </table>
`;
