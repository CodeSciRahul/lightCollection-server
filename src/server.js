import process from "process";
import { createApp } from "./app.js";
import { appConfig, connectDB } from "./config/index.js";
import { startCronJobs, stopCronJobs } from "./cron/index.js";

const app = createApp();

const start = async () => {
  await connectDB();
  const server = app.listen(appConfig.port, () => {
    console.log(`Server running on http://localhost:${appConfig.port}`);
  });

  startCronJobs();

  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    stopCronJobs();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  process.exit(1);
});
