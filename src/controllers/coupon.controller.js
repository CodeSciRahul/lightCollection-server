import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as CouponService from "../services/coupon.service.js";

export const validateCoupon = serviceHandler((req) =>
  CouponService.validateCoupon({
    code: req.body.code,
    orderAmount: req.body.orderAmount ?? 0,
    userId: req.user?._id,
  })
);

export const listCoupons = serviceHandler(() => CouponService.listCoupons());

export const getPublicCoupons = serviceHandler(() => CouponService.getPublicCoupons());

export const createCoupon = serviceHandler(
  (req) => CouponService.createCoupon(req.body),
  201
);

export const updateCoupon = serviceHandler((req) =>
  CouponService.updateCoupon(req.params.id, req.body)
);

export const toggleCouponStatus = serviceHandler((req) =>
  CouponService.toggleCouponStatus(req.params.id, req.body)
);
