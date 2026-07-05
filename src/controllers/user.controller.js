import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendError } from "../utils/response.js";
import {
  setAuthCookie,
  clearAuthCookie,
} from "../utils/helpers/authCookieHelpers.js";
import * as AuthService from "../services/auth.service.js";

const authHandler = (serviceFn, defaultStatus = 200) =>
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
      if (err.statusCode) {
        return sendError(res, err.message, err.statusCode);
      }
      throw err;
    }
  });

export const login = authHandler((req) =>
  AuthService.login({ token: req.body.token })
);

export const loginSeller = authHandler((req) =>
  AuthService.loginSeller({ token: req.body.token })
);

export const loginAdmin = authHandler((req) =>
  AuthService.loginAdmin({
    token: req.body.token,
    mobileNumber: req.body.mobileNumber,
  })
);

export const getProfile = authHandler((req) => AuthService.getProfile(req.user));

export const updateProfile = authHandler((req) =>
  AuthService.updateProfile(req.user, req.body)
);

export const logout = authHandler(() => AuthService.logout());

export const deleteAccount = authHandler((req) =>
  AuthService.deleteAccount(req.user)
);
