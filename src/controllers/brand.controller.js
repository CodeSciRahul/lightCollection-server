import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as BrandService from "../services/brand.service.js";

export const getBrands = serviceHandler(() => BrandService.getBrands());

export const listBrandsAdmin = serviceHandler(() => BrandService.listBrandsAdmin());

export const createBrand = serviceHandler(
  (req) => BrandService.createBrand(req.body),
  201
);

export const updateBrand = serviceHandler((req) =>
  BrandService.updateBrand(req.params.id, req.body)
);

export const toggleBrandStatus = serviceHandler((req) =>
  BrandService.toggleBrandStatus(req.params.id, req.body)
);

export const deleteBrand = serviceHandler((req) =>
  BrandService.deleteBrand(req.params.id)
);
