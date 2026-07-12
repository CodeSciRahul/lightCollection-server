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
} from "../../components/index.js";

/**
 * C5 — Out of stock → Seller
 */
export const buildOutOfStockEmail = (data = {}) => {
  const {
    sellerName = "Seller",
    storeName = "Your store",
    productTitle = "Product",
    variantSku = "—",
    size,
    color,
    previousStock,
    detectedAt = new Date(),
    inventoryUrl,
    productEditUrl,
  } = data;

  const variantLabel = [size, color].filter(Boolean).join(" / ") || "Default";
  const preheader = `Out of stock: ${productTitle} (${variantSku}) is unavailable.`;

  const html = Layout({
    title: `Out of stock — ${brand.name}`,
    preheader,
    children: `
      ${StatusBadge({ label: "Out of stock", tone: "danger" })}
      ${Heading({ children: `Out of stock alert` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}, <strong>${escapeHtml(productTitle)}</strong> (${escapeHtml(variantSku)}) in <strong>${escapeHtml(storeName)}</strong> is now out of stock.`,
      })}
      ${AlertBox({
        tone: "danger",
        title: "Listing unavailable for this SKU",
        body: `Buyers can no longer purchase this variant until you restock. Act quickly to reduce lost sales.`,
      })}
      ${Card({
        children: InfoTable({
          rows: [
            { label: "Product", value: productTitle },
            { label: "SKU", value: variantSku },
            { label: "Variant", value: variantLabel },
            { label: "Current stock", value: "0" },
            ...(previousStock !== undefined
              ? [{ label: "Previous stock", value: String(previousStock) }]
              : []),
            { label: "Detected", value: formatDate(detectedAt) },
          ],
        }),
      })}
      ${Paragraph({ children: `<strong>Next steps</strong>` })}
      ${List({
        items: [
          "Restock this SKU as soon as inventory arrives",
          "Confirm open orders are still fulfillable from existing picks",
          "Consider marking the product inactive if replenishment will take time",
        ],
      })}
      ${
        productEditUrl || inventoryUrl
          ? Button({
              href: productEditUrl || inventoryUrl,
              label: "Restock now",
              variant: "danger",
            })
          : ""
      }
      ${Paragraph({
        children: `Questions? Email <a href="mailto:${defaults.sellerEmail}">${defaults.sellerEmail}</a>.`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Hi ${sellerName},`,
      ``,
      `Out of stock: ${productTitle} (${variantSku}).`,
      `Current stock: 0`,
      previousStock !== undefined ? `Previous stock: ${previousStock}` : null,
      `Store: ${storeName}`,
      productEditUrl || inventoryUrl
        ? `Restock: ${productEditUrl || inventoryUrl}`
        : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
