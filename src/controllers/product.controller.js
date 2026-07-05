import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as ProductService from "../services/product.service.js";

export const getProducts = serviceHandler((req) => ProductService.getProducts(req.query));

export const getTrendingProducts = serviceHandler((req) =>
  ProductService.getTrendingProducts(req.query)
);

export const getProductBySlug = serviceHandler((req) =>
  ProductService.getProductBySlug(req.params.slug)
);

export const searchProducts = serviceHandler((req) =>
  ProductService.searchProducts(req.query)
);

export const getMyProducts = serviceHandler((req) =>
  ProductService.getMyProducts(req.seller._id, req.query)
);

export const createProduct = serviceHandler(
  (req) => ProductService.createProduct(req.user, req.seller, req.body),
  201
);

export const updateProduct = serviceHandler((req) =>
  ProductService.updateProduct(req.user, req.seller, req.params.id, req.body)
);

export const deleteProduct = serviceHandler((req) =>
  ProductService.deleteProduct(req.user, req.seller, req.params.id)
);

export const getProductsByStoreSlug = serviceHandler((req) =>
  ProductService.getProductsByStoreSlug(req.params.slug, req.query)
);
