import * as UserRepository from "../repositories/user.repository.js";
import * as CartRepository from "../repositories/cart.repository.js";
import * as WishlistRepository from "../repositories/wishlist.repository.js";
import { formatUserProfile } from "../utils/helpers/userHelpers.js";
import { normalizeStoredImage } from "../utils/helpers/storedImageHelpers.js";
import {
  verifyFirebaseToken,
  loadSellerProfile,
  resolveUserFromFirebase,
  assertCanAccessSellerAuth,
  assertEmailMobileNotRegisteredAsCustomer,
  linkFirebaseUid,
  CUSTOMER_ACCOUNT_MESSAGE,
} from "../utils/helpers/authHelpers.js";
import { assertValidEmail } from "../utils/helpers/emailValidation.js";
import {
  isGoogleSignIn,
  saveEmailOtp,
  verifyEmailOtp,
} from "../utils/helpers/otpHelpers.js";
import { sendSellerVerificationOtp } from "../services/email.service.js";
import { issueAuthToken } from "../utils/helpers/authCookieHelpers.js";
import { createError } from "../utils/AppError.js";
import { messages, regex } from "../constants/index.js";

const OTP_SENT_MESSAGE = messages.OTP_SENT;

const ensureUserSideCollections = async (userId) => {
  await CartRepository.ensureForUser(userId);
  await WishlistRepository.ensureForUser(userId);
};

const buildAuthPayload = async (user) => {
  if (!user.isActive) {
    throw createError("Account is deactivated", 403);
  }

  await ensureUserSideCollections(user._id);
  const seller = await loadSellerProfile(user._id);
  const token = issueAuthToken(user._id);

  return {
    user: formatUserProfile(user, seller),
    token,
  };
};

const sendOtpToSeller = async (email) => {
  const otp = await saveEmailOtp(email);
  await sendSellerVerificationOtp(email, otp);
};

/** Storefront customer login — creates customer account if new */
export const login = async ({ token }) => {
  const decoded = await verifyFirebaseToken(token);
  let user = await resolveUserFromFirebase(decoded);

  if (!user) {
    user = await UserRepository.create({
      firebaseUid: decoded.uid,
      email: decoded.email?.toLowerCase() || undefined,
      name: decoded.name || decoded.email?.split("@")[0],
      role: "customer",
    });
  }

  return buildAuthPayload(user);
};

/** Dashboard seller login — blocked until email OTP verified (Google exempt) */
export const loginSeller = async ({ token }) => {
  const decoded = await verifyFirebaseToken(token);
  if (!decoded.email) {
    throw createError(
      "A verified email address is required to sign in as a seller.",
      400
    );
  }

  const normalizedEmail = assertValidEmail(decoded.email);
  let user = await resolveUserFromFirebase(decoded);
  const googleSignIn = isGoogleSignIn(decoded);

  if (!user) {
    if (!googleSignIn) {
      throw createError("No account found. Please register first.", 404);
    }
    await assertEmailMobileNotRegisteredAsCustomer({ email: normalizedEmail });
    user = await UserRepository.create({
      firebaseUid: decoded.uid,
      email: normalizedEmail,
      role: "seller",
      isVerified: true,
    });
  } else {
    user = await assertCanAccessSellerAuth(user);
  }

  if (!user?.isVerified && !googleSignIn) {
    const otp = await saveEmailOtp(normalizedEmail);
    await sendSellerVerificationOtp(normalizedEmail, otp);
    throw createError(
      `Please verify your email before signing in. ${OTP_SENT_MESSAGE}`,
      403
    );
  }

  return buildAuthPayload(user);
};

/** Dashboard admin login — admin role only */
export const loginAdmin = async ({ token, mobileNumber }) => {
  const decoded = await verifyFirebaseToken(token);
  const user = await resolveUserFromFirebase(decoded, mobileNumber);

  if (!user) {
    throw createError(
      "No admin account found for this email or mobile number. Contact the platform owner.",
      404
    );
  }

  if (user.role === "customer") {
    throw createError(CUSTOMER_ACCOUNT_MESSAGE, 403);
  }

  if (user.role === "seller") {
    throw createError(
      "This account is registered as a seller. Please use seller login.",
      403
    );
  }

  if (user.role !== "admin") {
    throw createError("You do not have permission to access the admin panel.", 403);
  }

  return buildAuthPayload(user);
};

export const getProfile = async (user) => {
  const seller = await loadSellerProfile(user._id);
  return { user: formatUserProfile(user, seller) };
};

export const updateProfile = async (user, body) => {
  const allowed = [
    "name",
    "mobileNumber",
    "birthday",
    "gender",
    "categoryPreferences",
    "avatar",
  ];

  allowed.forEach((field) => {
    if (body[field] !== undefined) {
      user[field] =
        field === "avatar" ? normalizeStoredImage(body[field]) : body[field];
    }
  });

  await user.save();
  const seller = await loadSellerProfile(user._id);
  return { user: formatUserProfile(user, seller) };
};

export const logout = async () => ({ message: "Logged out", clearCookie: true });

export const deleteAccount = async (user) => {
  if (user.role !== "customer") {
    throw createError(
      "This account cannot be deleted from the storefront. Contact support.",
      403
    );
  }

  const userId = user._id;

  user.isActive = false;
  user.firebaseUid = `deleted_${userId}`;
  if (user.email) {
    user.email = `deleted_${userId}@deleted.nilecart.local`;
  }
  user.mobileNumber = undefined;
  user.name = "Deleted User";
  user.isMobileVerified = false;

  await user.save();

  return { message: "Account deleted successfully", clearCookie: true };
};

export const sendSellerSignupOtp = async ({ email }) => {
  if (!email) throw createError("Email is required");

  let normalizedEmail;
  try {
    normalizedEmail = assertValidEmail(email);
  } catch (err) {
    throw createError(err.message, err.statusCode || 400);
  }

  const user = await UserRepository.findOne({ email: normalizedEmail, role: "seller" });

  if (!user) {
    throw createError("No seller account found. Please register first.", 404);
  }

  if (user.isVerified) {
    throw createError("Email is already verified. Please sign in.", 400);
  }

  await sendOtpToSeller(normalizedEmail);

  return {
    message: OTP_SENT_MESSAGE,
    email: normalizedEmail,
  };
};

export const verifySellerSignupOtp = async ({ email, otp }) => {
  if (!email || !otp) {
    throw createError("Email and verification code are required");
  }

  let normalizedEmail;
  try {
    normalizedEmail = assertValidEmail(email);
  } catch (err) {
    throw createError(err.message, err.statusCode || 400);
  }

  const code = String(otp).trim();
  if (!regex.OTP_SIX_DIGIT.test(code)) {
    throw createError("Verification code must be a 6-digit number");
  }

  const user = await UserRepository.findOne({ email: normalizedEmail, role: "seller" });
  if (!user) {
    throw createError("No seller account found. Please register first.", 404);
  }

  if (user.isVerified) {
    return {
      message: "Email is already verified. You can sign in.",
      isVerified: true,
    };
  }

  await verifyEmailOtp(normalizedEmail, code);

  user.isVerified = true;
  await user.save();

  return {
    message: "Email verified successfully. You can now sign in.",
    isVerified: true,
  };
};

export const registerSellerAccount = async ({ token }) => {
  if (!token) throw createError("Firebase token is required");

  let decoded;
  try {
    decoded = await verifyFirebaseToken(token);
  } catch (err) {
    throw createError(err.message, err.statusCode || 401);
  }

  if (!decoded.email) {
    throw createError(
      "A verified email address is required to register as a seller.",
      400
    );
  }

  let normalizedEmail;
  try {
    normalizedEmail = assertValidEmail(decoded.email);
  } catch (err) {
    throw createError(err.message, err.statusCode || 400);
  }

  let user = await resolveUserFromFirebase(decoded);

  if (user) {
    if (user.role === "customer") {
      throw createError(CUSTOMER_ACCOUNT_MESSAGE, 403);
    }

    if (user.role === "seller") {
      if (user.isVerified) {
        throw createError(
          "An account with this email already exists. Please sign in.",
          400
        );
      }

      await linkFirebaseUid(user, decoded.uid);
      await sendOtpToSeller(normalizedEmail);

      return {
        message: OTP_SENT_MESSAGE,
        requiresVerification: true,
        email: normalizedEmail,
      };
    }

    throw createError("You are not eligible to register as a seller.", 403);
  }

  await assertEmailMobileNotRegisteredAsCustomer({ email: normalizedEmail });

  const googleSignIn = isGoogleSignIn(decoded);

  user = await UserRepository.create({
    firebaseUid: decoded.uid,
    email: normalizedEmail,
    role: "seller",
    isVerified: googleSignIn,
  });

  if (googleSignIn) {
    return {
      message: "Account created successfully.",
      requiresVerification: false,
      isVerified: true,
      email: normalizedEmail,
    };
  }

  await sendOtpToSeller(normalizedEmail);

  return {
    message: OTP_SENT_MESSAGE,
    requiresVerification: true,
    email: normalizedEmail,
  };
};
