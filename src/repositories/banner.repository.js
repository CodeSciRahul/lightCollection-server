import Banner from "../models/Banner.js";

export { Banner };

export const find = (filter, options) => Banner.find(filter, null, options);
export const findOne = (filter) => Banner.findOne(filter);
export const findById = (id) => Banner.findById(id);
export const findByIdAndUpdate = (id, update, options) =>
  Banner.findByIdAndUpdate(id, update, options);
export const findByIdAndDelete = (id) => Banner.findByIdAndDelete(id);
export const create = (data) => Banner.create(data);

export const findActive = () =>
  Banner.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });

export const findAllSorted = () =>
  Banner.find().sort({ displayOrder: 1, createdAt: -1 });
