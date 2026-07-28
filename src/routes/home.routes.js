import { Router } from "express";
import { getHomePage } from "../controllers/home.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", optionalAuth, getHomePage);

export default router;
