import Seller from "../models/Seller.js";

export { Seller };

export const find = (filter, options) => Seller.find(filter, null, options);
export const findOne = (filter) => Seller.findOne(filter);
export const findById = (id) => Seller.findById(id);
export const findByIdAndUpdate = (id, update, options) =>
  Seller.findByIdAndUpdate(id, update, options);
export const create = (data) => Seller.create(data);
export const countDocuments = (filter) => Seller.countDocuments(filter);
export const aggregate = (pipeline) => Seller.aggregate(pipeline);

export const findByUser = (userId) => Seller.findOne({ user: userId });

export const findApprovedByUser = (userId) =>
  Seller.findOne({ user: userId, approvalStatus: "Approved", isActive: true });

export const findBySlug = (storeSlug) =>
  Seller.findOne({ storeSlug, approvalStatus: "Approved", isActive: true });

export const findAllSorted = (filter = {}) =>
  Seller.find(filter).sort("-createdAt").populate("user", "name email mobileNumber");
