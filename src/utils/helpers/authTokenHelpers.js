import jwt from "jsonwebtoken";
import { appConfig } from "../../config/index.js";
import { createError } from "../AppError.js";
import * as UserRepository from "../../repositories/user.repository.js";

const AUTH_ASSERTION_EXPIRY = "15m";

const assertJwtSecret = () => {
  if (!appConfig.jwt.secret) {
    throw createError("JWT_SECRET is not configured on the server.", 503);
  }
};

/**
 * Short-lived signed token carrying identity claims for seller/admin registration.
 * Replaces the previous Firebase ID token exchange.
 */
export const issueAuthAssertionToken = ({
  uid,
  email,
  name,
  phoneNumber,
  signInProvider = "password",
}) => {
  assertJwtSecret();

  return jwt.sign(
    {
      type: "auth_assertion",
      uid,
      email,
      name,
      phone_number: phoneNumber,
      sign_in_provider: signInProvider,
    },
    appConfig.jwt.secret,
    { expiresIn: AUTH_ASSERTION_EXPIRY }
  );
};

const toAuthClaims = (decoded) => ({
  uid: decoded.uid || decoded.sub,
  email: decoded.email?.toLowerCase?.() || decoded.email,
  name: decoded.name,
  phone_number: decoded.phone_number,
  sign_in_provider: decoded.sign_in_provider || decoded.provider || "password",
});

/**
 * Verify an auth assertion or session token and return normalized identity claims.
 */
export const verifyAuthToken = async (token) => {
  if (!token) {
    throw createError("Authentication token is required", 400);
  }

  assertJwtSecret();

  try {
    const decoded = jwt.verify(token, appConfig.jwt.secret);

    if (decoded.userId) {
      const user = await UserRepository.findById(decoded.userId);

      if (!user) {
        throw createError("User not found", 404);
      }

      return {
        ...toAuthClaims({
          uid: user.firebaseUid || String(user._id),
          email: user.email,
          name: user.name,
          phone_number: user.mobileNumber,
          sign_in_provider: user.authProvider || "password",
        }),
        _user: user,
      };
    }

    if (decoded.type === "auth_assertion" || decoded.uid || decoded.sub || decoded.email) {
      return toAuthClaims(decoded);
    }

    throw createError("Invalid authentication token", 401);
  } catch (err) {
    if (err.statusCode) {
      throw err;
    }

    throw createError("Invalid or expired authentication token", 401);
  }
};
