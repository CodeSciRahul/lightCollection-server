import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { appConfig } from "./config/index.js";
import { initFirebaseAdmin } from "./vendor/firebase.vendor.js";
import apiRoutes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/index.js";

export const createApp = () => {
  const app = express();

  initFirebaseAdmin();

  app.use(
    cors({
      origin: appConfig.clientUrl.split(",").map((url) => url.trim()),
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.use("/api", apiRoutes);

  app.get("/", async (req, res) => {
    res.send("Server is running...");
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
