import crypto from "crypto";
import * as UserRepository from "../../repositories/user.repository.js";
import * as SellerRepository from "../../repositories/seller.repository.js";
import { createError } from "../AppError.js";
import { verifyUserPassword } from "./passwordHelpers.js";
import { verifyAuthToken } from "./authTokenHelpers.js";

export const CUSTOMER_ACCOUNT_MESSAGE =
  "This email or mobile number is already registered as a customer account. Customer accounts cannot become sellers. Please use a different email or mobile number.";

export const CUSTOMER_CANNOT_BECOME_SELLER_MESSAGE =
  "Customer accounts cannot register as sellers. Please sign up with a different email or mobile number that is not used on the storefront.";

export const AUTH_PROVIDERS = {
  PASSWORD: "password",
  GOOGLE: "google.com",
  APPLE: "apple.com",
};

/** Internal stable user identifier (stored in legacy firebaseUid column). */
export const generateAuthUid = () => crypto.randomUUID();

export const loadSellerProfile = (userId) => SellerRepository.findByUser(userId);

export const isStorefrontCustomer = (user) => user?.role === "customer";

export const isOAuthSignIn = (claims) =>
  claims?.sign_in_provider === AUTH_PROVIDERS.GOOGLE ||
  claims?.sign_in_provider === AUTH_PROVIDERS.APPLE;

export const findUserByIdentity = async ({ authUid, email, mobileNumber }) => {
  if (authUid) {
    const byUid = await UserRepository.findByFirebaseUid(authUid);
    if (byUid) return byUid;
  }

  if (email) {
    const byEmail = await UserRepository.findByEmail(email);
    if (byEmail) return byEmail;
  }

  if (mobileNumber) {
    const byMobile = await UserRepository.findOne({ mobileNumber: mobileNumber.trim() });
    if (byMobile) return byMobile;
  }

  return null;
};

export const linkAuthUid = async (user, authUid) => {
  if (user && !user.firebaseUid) {
    user.firebaseUid = authUid;
    await user.save();
  }
};

export const resolveUserFromAuthClaims = async (claims, mobileNumber) => {
  if (claims?._user) {
    await linkAuthUid(claims._user, claims.uid);
    return claims._user;
  }

  let user = await findUserByIdentity({
    authUid: claims.uid,
    email: claims.email,
    mobileNumber: mobileNumber || claims.phone_number,
  });

  if (user) {
    await linkAuthUid(user, claims.uid);
    return user;
  }

  if (mobileNumber) {
    user = await findUserByIdentity({ mobileNumber });
    if (user) {
      await linkAuthUid(user, claims.uid);
      return user;
    }
  }

  return null;
};

export const resolveAuthClaims = async ({ token, email, password }) => {
  if (email && password) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserRepository.findByEmailWithPassword(normalizedEmail);

    if (!user) {
      throw createError("Invalid email or password.", 401);
    }

    await verifyUserPassword(user, password);

    return {
      uid: user.firebaseUid || String(user._id),
      email: user.email,
      name: user.name,
      phone_number: user.mobileNumber,
      sign_in_provider: user.authProvider || AUTH_PROVIDERS.PASSWORD,
      _user: user,
    };
  }

  return verifyAuthToken(token);
};

/** Block if email or mobile is already used by a storefront customer account */
export const assertEmailMobileNotRegisteredAsCustomer = async ({
  email,
  mobileNumber,
  excludeUserId,
}) => {
  const queries = [];

  if (email) {
    queries.push({ email: email.toLowerCase().trim() });
  }
  if (mobileNumber) {
    queries.push({ mobileNumber: mobileNumber.trim() });
  }

  for (const query of queries) {
    const existing = await UserRepository.findOne(query);
    if (!existing) continue;
    if (excludeUserId && String(existing._id) === String(excludeUserId)) continue;

    if (isStorefrontCustomer(existing)) {
      throw createError(CUSTOMER_ACCOUNT_MESSAGE, 403);
    }
  }
};

/** Migrate legacy pending applicants (customer + seller profile) to seller role */
export const normalizeSellerDashboardUser = async (user) => {
  if (!user) return user;

  if (user.role === "customer") {
    const seller = await loadSellerProfile(user._id);
    if (seller) {
      user.role = "seller";
      await user.save();
      return user;
    }

    throw createError(CUSTOMER_CANNOT_BECOME_SELLER_MESSAGE, 403);
  }

  return user;
};

export const assertCanAccessSellerAuth = async (user) => {
  if (user.role === "admin") {
    throw createError("This account is an admin account. Please use admin login.", 403);
  }

  if (user.role === "seller") {
    return user;
  }

  return normalizeSellerDashboardUser(user);
};
