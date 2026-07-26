import { Router } from "express";
import { getCampaigns } from "../controllers/campaign.controller.js";

const router = Router();

router.get("/", getCampaigns);

export default router;
