import mongoose from "mongoose";
import { storedImageSchema } from "./schemas/storedImage.schema.js";
import { CAMPAIGN_TYPES } from "../constants/homeSections.js";

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    type: {
      type: String,
      enum: CAMPAIGN_TYPES,
      default: "promotional",
    },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    image: storedImageSchema,
    mobileImage: storedImageSchema,
    backgroundColor: { type: String, default: "#111111" },
    textColor: { type: String, default: "#ffffff" },
    accentColor: String,
    ctaText: { type: String, default: "Shop Now" },
    ctaLink: String,
    deepLink: String,
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startsAt: Date,
    endsAt: Date,
    popupFrequency: {
      type: String,
      enum: ["once", "session", "always"],
      default: "session",
    },
    dismissible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

campaignSchema.index({ isActive: 1, type: 1, displayOrder: 1 });
campaignSchema.index({ slug: 1 });

const Campaign = mongoose.model("Campaign", campaignSchema);
export default Campaign;
