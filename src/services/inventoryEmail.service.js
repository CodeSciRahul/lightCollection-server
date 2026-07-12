import { appConfig } from "../config/index.js";
import { sendInventoryEmail } from "./email.service.js";
import * as SellerRepository from "../repositories/seller.repository.js";

const joinUrl = (base, path = "") => {
  if (!base) return path || undefined;
  const normalized = String(base).replace(/\/$/, "");
  if (!path) return normalized;
  return `${normalized}${path.startsWith("/") ? path : `/${path}`}`;
};

const dashboardBase = () =>
  appConfig.dashboardUrl || appConfig.clientUrl || "http://localhost:5173";

/** Default when LOW_STOCK_THRESHOLD env is unset. */
export const getLowStockThreshold = () => {
  const raw = appConfig.inventory?.lowStockThreshold;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 5;
};

const safeSend = async (label, fn) => {
  try {
    return await fn();
  } catch (error) {
    console.error(`[inventoryEmail] ${label} failed:`, error.message || error);
    return { sent: false, error };
  }
};

const resolveSellerContext = async (product) => {
  let seller = product?.seller;
  if (seller && typeof seller === "object" && seller.user?.email) {
    return seller;
  }

  const sellerId = seller?._id || seller;
  if (!sellerId) return null;

  return SellerRepository.findById(sellerId).populate("user", "name email");
};

const buildUrls = (product) => {
  const dash = dashboardBase();
  const productId = product?._id || product?.id;
  return {
    inventoryUrl: joinUrl(dash, "/seller/products"),
    productEditUrl: productId
      ? joinUrl(dash, `/seller/products/${productId}/edit`)
      : joinUrl(dash, "/seller/products"),
  };
};

/**
 * Decide which alert (if any) to send after a stock change.
 * - Crossing to 0 → OUT_OF_STOCK (C5)
 * - Crossing at/below threshold (still > 0) → LOW_STOCK (C4)
 * Only fires when the threshold boundary is crossed (avoids spam).
 */
export const classifyStockAlert = (
  previousStock,
  currentStock,
  threshold = getLowStockThreshold()
) => {
  const prev = Number(previousStock);
  const curr = Number(currentStock);

  if (!Number.isFinite(prev) || !Number.isFinite(curr) || curr === prev) {
    return null;
  }

  // Stock increased — no depletion alert
  if (curr > prev) return null;

  if (curr <= 0 && prev > 0) return "OUT_OF_STOCK";

  if (curr > 0 && curr <= threshold && prev > threshold) {
    return "LOW_STOCK";
  }

  return null;
};

/**
 * Notify seller when a variant crosses low-stock or out-of-stock.
 * Soft-fails so order/product flows are never blocked.
 */
export const notifyStockChange = async ({
  product,
  variant,
  previousStock,
  threshold = getLowStockThreshold(),
} = {}) => {
  if (!product || !variant) return { sent: false, reason: "missing_product" };

  const currentStock = Number(variant.stock);
  const alert = classifyStockAlert(previousStock, currentStock, threshold);
  if (!alert) return { sent: false, reason: "no_threshold_cross" };

  const seller = await resolveSellerContext(product);
  const to = seller?.user?.email;
  if (!to) return { sent: false, reason: "missing_email" };

  const urls = buildUrls(product);
  const data = {
    sellerName: seller.user?.name || seller.storeName || "Seller",
    storeName: seller.storeName || "Your store",
    productTitle: product.title,
    variantSku: variant.sku,
    size: variant.size,
    color: variant.color,
    currentStock: Math.max(0, currentStock),
    previousStock,
    threshold,
    detectedAt: new Date(),
    ...urls,
  };

  const eventKey = alert === "OUT_OF_STOCK" ? "OUT_OF_STOCK" : "LOW_STOCK";
  return safeSend(eventKey === "OUT_OF_STOCK" ? "C5" : "C4", () =>
    sendInventoryEmail(eventKey, { to, data })
  );
};

/**
 * Compare previous vs current variant stocks on a product and notify as needed.
 */
export const notifyProductVariantStockChanges = async (
  product,
  previousStockBySku = {},
  threshold = getLowStockThreshold()
) => {
  if (!product?.variants?.length) return [];

  const results = [];
  for (const variant of product.variants) {
    const sku = variant.sku;
    if (sku === undefined || sku === null) continue;
    if (!(sku in previousStockBySku)) continue;

    const result = await notifyStockChange({
      product,
      variant,
      previousStock: previousStockBySku[sku],
      threshold,
    });
    results.push({ sku, ...result });
  }
  return results;
};
