import * as CartRepository from "../repositories/cart.repository.js";
import * as ProductRepository from "../repositories/product.repository.js";
import * as CouponRepository from "../repositories/coupon.repository.js";
import { findVariant } from "../utils/helpers/productHelpers.js";
import { FREE_SHIPPING_THRESHOLD } from "../utils/helpers/orderHelpers.js";
import {
  calculateCouponDiscount,
  calculateEligibleSubtotal,
  resolveCouponDiscount,
} from "../utils/helpers/couponHelpers.js";
import { createError } from "../utils/AppError.js";

const populateCart = async (userId) => {
  let cart = await CartRepository.findByUserPopulated(userId);

  if (!cart) {
    cart = await CartRepository.create({ user: userId, items: [] });
  }

  return cart;
};

const loadCartCoupon = async (cart) =>
  cart?.coupon ? await CouponRepository.findById(cart.coupon) : null;

const calculateCartTotals = (items, coupon = null) => {
  let subtotal = 0;
  const validItems = [];

  for (const item of items) {
    const product = item.product;
    if (!product?.isActive) continue;

    const variant = findVariant(product, item.variantSku);
    if (!variant || variant.stock < item.quantity) continue;

    const lineTotal = variant.price * item.quantity;
    subtotal += lineTotal;
    validItems.push({
      ...item.toObject(),
      variant,
      lineTotal,
    });
  }

  let discount = 0;
  if (coupon?.isActive) {
    const eligibleSubtotal = calculateEligibleSubtotal(items, coupon);
    discount = calculateCouponDiscount(coupon, eligibleSubtotal);
  }

  const afterDiscount = subtotal - discount;
  const shippingFee = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : 79;
  const total = afterDiscount + shippingFee;

  return {
    subtotal,
    discount,
    shippingFee,
    total,
    itemCount: validItems.reduce((n, i) => n + i.quantity, 0),
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  };
};

const buildCartResponse = async (cart) => {
  const coupon = await loadCartCoupon(cart);
  const totals = calculateCartTotals(cart.items, coupon);
  return { cart, ...totals, coupon };
};

export const getCart = async (userId) => buildCartResponse(await populateCart(userId));

export const addToCart = async (userId, { productId, variantSku, quantity = 1 }) => {
  if (!productId || !variantSku) {
    throw createError("productId and variantSku are required");
  }

  const product = await ProductRepository.findById(productId);
  if (!product?.isActive) throw createError("Product not found", 404);

  const variant = findVariant(product, variantSku);
  if (!variant) throw createError("Variant not found", 404);
  if (variant.stock < quantity) throw createError("Insufficient stock");

  const cart = await populateCart(userId);
  const existing = cart.items.find(
    (i) =>
      String(i.product?._id) === String(productId) &&
      String(i.variantSku) === String(variantSku)
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ product: productId, variantSku, quantity });
  }

  await cart.save();
  const response = await buildCartResponse(await populateCart(userId));
  return { ...response, __status: 201 };
};

export const updateCartItem = async (userId, itemId, { quantity }) => {
  const cart = await populateCart(userId);
  const item = cart.items.id(itemId);

  if (!item) throw createError("Cart item not found", 404);
  if (quantity < 1) {
    item.deleteOne();
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  return buildCartResponse(await populateCart(userId));
};

export const removeFromCart = async (userId, itemId) => {
  const cart = await populateCart(userId);
  const item = cart.items.id(itemId);
  if (!item) throw createError("Cart item not found", 404);

  item.deleteOne();
  await cart.save();

  return buildCartResponse(await populateCart(userId));
};

export const clearCart = async (userId) => {
  const cart = await populateCart(userId);
  cart.items = [];
  cart.coupon = undefined;
  await cart.save();
  return { cart };
};

export const removeCouponFromCart = async (userId) => {
  const cart = await populateCart(userId);
  cart.coupon = undefined;
  await cart.save();
  return buildCartResponse(cart);
};

export const applyCouponToCart = async (userId, code) => {
  const coupon = await CouponRepository.findActiveByCode(code);
  if (!coupon) throw createError("Invalid coupon", 404);

  const cart = await populateCart(userId);

  await resolveCouponDiscount(coupon, {
    userId,
    items: cart.items,
  });

  cart.coupon = coupon._id;
  await cart.save();

  return buildCartResponse(cart);
};
