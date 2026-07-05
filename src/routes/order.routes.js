import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getOrderSummary,
  getSellerOrders,
  getSellerOrderById,
  updateSellerOrderStatus,
} from "../controllers/order.controller.js";
import { protect, requireApprovedSeller } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/summary", getOrderSummary);

router.get("/seller", protect, requireApprovedSeller, getSellerOrders);
router.get("/seller/:id", protect, requireApprovedSeller, getSellerOrderById);
router.patch("/seller/:id/status", protect, requireApprovedSeller, updateSellerOrderStatus);

router.use(protect);
router.post("/", placeOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);

export default router;
