import CouponRedemption from "../models/CouponRedemption.js";

export { CouponRedemption };

export const find = (filter) => CouponRedemption.find(filter);
export const findOne = (filter) => CouponRedemption.findOne(filter);
export const create = (data) => CouponRedemption.create(data);
export const deleteOne = (filter) => CouponRedemption.deleteOne(filter);
export const countDocuments = (filter) => CouponRedemption.countDocuments(filter);
