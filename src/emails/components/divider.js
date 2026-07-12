import { colors } from "../design/tokens.js";

export const Divider = ({ margin = "24px 0", color = colors.border } = {}) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:${margin};">
    <tr>
      <td style="border-top:1px solid ${color};font-size:0;line-height:0;height:1px;">&nbsp;</td>
    </tr>
  </table>
`;
