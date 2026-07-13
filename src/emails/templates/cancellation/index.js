export {
  buildCancelCustomerConfirmedEmail,
  buildCancelCustomerToSellerEmail,
} from "./customerCancel.js";
export {
  buildCancelPaidBlockedEmail,
  buildCancelOpsToCustomerEmail,
  buildCancelOpsToSellerEmail,
} from "./opsCancel.js";
export { buildCodRefusalEmail } from "./codRefusal.js";

import {
  buildCancelCustomerConfirmedEmail,
  buildCancelCustomerToSellerEmail,
} from "./customerCancel.js";
import {
  buildCancelPaidBlockedEmail,
  buildCancelOpsToCustomerEmail,
  buildCancelOpsToSellerEmail,
} from "./opsCancel.js";
import { buildCodRefusalEmail } from "./codRefusal.js";

/** Registry for cancellation emails (G1–G6). */
export const CANCELLATION_TEMPLATES = {
  CANCEL_CUSTOMER_CONFIRMED: buildCancelCustomerConfirmedEmail,
  CANCEL_CUSTOMER_TO_SELLER: buildCancelCustomerToSellerEmail,
  CANCEL_PAID_BLOCKED: buildCancelPaidBlockedEmail,
  CANCEL_OPS_TO_CUSTOMER: buildCancelOpsToCustomerEmail,
  CANCEL_OPS_TO_SELLER: buildCancelOpsToSellerEmail,
  CANCEL_COD_REFUSAL: buildCodRefusalEmail,
};
