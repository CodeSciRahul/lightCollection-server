import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as WishlistService from "../services/wishlist.service.js";

export const getWishlist = serviceHandler((req) =>
  WishlistService.getWishlist(req.user._id)
);

export const addToWishlist = serviceHandler(
  (req) => WishlistService.addToWishlist(req.user._id, req.body.productId),
  201
);

export const removeFromWishlist = serviceHandler((req) =>
  WishlistService.removeFromWishlist(req.user._id, req.params.productId)
);

export const toggleWishlist = serviceHandler((req) =>
  WishlistService.toggleWishlist(req.user._id, req.body.productId)
);
