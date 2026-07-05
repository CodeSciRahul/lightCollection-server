import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as CartService from "../services/cart.service.js";

export const getCart = serviceHandler((req) => CartService.getCart(req.user._id));

export const addToCart = serviceHandler(
  (req) => CartService.addToCart(req.user._id, req.body),
  201
);

export const updateCartItem = serviceHandler((req) =>
  CartService.updateCartItem(req.user._id, req.params.itemId, req.body)
);

export const removeFromCart = serviceHandler((req) =>
  CartService.removeFromCart(req.user._id, req.params.itemId)
);

export const clearCart = serviceHandler((req) => CartService.clearCart(req.user._id));

export const removeCouponFromCart = serviceHandler((req) =>
  CartService.removeCouponFromCart(req.user._id)
);

export const applyCouponToCart = serviceHandler((req) =>
  CartService.applyCouponToCart(req.user._id, req.body.code)
);
