import { Router } from "express";
import {
  getAnnouncements,
  getAnnouncementById,
} from "../controllers/announcement.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", optionalAuth, getAnnouncements);
router.get("/:id", optionalAuth, getAnnouncementById);

export default router;
