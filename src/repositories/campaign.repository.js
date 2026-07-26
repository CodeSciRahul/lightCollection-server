import Campaign from "../models/Campaign.js";

export { Campaign };

export const find = (filter, options) => Campaign.find(filter, null, options);
export const findOne = (filter) => Campaign.findOne(filter);
export const findById = (id) => Campaign.findById(id);
export const create = (data) => Campaign.create(data);
export const findByIdAndUpdate = (id, update, options) =>
  Campaign.findByIdAndUpdate(id, update, options);
export const findByIdAndDelete = (id) => Campaign.findByIdAndDelete(id);
export const findAllSorted = () =>
  Campaign.find().sort({ displayOrder: 1, createdAt: -1 });
