import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as OrderService from "../services/order.service.js";

export const placeOrder = serviceHandler(
  (req) =>
    OrderService.placeOrder(req.user._id, {
      addressId: req.body.addressId,
      paymentMethod: req.body.paymentMethod,
    }),
  201
);

export const getMyOrders = serviceHandler((req) =>
  OrderService.getMyOrders(req.user._id, req.query)
);

export const getOrderById = serviceHandler((req) =>
  OrderService.getOrderById(req.user._id, req.params.id)
);

export const cancelOrder = serviceHandler((req) =>
  OrderService.cancelOrder(req.user._id, req.params.id, { reason: req.body.reason })
);

export const getOrderSummary = serviceHandler(() => OrderService.getOrderSummary());

export const getSellerOrders = serviceHandler((req) =>
  OrderService.getSellerOrders(req.seller._id, req.query)
);

export const getSellerOrderById = serviceHandler((req) =>
  OrderService.getSellerOrderById(req.seller._id, req.params.id)
);

export const updateSellerOrderStatus = serviceHandler((req) =>
  OrderService.updateSellerOrderStatus(req.seller._id, req.params.id, req.body)
);

export const getAdminOrders = serviceHandler((req) =>
  OrderService.getAdminOrders(req.query)
);

export const updateAdminOrderStatus = serviceHandler((req) =>
  OrderService.updateAdminOrderStatus(req.params.id, req.body)
);
