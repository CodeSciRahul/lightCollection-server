import HomeSection from "../models/HomeSection.js";

export { HomeSection };

export const find = (filter, options) => HomeSection.find(filter, null, options);
export const findOne = (filter) => HomeSection.findOne(filter);
export const findById = (id) => HomeSection.findById(id);
export const create = (data) => HomeSection.create(data);
export const insertMany = (docs) => HomeSection.insertMany(docs);
export const countDocuments = (filter = {}) => HomeSection.countDocuments(filter);
export const findByIdAndUpdate = (id, update, options) =>
  HomeSection.findByIdAndUpdate(id, update, options);
export const findByIdAndDelete = (id) => HomeSection.findByIdAndDelete(id);
export const findAllSorted = () =>
  HomeSection.find().sort({ displayOrder: 1, createdAt: 1 });
export const bulkWrite = (ops) => HomeSection.bulkWrite(ops);
