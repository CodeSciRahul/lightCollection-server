import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as AuthService from "../services/auth.service.js";

export const sendSellerSignupOtp = serviceHandler((req) =>
  AuthService.sendSellerSignupOtp({ email: req.body.email })
);

export const verifySellerSignupOtp = serviceHandler((req) =>
  AuthService.verifySellerSignupOtp({
    email: req.body.email,
    otp: req.body.otp,
  })
);

export const registerSellerAccount = serviceHandler((req) =>
  AuthService.registerSellerAccount({ token: req.body.token })
);
