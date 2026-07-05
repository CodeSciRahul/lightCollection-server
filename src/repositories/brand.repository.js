import Brand from "../models/Brand.js";

export { Brand };

export const find = (filter) => Brand.find(filter);
export const findOne = (filter) => Brand.findOne(filter);
export const findById = (id) => Brand.findById(id);
export const create = (data) => Brand.create(data);
