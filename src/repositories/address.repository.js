import Address from "../models/Address.js";

export { Address };

export const find = (filter, options) => Address.find(filter, null, options);
export const findOne = (filter) => Address.findOne(filter);
export const findOneAndDelete = (filter) => Address.findOneAndDelete(filter);
export const findOneAndUpdate = (filter, update, options) =>
  Address.findOneAndUpdate(filter, update, options);
export const create = (data) => Address.create(data);
export const countDocuments = (filter) => Address.countDocuments(filter);
export const updateMany = (filter, update) => Address.updateMany(filter, update);

export const findByUser = (userId) =>
  Address.find({ user: userId }).sort("-isDefault");

export const clearDefaultForUser = (userId) =>
  Address.updateMany({ user: userId }, { isDefault: false });

export const findOneByIdAndUser = (id, userId) =>
  Address.findOne({ _id: id, user: userId });

export const setDefaultForUser = (id, userId) =>
  Address.findOneAndUpdate({ _id: id, user: userId }, { isDefault: true }, { new: true });
