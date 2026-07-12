export { buildApplicationReceivedSellerEmail } from "./applicationReceived.js";
export { buildApplicationSubmittedAdminEmail } from "./applicationAdminAlert.js";
export { buildSellerApprovedEmail } from "./approved.js";
export { buildSellerRejectedEmail } from "./rejected.js";
export { buildSellerDeactivatedEmail } from "./deactivated.js";
export { buildSellerReactivatedEmail } from "./reactivated.js";
export { buildKycIncompleteEmail } from "./kycIncomplete.js";
export { buildProfileIncompleteEmail } from "./profileIncomplete.js";
export { buildPolicyUpdateEmail } from "./policyUpdate.js";

import { buildApplicationReceivedSellerEmail } from "./applicationReceived.js";
import { buildApplicationSubmittedAdminEmail } from "./applicationAdminAlert.js";
import { buildSellerApprovedEmail } from "./approved.js";
import { buildSellerRejectedEmail } from "./rejected.js";
import { buildSellerDeactivatedEmail } from "./deactivated.js";
import { buildSellerReactivatedEmail } from "./reactivated.js";
import { buildKycIncompleteEmail } from "./kycIncomplete.js";
import { buildProfileIncompleteEmail } from "./profileIncomplete.js";
import { buildPolicyUpdateEmail } from "./policyUpdate.js";

/** Registry for seller lifecycle templates (B1–B9). */
export const SELLER_TEMPLATES = {
  APPLICATION_SUBMITTED_SELLER: buildApplicationReceivedSellerEmail,
  APPLICATION_SUBMITTED_ADMIN: buildApplicationSubmittedAdminEmail,
  SELLER_APPROVED: buildSellerApprovedEmail,
  SELLER_REJECTED: buildSellerRejectedEmail,
  SELLER_DEACTIVATED: buildSellerDeactivatedEmail,
  SELLER_REACTIVATED: buildSellerReactivatedEmail,
  KYC_INCOMPLETE: buildKycIncompleteEmail,
  PROFILE_INCOMPLETE: buildProfileIncompleteEmail,
  POLICY_UPDATE: buildPolicyUpdateEmail,
};
