import { Router } from "express";
import {
  listSellers,
  getSellerById,
  approveSeller,
  rejectSeller,
  deactivateSeller,
  reactivateSeller,
} from "../controllers/seller.controller.js";
import {
  listUsers,
  updateUserStatus,
  getAdminStats,
} from "../controllers/admin.controller.js";
import {
  getAdminOrders,
  updateAdminOrderStatus,
} from "../controllers/order.controller.js";
import {
  listCoupons,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
} from "../controllers/coupon.controller.js";
import {
  listBannersAdmin,
  createBanner,
  updateBanner,
  toggleBannerStatus,
  reorderBanners,
  deleteBanner,
} from "../controllers/banner.controller.js";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import {
  listAnnouncementsAdmin,
  createAnnouncement,
  updateAnnouncement,
  toggleAnnouncementStatus,
  deleteAnnouncement,
} from "../controllers/announcement.controller.js";
import {
  listHomeSectionsAdmin,
  createHomeSection,
  updateHomeSection,
  reorderHomeSections,
  toggleHomeSectionStatus,
  deleteHomeSection,
} from "../controllers/home.controller.js";
import {
  listCampaignsAdmin,
  createCampaign,
  updateCampaign,
  toggleCampaignStatus,
  deleteCampaign,
} from "../controllers/campaign.controller.js";
import {
  listCollectionsAdmin,
  createCollection,
  updateCollection,
  toggleCollectionStatus,
  deleteCollection,
} from "../controllers/collection.controller.js";
import {
  listFlashSalesAdmin,
  createFlashSale,
  updateFlashSale,
  toggleFlashSaleStatus,
  deleteFlashSale,
} from "../controllers/flashSale.controller.js";
import {
  listBrandsAdmin,
  createBrand,
  updateBrand,
  toggleBrandStatus,
  deleteBrand,
} from "../controllers/brand.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect, authorize("admin"));

router.get("/stats", getAdminStats);

router.get("/sellers", listSellers);
router.get("/sellers/:id", getSellerById);
router.patch("/sellers/:id/approve", approveSeller);
router.patch("/sellers/:id/reject", rejectSeller);
router.patch("/sellers/:id/deactivate", deactivateSeller);
router.patch("/sellers/:id/reactivate", reactivateSeller);

router.get("/users", listUsers);
router.patch("/users/:id/status", updateUserStatus);

router.get("/orders", getAdminOrders);
router.patch("/orders/:id/status", updateAdminOrderStatus);

router.get("/coupons", listCoupons);
router.post("/coupons", createCoupon);
router.put("/coupons/:id", updateCoupon);
router.patch("/coupons/:id/status", toggleCouponStatus);

router.get("/banners", listBannersAdmin);
router.post("/banners", createBanner);
router.put("/banners/reorder", reorderBanners);
router.put("/banners/:id", updateBanner);
router.patch("/banners/:id/status", toggleBannerStatus);
router.delete("/banners/:id", deleteBanner);

router.get("/categories", (req, res, next) => {
  req.query.includeInactive = "true";
  return getCategories(req, res, next);
});
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

router.get("/announcements", listAnnouncementsAdmin);
router.post("/announcements", createAnnouncement);
router.put("/announcements/:id", updateAnnouncement);
router.patch("/announcements/:id/status", toggleAnnouncementStatus);
router.delete("/announcements/:id", deleteAnnouncement);

router.get("/home-sections", listHomeSectionsAdmin);
router.post("/home-sections", createHomeSection);
router.put("/home-sections/reorder", reorderHomeSections);
router.put("/home-sections/:id", updateHomeSection);
router.patch("/home-sections/:id/status", toggleHomeSectionStatus);
router.delete("/home-sections/:id", deleteHomeSection);

router.get("/campaigns", listCampaignsAdmin);
router.post("/campaigns", createCampaign);
router.put("/campaigns/:id", updateCampaign);
router.patch("/campaigns/:id/status", toggleCampaignStatus);
router.delete("/campaigns/:id", deleteCampaign);

router.get("/collections", listCollectionsAdmin);
router.post("/collections", createCollection);
router.put("/collections/:id", updateCollection);
router.patch("/collections/:id/status", toggleCollectionStatus);
router.delete("/collections/:id", deleteCollection);

router.get("/flash-sales", listFlashSalesAdmin);
router.post("/flash-sales", createFlashSale);
router.put("/flash-sales/:id", updateFlashSale);
router.patch("/flash-sales/:id/status", toggleFlashSaleStatus);
router.delete("/flash-sales/:id", deleteFlashSale);

router.get("/brands", listBrandsAdmin);
router.post("/brands", createBrand);
router.put("/brands/:id", updateBrand);
router.patch("/brands/:id/status", toggleBrandStatus);
router.delete("/brands/:id", deleteBrand);

export default router;
