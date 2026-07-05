import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as CategoryService from "../services/category.service.js";

export const getCategories = serviceHandler((req) =>
  CategoryService.getCategories(req.query)
);

export const getCategoryNavigation = serviceHandler(() =>
  CategoryService.getCategoryNavigation()
);

export const getCategoryBySlug = serviceHandler((req) =>
  CategoryService.getCategoryBySlug(req.params.slug)
);

export const getCategoryShop = serviceHandler((req) =>
  CategoryService.getCategoryShop(req.params.slug, req.query)
);

export const createCategory = serviceHandler(
  (req) => CategoryService.createCategory(req.body),
  201
);

export const updateCategory = serviceHandler((req) =>
  CategoryService.updateCategory(req.params.id, req.body)
);

export const deleteCategory = serviceHandler((req) =>
  CategoryService.deleteCategory(req.params.id)
);
