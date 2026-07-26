import FlashSale from "../models/FlashSale.js";

export { FlashSale };

export const find = (filter, options) => FlashSale.find(filter, null, options);
export const findOne = (filter) => FlashSale.findOne(filter);
export const findById = (id) => FlashSale.findById(id);
export const create = (data) => FlashSale.create(data);
export const findByIdAndUpdate = (id, update, options) =>
  FlashSale.findByIdAndUpdate(id, update, options);
export const findByIdAndDelete = (id) => FlashSale.findByIdAndDelete(id);
export const findAllSorted = () =>
  FlashSale.find().sort({ displayOrder: 1, startsAt: -1 });
