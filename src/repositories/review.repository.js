import Review from "../models/Review.js";

export { Review };

export const find = (filter, options) => Review.find(filter, null, options);
export const findOne = (filter) => Review.findOne(filter);
export const findById = (id) => Review.findById(id);
export const findByIdAndDelete = (id) => Review.findByIdAndDelete(id);
export const create = (data) => Review.create(data);
export const findOneAndDelete = (filter) => Review.findOneAndDelete(filter);
export const countDocuments = (filter) => Review.countDocuments(filter);
export const aggregate = (pipeline) => Review.aggregate(pipeline);

export const findByProduct = (productId) =>
  Review.find({ product: productId }).sort("-createdAt").populate("user", "name avatar");

export const findOneByUserAndProduct = (userId, productId) =>
  Review.findOne({ user: userId, product: productId });
