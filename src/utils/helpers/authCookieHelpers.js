import jwt from "jsonwebtoken";
import { appConfig } from "../../config/index.js";
import { createError } from "../AppError.js";

const assertJwtSecret = () => {
  if (!appConfig.jwt.secret) {
    throw createError(
      "JWT_SECRET is not configured on the server.",
      503
    );
  }
};

export const issueAuthToken = (userId) => {
  assertJwtSecret();
  return jwt.sign({ userId }, appConfig.jwt.secret, { expiresIn: "7d" });
};

export const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: appConfig.isProduction,
    sameSite: appConfig.isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: appConfig.isProduction,
    sameSite: appConfig.isProduction ? "strict" : "lax",
  });
};
