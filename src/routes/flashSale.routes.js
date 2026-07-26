import { Router } from "express";
import { getFlashSales } from "../controllers/flashSale.controller.js";

const router = Router();

router.get("/", getFlashSales);

export default router;
