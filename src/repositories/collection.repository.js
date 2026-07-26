import Collection from "../models/Collection.js";

export { Collection };

export const find = (filter, options) => Collection.find(filter, null, options);
export const findOne = (filter) => Collection.findOne(filter);
export const findById = (id) => Collection.findById(id);
export const create = (data) => Collection.create(data);
export const findByIdAndUpdate = (id, update, options) =>
  Collection.findByIdAndUpdate(id, update, options);
export const findByIdAndDelete = (id) => Collection.findByIdAndDelete(id);
export const findAllSorted = () =>
  Collection.find().sort({ displayOrder: 1, createdAt: -1 });
