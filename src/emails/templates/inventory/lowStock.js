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
 * C4 — Low stock threshold reached → Seller
 */
export const buildLowStockEmail = (data = {}) => {
  const {
    sellerName = "Seller",
    storeName = "Your store",
    productTitle = "Product",
    variantSku = "—",
    size,
    color,
    currentStock = 0,
    previousStock,
    threshold = 5,
    detectedAt = new Date(),
    inventoryUrl,
    productEditUrl,
  } = data;

  const variantLabel = [size, color].filter(Boolean).join(" / ") || "Default";
  const preheader = `Low stock: ${productTitle} (${variantSku}) has ${currentStock} left.`;

  const html = Layout({
    title: `Low stock alert — ${brand.name}`,
    preheader,
    children: `
      ${StatusBadge({ label: "Low stock", tone: "warning" })}
      ${Heading({ children: `Low stock alert` })}
      ${Paragraph({
        children: `Hi ${escapeHtml(sellerName)}, inventory for <strong>${escapeHtml(productTitle)}</strong> in <strong>${escapeHtml(storeName)}</strong> is running low.`,
      })}
      ${AlertBox({
        tone: "warning",
        title: "Reorder soon",
        body: `Stock is at <strong>${escapeHtml(String(currentStock))}</strong> (threshold: ${escapeHtml(String(threshold))}). Restock to avoid lost sales.`,
      })}
      ${Card({
        children: InfoTable({
          rows: [
            { label: "Product", value: productTitle },
            { label: "SKU", value: variantSku },
            { label: "Variant", value: variantLabel },
            { label: "Current stock", value: String(currentStock) },
            ...(previousStock !== undefined
              ? [{ label: "Previous stock", value: String(previousStock) }]
              : []),
            { label: "Threshold", value: String(threshold) },
            { label: "Detected", value: formatDate(detectedAt) },
          ],
        }),
      })}
      ${Paragraph({ children: `<strong>Suggested actions</strong>` })}
      ${List({
        items: [
          "Update stock quantity for this SKU",
          "Pause the listing if you cannot replenish soon",
          "Check open orders that may still need this variant",
        ],
      })}
      ${
        productEditUrl || inventoryUrl
          ? Button({
              href: productEditUrl || inventoryUrl,
              label: "Update inventory",
              variant: "primary",
            })
          : ""
      }
      ${Paragraph({
        children: `Need help? Contact <a href="mailto:${defaults.sellerEmail}">${defaults.sellerEmail}</a>.`,
        muted: true,
      })}
    `,
  });

  return {
    html,
    text: [
      `Hi ${sellerName},`,
      ``,
      `Low stock alert for ${productTitle} (${variantSku}).`,
      `Current stock: ${currentStock}`,
      `Threshold: ${threshold}`,
      previousStock !== undefined ? `Previous stock: ${previousStock}` : null,
      `Store: ${storeName}`,
      productEditUrl || inventoryUrl
        ? `Update: ${productEditUrl || inventoryUrl}`
        : null,
    ]
      .filter(Boolean)
      .join("\n"),
  };
};
