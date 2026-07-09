import { Router } from "express";
import {
  login,
  loginSeller,
  loginAdmin,
  logout,
  getProfile,
  updateProfile,
  deleteAccount,
} from "../controllers/user.controller.js";
import {
  sendSellerSignupOtp,
  verifySellerSignupOtp,
  registerSellerAccount,
  sendCustomerOtp,
  verifyCustomerOtp,
} from "../controllers/otp.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/send-otp", sendCustomerOtp);
router.post("/verify-otp", verifyCustomerOtp);
router.post("/login", login);
router.post("/seller/register", registerSellerAccount);
router.post("/seller/send-otp", sendSellerSignupOtp);
router.post("/seller/verify-otp", verifySellerSignupOtp);
router.post("/login/seller", loginSeller);
router.post("/login/admin", loginAdmin);
router.post("/logout", logout);
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.delete("/me", protect, deleteAccount);

export default router;
