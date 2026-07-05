import * as OrderRepository from "../../repositories/order.repository.js";
import * as CartRepository from "../../repositories/cart.repository.js";
import * as AddressRepository from "../../repositories/address.repository.js";
import * as CouponRepository from "../../repositories/coupon.repository.js";
import { findVariant } from "./productHelpers.js";
import { getImageUrl } from "./storedImageHelpers.js";
import {
  generateOrderNumber,
  calculateShippingFee,
} from "./orderHelpers.js";
import {
  resolveCouponDiscount,
  recordCouponRedemption,
} from "./couponHelpers.js";

/**
 * Build and persist an order from the user's cart.
 * Decrements stock and clears the cart on success.
 */
export const buildOrderFromCart = async (
  userId,
  { addressId, paymentMethod = "cod", paymentTxRef }
) => {
  const cart = await CartRepository.findOne({ user: userId }).populate("items.product");
  if (!cart?.items?.length) {
    throw Object.assign(new Error("Cart is empty"), { statusCode: 400 });
  }

  const address = await AddressRepository.findOneByIdAndUser(addressId, userId);
  if (!address) {
    throw Object.assign(new Error("Shipping address is required"), { statusCode: 400 });
  }

  const coupon = cart?.coupon ? await CouponRepository.findById(cart.coupon) : null;
  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.product;
    if (!product?.isActive) continue;

    const variant = findVariant(product, item.variantSku);
    if (!variant || variant.stock < item.quantity) {
      throw Object.assign(new Error(`${product.title} is out of stock`), {
        statusCode: 400,
      });
    }

    const lineTotal = variant.price * item.quantity;
    subtotal += lineTotal;

    orderItems.push({
      product: product._id,
      variantSku: variant?.sku,
      title: product.title,
      size: variant.size,
      color: variant.color,
      image: getImageUrl(variant.images?.[0]) || getImageUrl(product.images?.[0]),
      quantity: item.quantity,
      price: variant.price,
      mrp: variant.mrp,
    });

    variant.stock -= item.quantity;
    await product.save();
  }

  if (!orderItems.length) {
    throw Object.assign(new Error("No valid items in cart"), { statusCode: 400 });
  }

  let discount = 0;
  let couponCode;
  if (coupon) {
    const couponResult = await resolveCouponDiscount(coupon, {
      userId,
      items: cart.items,
    });
    discount = couponResult.discount;
    couponCode = coupon.code;
  }

  const afterDiscount = subtotal - discount;
  const shippingFee = calculateShippingFee(afterDiscount);
  const total = afterDiscount + shippingFee;

  const isOnlinePayment = paymentMethod === "card";

  const order = await OrderRepository.create({
    user: userId,
    orderNumber: generateOrderNumber(),
    items: orderItems,
    shippingAddress: {
      fullName: address.fullName,
      mobileNumber: address.mobileNumber,
      pincode: address.pincode,
      addressLine: address.addressLine,
      locality: address.locality,
      city: address.city,
      state: address.state,
      country: address.country,
    },
    paymentMethod,
    paymentStatus: "pending",
    orderStatus: isOnlinePayment ? "placed" : "placed",
    subtotal,
    discount,
    shippingFee,
    total,
    couponCode,
    ...(paymentTxRef
      ? {
          flutterwave: {
            txRef: paymentTxRef,
          },
        }
      : {}),
    statusHistory: [
      {
        status: "placed",
        note: isOnlinePayment
          ? "Order created — awaiting online payment"
          : "Order placed successfully",
      },
    ],
  });

  if (coupon && couponCode) {
    await recordCouponRedemption({
      userId,
      coupon,
      orderId: order._id,
      discountAmount: discount,
    });
  }

  cart.items = [];
  cart.coupon = undefined;
  await cart.save();

  return order;
};
