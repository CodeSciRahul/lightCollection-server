import jwt from "jsonwebtoken";
import { appConfig } from "../../config/index.js";

export const issueAuthToken = (userId) =>
  jwt.sign({ userId }, appConfig.jwt.secret, { expiresIn: "7d" });

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
