import mongoose from "mongoose";
import process from "process";
import { appConfig } from "./env.js";

export const connectDB = async () => {
  const uri = appConfig.mongodb.uri;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in .env");
  }
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error to connect db", error?.message);
    process.exit(1);
  }
};
