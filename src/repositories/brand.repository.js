import Brand from "../models/Brand.js";

export { Brand };

export const find = (filter, options) => Brand.find(filter, null, options);
export const findOne = (filter) => Brand.findOne(filter);
export const findById = (id) => Brand.findById(id);
export const create = (data) => Brand.create(data);
export const findByIdAndUpdate = (id, update, options) =>
  Brand.findByIdAndUpdate(id, update, options);
export const findByIdAndDelete = (id) => Brand.findByIdAndDelete(id);
export const findAllSorted = () => Brand.find().sort({ name: 1 });
