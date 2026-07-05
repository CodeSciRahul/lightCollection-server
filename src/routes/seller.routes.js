import { Router } from "express";
import mongoose from "mongoose";
import {
  applyForSeller,
  getMySellerProfile,
  updateMySellerProfile,
  getSellerBySlug,
  getSellerById,
} from "../controllers/seller.controller.js";
import { getSellerStats } from "../controllers/admin.controller.js";
import { protect, authorize, requireSellerProfile, requireApprovedSeller } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const isMongoObjectId = (value) =>
  typeof value === "string" &&
  /^[a-fA-F0-9]{24}$/.test(value) &&
  new mongoose.Types.ObjectId(value).toString() === value;

/** Route by slug (public) vs MongoDB _id (protected admin lookup). */
const getSellerBySlugOrId = asyncHandler(async (req, res, next) => {
  const { slugOrId } = req.params;
  if (isMongoObjectId(slugOrId)) {
    req.params.id = slugOrId;
    return protect(req, res, () => getSellerById(req, res, next));
  }
  req.params.slug = slugOrId;
  return getSellerBySlug(req, res, next);
});

router.post("/apply", protect, authorize("seller"), applyForSeller);
router.get("/me/profile", protect, requireSellerProfile, getMySellerProfile);
router.patch("/me/profile", protect, requireSellerProfile, updateMySellerProfile);
router.get("/me/stats", protect, requireApprovedSeller, getSellerStats);
router.get("/:slugOrId", getSellerBySlugOrId);

export default router;
