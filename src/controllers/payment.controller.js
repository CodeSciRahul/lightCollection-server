import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as PaymentService from "../services/payment.service.js";

export const initializeCheckout = serviceHandler((req) =>
  PaymentService.initializeCheckout(req.user._id, { addressId: req.body.addressId })
);

export const verifyCheckoutPayment = serviceHandler((req) =>
  PaymentService.verifyCheckoutPayment(req.user._id, {
    txRef: req.query.tx_ref || req.query.txRef,
    transactionId: req.query.transaction_id || req.query.transactionId,
    redirectStatus: req.query.status,
  })
);

export const retryCheckout = serviceHandler((req) =>
  PaymentService.retryCheckout(req.user._id, req.params.orderId)
);

export const getPaymentConfig = serviceHandler(() => PaymentService.getPaymentConfig());

export const handleFlutterwaveWebhook = serviceHandler((req) =>
  PaymentService.handleFlutterwaveWebhook(req.body)
);
