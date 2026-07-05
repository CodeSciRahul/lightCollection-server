import * as CouponRepository from "../repositories/coupon.repository.js";
import {
  assertCouponForUser,
  calculateCouponDiscount,
} from "../utils/helpers/couponHelpers.js";
import { createError } from "../utils/AppError.js";

export const validateCoupon = async ({ code, orderAmount = 0, userId }) => {
  const coupon = await CouponRepository.findActiveByCode(code);
  if (!coupon) throw createError("Invalid coupon code", 404);

  if (userId) {
    await assertCouponForUser(coupon, userId);
  } else {
    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      throw createError("Coupon not yet active");
    }
    if (coupon.endsAt && coupon.endsAt < now) {
      throw createError("Coupon expired");
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw createError("Coupon usage limit reached");
    }
  }

  if (orderAmount < (coupon.minOrderAmount || 0)) {
    throw createError(`Minimum order amount is ₹${coupon.minOrderAmount}`);
  }

  const discount = calculateCouponDiscount(coupon, orderAmount);

  return {
    coupon: {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxUsesPerUser: coupon.maxUsesPerUser,
      eligibleUserType: coupon.eligibleUserType,
    },
    discount: Math.min(discount, orderAmount),
  };
};

export const listCoupons = async () => {
  const coupons = await CouponRepository.findAllSorted();
  return { coupons };
};

export const getPublicCoupons = async () => {
  const now = new Date();
  const coupons = await CouponRepository.find({
    isActive: true,
    sponsoredBy: "platform",
    $and: [
      { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
    ],
  })
    .select(
      "code description discountType discountValue minOrderAmount maxDiscount eligibleUserType maxUsesPerUser usageLimit usedCount"
    )
    .sort("-createdAt");

  const available = coupons.filter(
    (coupon) => !coupon.usageLimit || coupon.usedCount < coupon.usageLimit
  );

  return { coupons: available };
};

const buildCouponPayload = (body) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    usageLimit,
    maxUsesPerUser,
    restoreOnCancel,
    eligibleUserType,
    sponsoredBy,
    seller,
    applicableCategories,
    applicableProducts,
    startsAt,
    endsAt,
  } = body;

  return {
    code: code?.toUpperCase(),
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    usageLimit,
    maxUsesPerUser,
    restoreOnCancel,
    eligibleUserType,
    sponsoredBy,
    seller,
    applicableCategories,
    applicableProducts,
    startsAt,
    endsAt,
  };
};

export const createCoupon = async (body) => {
  const { code, discountType, discountValue } = body;

  if (!code || !discountType || discountValue === undefined) {
    throw createError("code, discountType, and discountValue are required");
  }

  const coupon = await CouponRepository.create(buildCouponPayload(body));
  return { coupon, __status: 201 };
};

export const updateCoupon = async (id, body) => {
  const coupon = await CouponRepository.findById(id);
  if (!coupon) throw createError("Coupon not found", 404);

  const allowed = [
    "description",
    "discountType",
    "discountValue",
    "minOrderAmount",
    "maxDiscount",
    "usageLimit",
    "maxUsesPerUser",
    "restoreOnCancel",
    "eligibleUserType",
    "sponsoredBy",
    "seller",
    "applicableCategories",
    "applicableProducts",
    "startsAt",
    "endsAt",
  ];

  allowed.forEach((field) => {
    if (body[field] !== undefined) coupon[field] = body[field];
  });

  if (body.code) coupon.code = body.code.toUpperCase();

  if (body.seller !== undefined) {
    coupon.seller = body.seller || undefined;
  }

  await coupon.save();
  return { coupon };
};

export const toggleCouponStatus = async (id, body) => {
  const coupon = await CouponRepository.findById(id);
  if (!coupon) throw createError("Coupon not found", 404);

  coupon.isActive =
    typeof body.isActive === "boolean" ? body.isActive : !coupon.isActive;
  await coupon.save();

  return { coupon };
};
