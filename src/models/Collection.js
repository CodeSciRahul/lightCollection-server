import mongoose from "mongoose";
import { storedImageSchema } from "./schemas/storedImage.schema.js";

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    image: storedImageSchema,
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    ctaText: { type: String, default: "Explore Collection" },
    ctaLink: String,
    backgroundColor: String,
    textColor: String,
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startsAt: Date,
    endsAt: Date,
  },
  { timestamps: true }
);

collectionSchema.index({ isActive: 1, displayOrder: 1 });
collectionSchema.index({ slug: 1 });

const Collection = mongoose.model("Collection", collectionSchema);
export default Collection;
