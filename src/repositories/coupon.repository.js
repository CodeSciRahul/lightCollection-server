import Coupon from "../models/Coupon.js";

export { Coupon };

export const find = (filter) => Coupon.find(filter);
export const findOne = (filter) => Coupon.findOne(filter);
export const findById = (id) => Coupon.findById(id);
export const findByIdAndUpdate = (id, update, options) =>
  Coupon.findByIdAndUpdate(id, update, options);
export const create = (data) => Coupon.create(data);

export const findActiveByCode = (code) =>
  Coupon.findOne({ code: code?.toUpperCase(), isActive: true });

export const findActivePublic = () =>
  Coupon.find({ isActive: true }).sort("-createdAt");

export const findAllSorted = () => Coupon.find().sort("-createdAt");
