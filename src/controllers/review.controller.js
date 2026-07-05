import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as ReviewService from "../services/review.service.js";

export const getProductReviews = serviceHandler((req) =>
  ReviewService.getProductReviews(req.params.productId, req.query)
);

export const createReview = serviceHandler(
  (req) => ReviewService.createReview(req.user._id, req.body),
  201
);

export const deleteReview = serviceHandler((req) =>
  ReviewService.deleteReview(req.user._id, req.params.id)
);
