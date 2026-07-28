import mongoose from "mongoose";
import { deepLinkSchema } from "./schemas/deepLink.schema.js";
import {
  targetingSchema,
  defaultTargeting,
} from "./schemas/targeting.schema.js";
import { ANNOUNCEMENT_TYPES } from "../constants/marketing.js";

const announcementSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ANNOUNCEMENT_TYPES,
      default: "top_bar",
      index: true,
    },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    startsAt: Date,
    endsAt: Date,
    backgroundColor: String,
    textColor: String,
    /** Legacy flat URL — kept in sync from deepLink when possible. */
    link: String,
    deepLink: { type: deepLinkSchema },
    dismissible: { type: Boolean, default: true },
    targeting: {
      type: targetingSchema,
      default: defaultTargeting,
    },
  },
  { timestamps: true }
);

announcementSchema.index({ isActive: 1, priority: -1 });
announcementSchema.index({ startsAt: 1, endsAt: 1 });

const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;
