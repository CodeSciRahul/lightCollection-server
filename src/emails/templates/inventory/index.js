export { buildLowStockEmail } from "./lowStock.js";
export { buildOutOfStockEmail } from "./outOfStock.js";

import { buildLowStockEmail } from "./lowStock.js";
import { buildOutOfStockEmail } from "./outOfStock.js";

/** Registry for inventory alert templates (C4–C5). */
export const INVENTORY_TEMPLATES = {
  LOW_STOCK: buildLowStockEmail,
  OUT_OF_STOCK: buildOutOfStockEmail,
};
