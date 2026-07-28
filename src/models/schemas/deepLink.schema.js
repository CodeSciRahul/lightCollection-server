import mongoose from "mongoose";

export const DEEP_LINK_KINDS = [
  "product",
  "category",
  "brand",
  "collection",
  "external",
  "page",
];

/**
 * Structured storefront / external navigation target.
 * `ref` holds slug or id; `url` is used for external / custom page paths.
 */
export const deepLinkSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: DEEP_LINK_KINDS,
      default: "page",
    },
    ref: { type: String, trim: true },
    url: { type: String, trim: true },
  },
  { _id: false }
);
