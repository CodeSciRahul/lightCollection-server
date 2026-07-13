import { colors, typography } from "../design/tokens.js";
import { escapeHtml, styleAttr, textStyle } from "../design/utils.js";

/**
 * Compact line-items table for order emails.
 * @param {{ items: Array<{ title: string, quantity: number, price?: number, size?: string, color?: string, variantSku?: string }>, currency?: string }} props
 */
export const OrderItemsTable = ({ items = [], currency = "" } = {}) => {
  if (!items.length) return "";

  const formatMoney = (amount) => {
    if (amount === undefined || amount === null) return "—";
    const n = Number(amount);
    if (!Number.isFinite(n)) return String(amount);
    return currency ? `${currency} ${n.toLocaleString("en-US")}` : n.toLocaleString("en-US");
  };

  const rows = items
    .map((item, index) => {
      const meta = [item.size, item.color, item.variantSku].filter(Boolean).join(" · ");
      return `
      <tr>
        <td style="${styleAttr({
          ...textStyle({
            fontSize: typography.fontSize.sm,
            padding: "12px 0",
            borderTop: index === 0 ? "none" : `1px solid ${colors.border}`,
            verticalAlign: "top",
          }),
        })}">
          <strong style="color:${colors.ink}">${escapeHtml(item.title || "Item")}</strong>
          ${
            meta
              ? `<div style="${styleAttr({
                  ...textStyle({
                    fontSize: typography.fontSize.xs,
                    color: colors.gray,
                    marginTop: "4px",
                  }),
                })}">${escapeHtml(meta)}</div>`
              : ""
          }
        </td>
        <td align="center" style="${styleAttr({
          ...textStyle({
            fontSize: typography.fontSize.sm,
            padding: "12px 8px",
            borderTop: index === 0 ? "none" : `1px solid ${colors.border}`,
            verticalAlign: "top",
            whiteSpace: "nowrap",
          }),
        })}">×${escapeHtml(String(item.quantity ?? 1))}</td>
        <td align="right" style="${styleAttr({
          ...textStyle({
            fontSize: typography.fontSize.sm,
            fontWeight: "600",
            padding: "12px 0",
            borderTop: index === 0 ? "none" : `1px solid ${colors.border}`,
            verticalAlign: "top",
            whiteSpace: "nowrap",
          }),
        })}">${escapeHtml(formatMoney(item.price != null ? item.price * (item.quantity || 1) : item.price))}</td>
      </tr>`;
    })
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${rows}
    </table>
  `;
};
