import { Router } from "express";
import { handleFlutterwaveWebhook } from "../controllers/payment.controller.js";
import { verifyFlutterwaveWebhook } from "../middlewares/flutterwaveWebhook.middleware.js";

const router = Router();

router.post("/flutterwave", verifyFlutterwaveWebhook, handleFlutterwaveWebhook);

export default router;
