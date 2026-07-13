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
  inventory: {
    key: "inventory",
    local: "inventory",
    displayName: `${brand.name} Inventory`,
    purpose: "Catalog and stock alerts",
  },
  orders: {
    key: "orders",
    local: "orders",
    displayName: `${brand.name} Orders`,
    purpose: "Order confirmations and status updates",
  },
  shipping: {
    key: "shipping",
    local: "shipping",
    displayName: `${brand.name} Shipping`,
    purpose: "Shipment and delivery updates",
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

export const INVENTORY_EVENT_META = {
  LOW_STOCK: {
    id: "C4",
    sender: "inventory",
    subject: ({ productTitle, variantSku, currentStock } = {}) =>
      `Low stock alert: ${productTitle || "Product"}${
        variantSku ? ` (${variantSku})` : ""
      } — ${currentStock ?? "?"} left`,
    priority: "Important",
  },
  OUT_OF_STOCK: {
    id: "C5",
    sender: "inventory",
    subject: ({ productTitle, variantSku } = {}) =>
      `Out of stock: ${productTitle || "Product"}${
        variantSku ? ` (${variantSku})` : ""
      }`,
    priority: "Important",
  },
};

export const ORDER_EVENT_META = {
  ORDER_PLACED_CUSTOMER: {
    id: "E1",
    sender: "orders",
    subject: ({ orderNumber, paymentMethod, paymentStatus } = {}) => {
      const needsPay =
        paymentMethod === "card" && paymentStatus !== "paid";
      return needsPay
        ? `Complete payment for order ${orderNumber || ""}`.trim()
        : `Order confirmed: ${orderNumber || ""}`.trim();
    },
    priority: "Critical",
  },
  ORDER_PLACED_SELLER: {
    id: "E2",
    sender: "orders",
    subject: ({ orderNumber } = {}) =>
      `New order ${orderNumber || ""} — action required`.trim(),
    priority: "Critical",
  },
  ORDER_CONFIRMED_CUSTOMER: {
    id: "E5",
    sender: "orders",
    subject: ({ orderNumber } = {}) =>
      `We’re preparing order ${orderNumber || ""}`.trim(),
    priority: "Critical",
  },
  ORDER_PACKED_CUSTOMER: {
    id: "E6",
    sender: "orders",
    subject: ({ orderNumber } = {}) =>
      `Order ${orderNumber || ""} is packed`.trim(),
    priority: "Important",
  },
  ORDER_SHIPPED_CUSTOMER: {
    id: "E8",
    sender: "shipping",
    subject: ({ orderNumber } = {}) =>
      `Order ${orderNumber || ""} has shipped`.trim(),
    priority: "Critical",
  },
  ORDER_OUT_FOR_DELIVERY_CUSTOMER: {
    id: "E9",
    sender: "shipping",
    subject: ({ orderNumber } = {}) =>
      `Order ${orderNumber || ""} is out for delivery`.trim(),
    priority: "Critical",
  },
  ORDER_DELIVERED_CUSTOMER: {
    id: "E10",
    sender: "orders",
    subject: ({ orderNumber } = {}) =>
      `Delivered: order ${orderNumber || ""}`.trim(),
    priority: "Critical",
  },
  ORDER_DELIVERED_SELLER: {
    id: "E11",
    sender: "orders",
    subject: ({ orderNumber } = {}) =>
      `Order ${orderNumber || ""} delivered`.trim(),
    priority: "Important",
  },
  ORDER_CANCELLED_CUSTOMER: {
    id: "G1",
    sender: "orders",
    subject: ({ orderNumber } = {}) =>
      `Order ${orderNumber || ""} cancelled`.trim(),
    priority: "Critical",
  },
  ORDER_CANCELLED_SELLER: {
    id: "G2",
    sender: "orders",
    subject: ({ orderNumber } = {}) =>
      `Order ${orderNumber || ""} was cancelled`.trim(),
    priority: "Critical",
  },
};
