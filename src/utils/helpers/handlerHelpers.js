import { asyncHandler } from "../asyncHandler.js";
import { sendSuccess, sendError } from "../response.js";
import { createError } from "../AppError.js";
import {
  setAuthCookie,
  clearAuthCookie,
} from "./authCookieHelpers.js";

export const resolveHandlerError = (err) => {
  if (err?.statusCode && err.statusCode >= 400 && err.statusCode < 600) {
    return { status: err.statusCode, message: err.message };
  }

  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return {
      status: 409,
      message: `${field} already exists`,
    };
  }

  if (err?.name === "JsonWebTokenError" || err?.message?.includes?.("secretOrPrivateKey")) {
    return {
      status: 401,
      message: "Invalid or expired authentication token.",
    };
  }

  return {
    status: 500,
    message: "Something went wrong. Please try again.",
  };
};

export const sendHandlerError = (res, err, context = "request") => {
  const { status, message } = resolveHandlerError(err);

  if (status >= 500) {
    console.error(`[${context}]`, err);
  }

  return sendError(res, message, status);
};

/**
 * Auth controller wrapper — always returns JSON, never drops the connection.
 */
export const createAuthHandler = (serviceFn, defaultStatus = 200) =>
  asyncHandler(async (req, res) => {
    try {
      const result = await serviceFn(req);

      if (result.clearCookie) {
        clearAuthCookie(res);
      } else if (result.token) {
        setAuthCookie(res, result.token);
      }

      const status = result.__status ?? defaultStatus;
      const payload = { ...result };
      delete payload.__status;
      delete payload.clearCookie;

      sendSuccess(res, payload, status);
    } catch (err) {
      if (res.headersSent) {
        throw err;
      }

      return sendHandlerError(res, err, "auth");
    }
  });

/**
 * Generic service controller wrapper — always returns JSON for known failures.
 */
export const serviceHandler = (serviceFn, defaultStatus = 200) =>
  asyncHandler(async (req, res) => {
    try {
      const result = await serviceFn(req);

      if (result?.__rawResponse) {
        return res.status(result.status).json(result.body);
      }

      if (result === undefined || result === null) {
        throw createError("Internal server error: empty service response", 500);
      }

      if (result.__setHeaders && typeof result.__setHeaders === "object") {
        Object.entries(result.__setHeaders).forEach(([key, value]) => {
          res.set(key, value);
        });
      }

      const status = result.__status ?? defaultStatus;
      const payload = { ...result };
      delete payload.__status;
      delete payload.__setHeaders;

      sendSuccess(res, payload, status);
    } catch (err) {
      if (res.headersSent) {
        throw err;
      }

      return sendHandlerError(res, err, "service");
    }
  });
