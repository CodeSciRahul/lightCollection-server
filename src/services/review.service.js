import * as ReviewRepository from "../repositories/review.repository.js";
import * as ProductRepository from "../repositories/product.repository.js";
import * as OrderRepository from "../repositories/order.repository.js";
import {
  getImageUrl,
  normalizeStoredImages,
  toPublicImageUrls,
} from "../utils/helpers/storedImageHelpers.js";
import { createError } from "../utils/AppError.js";

const refreshProductRating = async (productId) => {
  const stats = await ReviewRepository.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: "$product",
        average: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const average = stats[0]?.average ? Math.round(stats[0].average * 10) / 10 : 0;
  const count = stats[0]?.count || 0;

  await ProductRepository.findByIdAndUpdate(productId, {
    rating: { average, count },
  });
};

export const getProductReviews = async (productId, { page = 1, limit = 10 }) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(30, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const filter = {
    product: productId,
    isApproved: true,
  };

  const reviews = await ReviewRepository.find(filter)
    .populate("user", "name avatar")
    .sort("-createdAt")
    .skip(skip)
    .limit(limitNum);

  const total = await ReviewRepository.countDocuments(filter);

  return {
    reviews: reviews.map((review) => {
      const obj = review.toObject();
      return {
        ...obj,
        images: toPublicImageUrls(obj.images),
        user: obj.user
          ? { ...obj.user, avatar: getImageUrl(obj.user.avatar) }
          : obj.user,
      };
    }),
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  };
};

export const createReview = async (userId, body) => {
  const { productId, rating, title, comment, orderId, images } = body;

  if (!productId || !rating) {
    throw createError("productId and rating are required");
  }

  const product = await ProductRepository.findById(productId);
  if (!product) throw createError("Product not found", 404);

  let isVerifiedPurchase = false;
  if (orderId) {
    const order = await OrderRepository.findOne({
      _id: orderId,
      user: userId,
      orderStatus: "delivered",
      "items.product": productId,
    });
    isVerifiedPurchase = !!order;
  }

  const review = await ReviewRepository.create({
    user: userId,
    product: productId,
    order: orderId,
    rating,
    title,
    comment,
    images: normalizeStoredImages(images),
    isVerifiedPurchase,
  });

  await refreshProductRating(productId);
  return { review, __status: 201 };
};

export const deleteReview = async (userId, reviewId) => {
  const review = await ReviewRepository.findOneAndDelete({
    _id: reviewId,
    user: userId,
  });

  if (!review) throw createError("Review not found", 404);
  await refreshProductRating(review.product);
  return { message: "Review deleted" };
};
