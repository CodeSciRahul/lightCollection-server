export { buildPaymentSuccessCustomerEmail } from "./successfulCustomer.js";
export { buildPaymentSuccessSellerEmail } from "./successfulSeller.js";
export {
  buildPaymentFailedCustomerEmail,
  buildPaymentFailedSellerEmail,
} from "./failed.js";
export {
  buildPaymentPendingReminderEmail,
  buildPaymentRetryEmail,
} from "./reminderAndRetry.js";
export { buildPaymentMismatchAdminEmail } from "./mismatchAdmin.js";
export {
  buildPaymentAdjustmentEmail,
  buildSellerPayoutEmail,
  buildPayoutFailedEmail,
  buildCommissionStatementEmail,
} from "./financeFuture.js";

import { buildPaymentSuccessCustomerEmail } from "./successfulCustomer.js";
import { buildPaymentSuccessSellerEmail } from "./successfulSeller.js";
import {
  buildPaymentFailedCustomerEmail,
  buildPaymentFailedSellerEmail,
} from "./failed.js";
import {
  buildPaymentPendingReminderEmail,
  buildPaymentRetryEmail,
} from "./reminderAndRetry.js";
import { buildPaymentMismatchAdminEmail } from "./mismatchAdmin.js";
import {
  buildPaymentAdjustmentEmail,
  buildSellerPayoutEmail,
  buildPayoutFailedEmail,
  buildCommissionStatementEmail,
} from "./financeFuture.js";

/** Registry for payment emails (F1–F11). */
export const PAYMENT_TEMPLATES = {
  PAYMENT_SUCCESS_CUSTOMER: buildPaymentSuccessCustomerEmail,
  PAYMENT_SUCCESS_SELLER: buildPaymentSuccessSellerEmail,
  PAYMENT_FAILED_CUSTOMER: buildPaymentFailedCustomerEmail,
  PAYMENT_FAILED_SELLER: buildPaymentFailedSellerEmail,
  PAYMENT_PENDING_REMINDER: buildPaymentPendingReminderEmail,
  PAYMENT_RETRY: buildPaymentRetryEmail,
  PAYMENT_MISMATCH_ADMIN: buildPaymentMismatchAdminEmail,
  PAYMENT_ADJUSTMENT: buildPaymentAdjustmentEmail,
  SELLER_PAYOUT: buildSellerPayoutEmail,
  PAYOUT_FAILED: buildPayoutFailedEmail,
  COMMISSION_STATEMENT: buildCommissionStatementEmail,
};
