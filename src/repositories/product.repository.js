import Product from "../models/Product.js";

export { Product };

export const find = (filter, options) => Product.find(filter, null, options);
export const findOne = (filter) => Product.findOne(filter);
export const findById = (id) => Product.findById(id);
export const findByIdAndUpdate = (id, update, options) =>
  Product.findByIdAndUpdate(id, update, options);
export const findByIdAndDelete = (id) => Product.findByIdAndDelete(id);
export const create = (data) => Product.create(data);
export const countDocuments = (filter) => Product.countDocuments(filter);
export const aggregate = (pipeline) => Product.aggregate(pipeline);

export const findActiveById = (id) => Product.findById(id);

export const findBySlug = (slug) => Product.findOne({ slug, isActive: true });

export const findBySeller = (sellerId, filter = {}) =>
  Product.find({ seller: sellerId, ...filter });

export const findActive = (filter = {}) =>
  Product.find({ isActive: true, ...filter });
