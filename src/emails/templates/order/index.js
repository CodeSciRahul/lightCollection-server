export { buildOrderPlacedCustomerEmail } from "./placedCustomer.js";
export { buildOrderPlacedSellerEmail } from "./placedSeller.js";
export {
  buildOrderStatusCustomerEmail,
  buildOrderDeliveredSellerEmail,
} from "./statusCustomer.js";
export {
  buildOrderCancelledCustomerEmail,
  buildOrderCancelledSellerEmail,
} from "./cancelled.js";

import { buildOrderPlacedCustomerEmail } from "./placedCustomer.js";
import { buildOrderPlacedSellerEmail } from "./placedSeller.js";
import {
  buildOrderStatusCustomerEmail,
  buildOrderDeliveredSellerEmail,
} from "./statusCustomer.js";
import {
  buildOrderCancelledCustomerEmail,
  buildOrderCancelledSellerEmail,
} from "./cancelled.js";

const withStatus = (status) => (data = {}) =>
  buildOrderStatusCustomerEmail({ ...data, status });

/** Registry for order placement & status templates. */
export const ORDER_TEMPLATES = {
  ORDER_PLACED_CUSTOMER: buildOrderPlacedCustomerEmail,
  ORDER_PLACED_SELLER: buildOrderPlacedSellerEmail,
  ORDER_CONFIRMED_CUSTOMER: withStatus("confirmed"),
  ORDER_PACKED_CUSTOMER: withStatus("packed"),
  ORDER_SHIPPED_CUSTOMER: withStatus("shipped"),
  ORDER_OUT_FOR_DELIVERY_CUSTOMER: withStatus("out_for_delivery"),
  ORDER_DELIVERED_CUSTOMER: withStatus("delivered"),
  ORDER_DELIVERED_SELLER: buildOrderDeliveredSellerEmail,
  ORDER_CANCELLED_CUSTOMER: buildOrderCancelledCustomerEmail,
  ORDER_CANCELLED_SELLER: buildOrderCancelledSellerEmail,
};
