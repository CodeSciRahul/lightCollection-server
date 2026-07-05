import PaymentWebhookEvent from "../models/PaymentWebhookEvent.js";

export { PaymentWebhookEvent };

export const findOne = (filter) => PaymentWebhookEvent.findOne(filter);
export const create = (data) => PaymentWebhookEvent.create(data);

export const findByEventId = (eventId) => PaymentWebhookEvent.findOne({ eventId });
