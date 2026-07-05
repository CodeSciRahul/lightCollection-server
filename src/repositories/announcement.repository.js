import Announcement from "../models/Announcement.js";

export { Announcement };

export const find = (filter, options) => Announcement.find(filter, null, options);
export const findOne = (filter) => Announcement.findOne(filter);
export const findById = (id) => Announcement.findById(id);
export const findByIdAndUpdate = (id, update, options) =>
  Announcement.findByIdAndUpdate(id, update, options);
export const findByIdAndDelete = (id) => Announcement.findByIdAndDelete(id);
export const create = (data) => Announcement.create(data);

export const findActive = (filter = {}) =>
  Announcement.find({ isActive: true, ...filter }).sort("-createdAt");

export const findAllSorted = () => Announcement.find().sort("-createdAt");
