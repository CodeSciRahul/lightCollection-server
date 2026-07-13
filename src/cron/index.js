import { appConfig } from "../config/index.js";
import { processPendingPaymentReminders } from "../services/paymentEmail.service.js";

let reminderTimer = null;

/**
 * Lightweight in-process scheduler for payment pending reminders (F5).
 * Runs every PAYMENT_REMINDER_CHECK_MINUTES (default 5).
 */
export const startCronJobs = () => {
  if (reminderTimer) return;

  const checkMinutes = Number(appConfig.payment?.reminderCheckMinutes) || 5;
  const intervalMs = Math.max(1, checkMinutes) * 60 * 1000;

  const tick = async () => {
    try {
      const result = await processPendingPaymentReminders();
      if (result.scanned > 0) {
        console.log(
          `[cron] payment reminders: scanned=${result.scanned}, minutes=${result.reminderMinutes}`
        );
      }
    } catch (err) {
      console.error("[cron] payment reminder job failed:", err.message || err);
    }
  };

  // First run after one check interval (avoid stampede on boot)
  reminderTimer = setInterval(tick, intervalMs);
  if (typeof reminderTimer.unref === "function") reminderTimer.unref();

  console.log(
    `[cron] Payment pending reminder job started (every ${checkMinutes}m, threshold ${appConfig.payment?.pendingReminderMinutes || 30}m)`
  );
};

export const stopCronJobs = () => {
  if (reminderTimer) {
    clearInterval(reminderTimer);
    reminderTimer = null;
  }
};
