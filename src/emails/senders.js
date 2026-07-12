import { brand, defaults } from "./design/tokens.js";

/**
 * Domain-based transactional sender addresses.
 * Override via env (EMAIL_FROM_*). Display name is always NileCart.
 */
export const EMAIL_SENDERS = {
  accounts: {
    key: "accounts",
    local: "accounts",
    displayName: brand.name,
    purpose: "Authentication and account verification",
  },
  seller: {
    key: "seller",
    local: "seller",
    displayName: `${brand.name} Sellers`,
    purpose: "Seller onboarding and lifecycle",
  },
  admin: {
    key: "admin",
    local: "admin",
    displayName: `${brand.name} Admin`,
    purpose: "Administrative and ops notifications",
  },
  support: {
    key: "support",
    local: "support",
    displayName: `${brand.name} Support`,
    purpose: "Support and ticket communication",
  },
  security: {
    key: "security",
    local: "security",
    displayName: `${brand.name} Security`,
    purpose: "Security alerts",
  },
  legal: {
    key: "legal",
    local: "legal",
    displayName: `${brand.name} Legal`,
    purpose: "Policy and terms updates",
  },
  noreply: {
    key: "noreply",
    local: "no-reply",
    displayName: brand.name,
    purpose: "One-way automated system emails",
  },
};

export const resolveFromAddress = (senderKey, { domain, overrides = {} } = {}) => {
  const sender = EMAIL_SENDERS[senderKey] || EMAIL_SENDERS.noreply;
  const emailDomain = domain || brand.domain;
  const override = overrides[sender.key];

  if (override) {
    // Accept either "email@domain" or "Display Name <email@domain>"
    if (override.includes("<") && override.includes(">")) {
      return override;
    }
    return `${sender.displayName} <${override}>`;
  }

  return `${sender.displayName} <${sender.local}@${emailDomain}>`;
};

export const SELLER_EVENT_META = {
  APPLICATION_SUBMITTED_SELLER: {
    id: "B1",
    sender: "seller",
    subject: ({ storeName } = {}) =>
      storeName
        ? `We received your ${brand.name} seller application — ${storeName}`
        : `We received your ${brand.name} seller application`,
    priority: "Important",
  },
  APPLICATION_SUBMITTED_ADMIN: {
    id: "B2",
    sender: "admin",
    subject: ({ storeName } = {}) =>
      `New seller application: ${storeName || "Untitled store"}`,
    priority: "Important",
  },
  SELLER_APPROVED: {
    id: "B3",
    sender: "seller",
    subject: () => `You're approved — start selling on ${brand.name}`,
    priority: "Critical",
  },
  SELLER_REJECTED: {
    id: "B4",
    sender: "seller",
    subject: () => `Update on your ${brand.name} seller application`,
    priority: "Critical",
  },
  SELLER_DEACTIVATED: {
    id: "B5",
    sender: "seller",
    subject: () => `Your ${brand.name} seller account is deactivated`,
    priority: "Critical",
  },
  SELLER_REACTIVATED: {
    id: "B6",
    sender: "seller",
    subject: () => `Your seller account is active again`,
    priority: "Important",
  },
  KYC_INCOMPLETE: {
    id: "B7",
    sender: "seller",
    subject: () => `Action required: complete seller verification`,
    priority: "Critical",
  },
  PROFILE_INCOMPLETE: {
    id: "B8",
    sender: "seller",
    subject: () => `Finish setting up your ${brand.name} store`,
    priority: "Optional",
  },
  POLICY_UPDATE: {
    id: "B9",
    sender: "legal",
    subject: () => `Important update to ${brand.name} seller terms`,
    priority: "Important",
    replyTo: defaults.legalEmail,
  },
};
