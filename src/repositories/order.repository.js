import Order from "../models/Order.js";

export { Order };

export const find = (filter, options) => Order.find(filter, null, options);
export const findOne = (filter) => Order.findOne(filter);
export const findById = (id) => Order.findById(id);
export const findByIdAndUpdate = (id, update, options) =>
  Order.findByIdAndUpdate(id, update, options);
export const create = (data) => Order.create(data);
export const countDocuments = (filter) => Order.countDocuments(filter);
export const aggregate = (pipeline) => Order.aggregate(pipeline);

export const findByTxRef = (txRef) => Order.findOne({ "flutterwave.txRef": txRef });

export const findByUser = (userId, options = {}) =>
  Order.find({ user: userId, ...options.filter }).sort("-createdAt");

export const findBySeller = (sellerId, filter = {}) =>
  Order.find({ "items.seller": sellerId, ...filter }).sort("-createdAt");
