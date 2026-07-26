import mongoose from "mongoose";
import { storedImageSchema } from "./schemas/storedImage.schema.js";

const flashSaleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true, default: "" },
    badgeText: { type: String, default: "Flash Sale" },
    image: storedImageSchema,
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    productSource: {
      type: String,
      enum: ["ids", "sale"],
      default: "ids",
    },
    discountLabel: String,
    ctaText: { type: String, default: "Shop Deals" },
    ctaLink: String,
    backgroundColor: { type: String, default: "#1a1a1a" },
    textColor: { type: String, default: "#ffffff" },
    accentColor: { type: String, default: "#ffbf00" },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
  },
  { timestamps: true }
);

flashSaleSchema.index({ isActive: 1, startsAt: 1, endsAt: 1 });

const FlashSale = mongoose.model("FlashSale", flashSaleSchema);
export default FlashSale;
