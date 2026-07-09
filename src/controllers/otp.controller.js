import {
  serviceHandler,
  createAuthHandler,
} from "../utils/helpers/handlerHelpers.js";
import * as AuthService from "../services/auth.service.js";

export const sendCustomerOtp = serviceHandler((req) =>
  AuthService.sendCustomerOtp({ email: req.body.email })
);

export const verifyCustomerOtp = createAuthHandler((req) =>
  AuthService.verifyCustomerOtp({
    email: req.body.email,
    otp: req.body.otp,
  })
);

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
  AuthService.registerSellerAccount({
    token: req.body.token,
    email: req.body.email,
    password: req.body.password,
    signInProvider: req.body.signInProvider,
  })
);
