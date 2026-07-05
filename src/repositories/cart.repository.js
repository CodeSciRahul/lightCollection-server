import Cart from "../models/Cart.js";

export { Cart };

export const findOne = (filter) => Cart.findOne(filter);
export const findOneAndUpdate = (filter, update, options) =>
  Cart.findOneAndUpdate(filter, update, options);
export const create = (data) => Cart.create(data);

export const findByUser = (userId) => Cart.findOne({ user: userId });

export const findByUserPopulated = (userId) =>
  Cart.findOne({ user: userId }).populate({
    path: "items.product",
    select: "title slug images variants isActive seller category",
  });

export const ensureForUser = (userId) =>
  Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { items: [] } },
    { upsert: true, new: true }
  );
