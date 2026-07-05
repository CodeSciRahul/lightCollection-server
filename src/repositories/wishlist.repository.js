import Wishlist from "../models/Wishlist.js";

export { Wishlist };

export const findOne = (filter) => Wishlist.findOne(filter);
export const create = (data) => Wishlist.create(data);
export const findOneAndUpdate = (filter, update, options) =>
  Wishlist.findOneAndUpdate(filter, update, options);

export const findByUser = (userId) => Wishlist.findOne({ user: userId });

export const findByUserPopulated = async (userId) =>{
  const wishlist = await Wishlist.findOne({ user: userId }).populate("products");
  return wishlist;
}

export const ensureForUser = (userId) =>
  Wishlist.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { products: [] } },
    { upsert: true, new: true }
  );
