import mongoose from "mongoose";

export const TARGETING_DEVICES = ["all", "desktop", "mobile"];
export const TARGETING_AUTH = ["all", "guest", "authenticated"];

/**
 * Audience rules for marketing content (device + auth visibility).
 */
export const targetingSchema = new mongoose.Schema(
  {
    devices: {
      type: [String],
      enum: TARGETING_DEVICES,
      default: ["all"],
    },
    auth: {
      type: String,
      enum: TARGETING_AUTH,
      default: "all",
    },
  },
  { _id: false }
);

export const defaultTargeting = () => ({
  devices: ["all"],
  auth: "all",
});
