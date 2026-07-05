import * as WishlistRepository from "../repositories/wishlist.repository.js";
import * as ProductRepository from "../repositories/product.repository.js";
import { formatProductCard } from "../utils/helpers/productHelpers.js";
import { createError } from "../utils/AppError.js";

const getOrCreateWishlist = async (userId) => {
  let wishlist = await WishlistRepository.findByUser(userId);
  if (!wishlist) {
    wishlist = await WishlistRepository.create({ user: userId, products: [] });
  }
  return wishlist;
};

export const getWishlist = async (userId) => {
  const wishlist = await WishlistRepository.findByUserPopulated(userId);
  const products = (wishlist?.products || [])
    .filter((p) => p?.isActive)
    .map(formatProductCard);

  return { wishlist, products, count: products.length };
};

export const addToWishlist = async (userId, productId) => {
  const product = await ProductRepository.findById(productId);
  if (!product?.isActive) throw createError("Product not found", 404);

  const wishlist = await getOrCreateWishlist(userId);
  const exists = wishlist.products.some((id) => String(id) === String(productId));

  if (!exists) {
    wishlist.products.push(productId);
    await wishlist.save();
  }

  return { wishlist, message: "Added to wishlist", __status: 201 };
};

export const removeFromWishlist = async (userId, productId) => {
  const wishlist = await getOrCreateWishlist(userId);
  wishlist.products = wishlist.products.filter(
    (id) => String(id) !== String(productId)
  );
  await wishlist.save();
  return { wishlist, message: "Removed from wishlist" };
};

export const toggleWishlist = async (userId, productId) => {
  const wishlist = await getOrCreateWishlist(userId);
  const index = wishlist.products.findIndex(
    (id) => String(id) === String(productId)
  );

  if (index >= 0) {
    wishlist.products.splice(index, 1);
    await wishlist.save();
    return { inWishlist: false, wishlist };
  }

  const product = await ProductRepository.findById(productId);
  if (!product?.isActive) throw createError("Product not found", 404);

  wishlist.products.push(productId);
  await wishlist.save();
  return { inWishlist: true, wishlist, __status: 201 };
};
