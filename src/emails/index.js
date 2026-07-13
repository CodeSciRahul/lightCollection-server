import { SELLER_TEMPLATES } from "./templates/seller/index.js";
import { INVENTORY_TEMPLATES } from "./templates/inventory/index.js";
import { ORDER_TEMPLATES } from "./templates/order/index.js";
import { PAYMENT_TEMPLATES } from "./templates/payment/index.js";
import { CANCELLATION_TEMPLATES } from "./templates/cancellation/index.js";
import {
  SELLER_EVENT_META,
  INVENTORY_EVENT_META,
  ORDER_EVENT_META,
  PAYMENT_EVENT_META,
  CANCELLATION_EVENT_META,
  resolveFromAddress,
} from "./senders.js";
import { brand } from "./design/tokens.js";

const renderWithMeta = (templates, metaMap, label) => (eventKey, data = {}) => {
  const build = templates[eventKey];
  if (!build) {
    throw new Error(`Unknown ${label} email template: ${eventKey}`);
  }

  const meta = metaMap[eventKey];
  const { html, text } = build(data);
  const subject =
    typeof meta.subject === "function" ? meta.subject(data) : meta.subject;

  return {
    eventKey,
    id: meta.id,
    priority: meta.priority,
    senderKey: meta.sender,
    subject,
    html,
    text,
    replyTo: meta.replyTo,
  };
};

export const renderSellerEmail = renderWithMeta(
  SELLER_TEMPLATES,
  SELLER_EVENT_META,
  "seller"
);

export const renderInventoryEmail = renderWithMeta(
  INVENTORY_TEMPLATES,
  INVENTORY_EVENT_META,
  "inventory"
);

export const renderOrderEmail = renderWithMeta(
  ORDER_TEMPLATES,
  ORDER_EVENT_META,
  "order"
);

export const renderPaymentEmail = renderWithMeta(
  PAYMENT_TEMPLATES,
  PAYMENT_EVENT_META,
  "payment"
);

export const renderCancellationEmail = renderWithMeta(
  CANCELLATION_TEMPLATES,
  CANCELLATION_EVENT_META,
  "cancellation"
);

export const buildFromHeader = (senderKey, config = {}) => {
  const from = resolveFromAddress(senderKey, {
    domain: config.emailDomain || brand.domain,
    overrides: config.fromOverrides || {},
  });

  if (!from && config.defaultFrom) return config.defaultFrom;
  return from;
};

export * from "./templates/seller/index.js";
export * from "./templates/inventory/index.js";
export * from "./templates/order/index.js";
export * from "./templates/payment/index.js";
export * from "./templates/cancellation/index.js";
export * from "./senders.js";
export * from "./design/tokens.js";
export * from "./components/index.js";
