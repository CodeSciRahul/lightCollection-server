import { SELLER_TEMPLATES } from "./templates/seller/index.js";
import { INVENTORY_TEMPLATES } from "./templates/inventory/index.js";
import {
  SELLER_EVENT_META,
  INVENTORY_EVENT_META,
  resolveFromAddress,
} from "./senders.js";
import { brand } from "./design/tokens.js";

/**
 * Render a seller lifecycle email by event key.
 * @param {keyof typeof SELLER_TEMPLATES} eventKey
 * @param {object} data
 */
export const renderSellerEmail = (eventKey, data = {}) => {
  const build = SELLER_TEMPLATES[eventKey];
  if (!build) {
    throw new Error(`Unknown seller email template: ${eventKey}`);
  }

  const meta = SELLER_EVENT_META[eventKey];
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

/**
 * Render an inventory alert email by event key (C4–C5).
 * @param {keyof typeof INVENTORY_TEMPLATES} eventKey
 * @param {object} data
 */
export const renderInventoryEmail = (eventKey, data = {}) => {
  const build = INVENTORY_TEMPLATES[eventKey];
  if (!build) {
    throw new Error(`Unknown inventory email template: ${eventKey}`);
  }

  const meta = INVENTORY_EVENT_META[eventKey];
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
export * from "./senders.js";
export * from "./design/tokens.js";
export * from "./components/index.js";
