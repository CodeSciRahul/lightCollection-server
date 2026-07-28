import { Router } from "express";
import { getBanners } from "../controllers/banner.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", optionalAuth, getBanners);

export default router;
