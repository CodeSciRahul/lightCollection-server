import { Router } from "express";
import { validateCoupon, getPublicCoupons } from "../controllers/coupon.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/active", getPublicCoupons);
router.post("/validate", optionalAuth, validateCoupon);

export default router;
