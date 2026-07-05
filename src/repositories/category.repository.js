import Category from "../models/Category.js";

export { Category };

export const find = (filter, options) => Category.find(filter, null, options);
export const findOne = (filter) => Category.findOne(filter);
export const findById = (id) => Category.findById(id);
export const findByIdAndUpdate = (id, update, options) =>
  Category.findByIdAndUpdate(id, update, options);
export const findByIdAndDelete = (id) => Category.findByIdAndDelete(id);
export const create = (data) => Category.create(data);
export const countDocuments = (filter) => Category.countDocuments(filter);
export const updateMany = (filter, update) => Category.updateMany(filter, update);

export const findActive = (filter = {}) =>
  Category.find({ isActive: true, ...filter }).sort("order name");

export const findAll = (filter = {}) => Category.find(filter).sort("order name");

export const findBySlug = (slug) => Category.findOne({ slug, isActive: true });

export const findBySlugAny = (slug) => Category.findOne({ slug });
