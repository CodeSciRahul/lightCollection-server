import { appConfig } from "../config/index.js";
import { sendSellerLifecycleEmail } from "./email.service.js";
import { defaults } from "../emails/design/tokens.js";

const joinUrl = (base, path = "") => {
  if (!base) return path || undefined;
  const normalized = String(base).replace(/\/$/, "");
  if (!path) return normalized;
  return `${normalized}${path.startsWith("/") ? path : `/${path}`}`;
};

const dashboardBase = () =>
  appConfig.dashboardUrl || appConfig.clientUrl || "http://localhost:5173";

const storefrontBase = () => appConfig.storefrontUrl || "http://localhost:3000";

const sellerUrls = (seller) => {
  const dash = dashboardBase();
  return {
    dashboardUrl: joinUrl(dash, "/seller"),
    addProductUrl: joinUrl(dash, "/seller/products/new"),
    profileUrl: joinUrl(dash, "/seller/profile"),
    ordersUrl: joinUrl(dash, "/seller/orders"),
    reapplyUrl: joinUrl(dash, "/seller/onboarding"),
    verificationUrl: joinUrl(dash, "/seller/profile"),
    adminReviewUrl: joinUrl(dash, `/admin/sellers/${seller?._id || seller?.id || ""}`),
    storefrontUrl: seller?.storeSlug
      ? joinUrl(storefrontBase(), `/store/${seller.storeSlug}`)
      : storefrontBase(),
    appealUrl: joinUrl(storefrontBase(), "/help/seller-appeal"),
    supportUrl: joinUrl(storefrontBase(), "/help"),
    policyUrl: joinUrl(storefrontBase(), "/legal/seller-terms"),
  };
};

const sellerUserEmail = (seller) =>
  seller?.user?.email || seller?.email || null;

const sellerDisplayName = (seller) =>
  seller?.user?.name || seller?.storeName || "Seller";

const documentStatus = (seller) => ({
  idProof: Boolean(seller?.documents?.idProof?.url || seller?.documents?.idProof?.key),
  businessProof: Boolean(
    seller?.documents?.businessProof?.url || seller?.documents?.businessProof?.key
  ),
  addressProof: Boolean(
    seller?.documents?.addressProof?.url || seller?.documents?.addressProof?.key
  ),
});

/**
 * Fire-and-forget safe send — never blocks seller workflows on email failure.
 */
const safeSend = async (label, fn) => {
  try {
    return await fn();
  } catch (error) {
    console.error(`[sellerEmail] ${label} failed:`, error.message || error);
    return { sent: false, error };
  }
};

/** B1 + B2 — application submitted */
export const notifySellerApplicationSubmitted = async (seller, user) => {
  const urls = sellerUrls(seller);
  const sellerEmail = user?.email || sellerUserEmail(seller);
  const sellerName = user?.name || sellerDisplayName(seller);
  const payloadBase = {
    sellerName,
    storeName: seller.storeName,
    applicationId: String(seller._id),
    submittedAt: seller.createdAt || new Date(),
    reviewTimelineDays: defaults.reviewTimelineDays,
    ...urls,
  };

  const results = {};

  if (sellerEmail) {
    results.seller = await safeSend("B1", () =>
      sendSellerLifecycleEmail("APPLICATION_SUBMITTED_SELLER", {
        to: sellerEmail,
        data: payloadBase,
      })
    );
  }

  const adminRecipients =
    appConfig.email?.adminNotifyEmails?.length > 0
      ? appConfig.email.adminNotifyEmails
      : appConfig.admin?.email
        ? [appConfig.admin.email]
        : [];

  if (adminRecipients.length) {
    results.admin = await safeSend("B2", () =>
      sendSellerLifecycleEmail("APPLICATION_SUBMITTED_ADMIN", {
        to: adminRecipients,
        data: {
          ...payloadBase,
          sellerEmail: sellerEmail || "—",
          sellerMobile: user?.mobileNumber || seller?.user?.mobileNumber || "—",
          nationalId: seller.nationalId,
          tinNumber: seller.tinNumber,
          city: seller.address?.city,
          country: seller.address?.country,
          documentStatus: documentStatus(seller),
        },
      })
    );
  }

  return results;
};

/** B3 — approved */
export const notifySellerApproved = async (seller) => {
  const to = sellerUserEmail(seller);
  if (!to) return { sent: false, reason: "missing_email" };

  const urls = sellerUrls(seller);
  return safeSend("B3", () =>
    sendSellerLifecycleEmail("SELLER_APPROVED", {
      to,
      data: {
        sellerName: sellerDisplayName(seller),
        storeName: seller.storeName,
        commissionRate: seller.commissionRate,
        approvedAt: new Date(),
        ...urls,
      },
    })
  );
};

/** B4 — rejected */
export const notifySellerRejected = async (seller) => {
  const to = sellerUserEmail(seller);
  if (!to) return { sent: false, reason: "missing_email" };

  const urls = sellerUrls(seller);
  return safeSend("B4", () =>
    sendSellerLifecycleEmail("SELLER_REJECTED", {
      to,
      data: {
        sellerName: sellerDisplayName(seller),
        storeName: seller.storeName,
        rejectionReason: seller.rejectionReason,
        rejectedAt: new Date(),
        ...urls,
      },
    })
  );
};

/** B5 — deactivated */
export const notifySellerDeactivated = async (seller, { reason } = {}) => {
  const to = sellerUserEmail(seller);
  if (!to) return { sent: false, reason: "missing_email" };

  const urls = sellerUrls(seller);
  return safeSend("B5", () =>
    sendSellerLifecycleEmail("SELLER_DEACTIVATED", {
      to,
      data: {
        sellerName: sellerDisplayName(seller),
        storeName: seller.storeName,
        reason,
        deactivatedAt: new Date(),
        ...urls,
      },
    })
  );
};

/** B6 — reactivated */
export const notifySellerReactivated = async (seller) => {
  const to = sellerUserEmail(seller);
  if (!to) return { sent: false, reason: "missing_email" };

  const urls = sellerUrls(seller);
  return safeSend("B6", () =>
    sendSellerLifecycleEmail("SELLER_REACTIVATED", {
      to,
      data: {
        sellerName: sellerDisplayName(seller),
        storeName: seller.storeName,
        reactivatedAt: new Date(),
        ...urls,
      },
    })
  );
};

/** B7 — KYC incomplete (callable from cron / admin tools) */
export const notifySellerKycIncomplete = async (
  seller,
  { missingDocuments, expiredDocuments, dueDate } = {}
) => {
  const to = sellerUserEmail(seller);
  if (!to) return { sent: false, reason: "missing_email" };

  const urls = sellerUrls(seller);
  return safeSend("B7", () =>
    sendSellerLifecycleEmail("KYC_INCOMPLETE", {
      to,
      data: {
        sellerName: sellerDisplayName(seller),
        storeName: seller.storeName,
        missingDocuments,
        expiredDocuments,
        dueDate,
        ...urls,
      },
    })
  );
};

/** B8 — profile incomplete reminder */
export const notifySellerProfileIncomplete = async (
  seller,
  { incompleteFields, completionPercent } = {}
) => {
  const to = sellerUserEmail(seller);
  if (!to) return { sent: false, reason: "missing_email" };

  const urls = sellerUrls(seller);
  return safeSend("B8", () =>
    sendSellerLifecycleEmail("PROFILE_INCOMPLETE", {
      to,
      data: {
        sellerName: sellerDisplayName(seller),
        storeName: seller.storeName,
        incompleteFields,
        completionPercent,
        ...urls,
      },
    })
  );
};

/** B9 — policy / commission update (broadcast helper) */
export const notifySellerPolicyUpdate = async (
  seller,
  {
    updateTitle,
    summary,
    changes,
    effectiveDate,
    previousCommission,
    newCommission,
    policyUrl,
    acknowledgeUrl,
  } = {}
) => {
  const to = sellerUserEmail(seller);
  if (!to) return { sent: false, reason: "missing_email" };

  const urls = sellerUrls(seller);
  return safeSend("B9", () =>
    sendSellerLifecycleEmail("POLICY_UPDATE", {
      to,
      data: {
        sellerName: sellerDisplayName(seller),
        storeName: seller.storeName,
        updateTitle,
        summary,
        changes,
        effectiveDate,
        previousCommission,
        newCommission,
        policyUrl: policyUrl || urls.policyUrl,
        acknowledgeUrl,
        ...urls,
      },
    })
  );
};

/**
 * Detect incomplete profile fields for B8 nudges.
 */
export const getIncompleteSellerProfileFields = (seller) => {
  const incomplete = [];
  if (!seller?.logo?.url && !seller?.logo?.key) incomplete.push("Store logo");
  if (!seller?.banner?.url && !seller?.banner?.key) incomplete.push("Store banner");
  if (!seller?.description?.trim()) incomplete.push("Store description");
  if (!seller?.bankDetails?.accountNumber) incomplete.push("Bank payout details");
  if (!seller?.address?.addressLine) incomplete.push("Store address");
  return incomplete;
};
