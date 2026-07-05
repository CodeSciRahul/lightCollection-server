import { Router } from "express";
import userRoutes from "./user.routes.js";
import categoryRoutes from "./category.routes.js";
import productRoutes from "./product.routes.js";
import bannerRoutes from "./banner.routes.js";
import announcementRoutes from "./announcement.routes.js";
import cartRoutes from "./cart.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import addressRoutes from "./address.routes.js";
import orderRoutes from "./order.routes.js";
import couponRoutes from "./coupon.routes.js";
import reviewRoutes from "./review.routes.js";
import sellerRoutes from "./seller.routes.js";
import adminRoutes from "./admin.routes.js";
import uploadRoutes from "./upload.routes.js";
import paymentRoutes from "./payment.routes.js";
import webhookRoutes from "./webhook.routes.js";

const router = Router();

router.use("/auth", userRoutes);
router.use("/users", userRoutes);
router.use("/sellers", sellerRoutes);
router.use("/admin", adminRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/banners", bannerRoutes);
router.use("/announcements", announcementRoutes);
router.use("/cart", cartRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/addresses", addressRoutes);
router.use("/orders", orderRoutes);
router.use("/coupons", couponRoutes);
router.use("/reviews", reviewRoutes);
router.use("/uploads", uploadRoutes);
router.use("/payments", paymentRoutes);
router.use("/webhooks", webhookRoutes);

router.get("/health", (req, res) => {
  res.json({ success: true, message: "NileCart API is running" });
});

export default router;
