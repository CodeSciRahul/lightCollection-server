import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as FlashSaleService from "../services/flashSale.service.js";

export const getFlashSales = serviceHandler(() => FlashSaleService.getFlashSales());

export const listFlashSalesAdmin = serviceHandler(() =>
  FlashSaleService.listFlashSalesAdmin()
);

export const createFlashSale = serviceHandler(
  (req) => FlashSaleService.createFlashSale(req.body),
  201
);

export const updateFlashSale = serviceHandler((req) =>
  FlashSaleService.updateFlashSale(req.params.id, req.body)
);

export const toggleFlashSaleStatus = serviceHandler((req) =>
  FlashSaleService.toggleFlashSaleStatus(req.params.id, req.body)
);

export const deleteFlashSale = serviceHandler((req) =>
  FlashSaleService.deleteFlashSale(req.params.id)
);
