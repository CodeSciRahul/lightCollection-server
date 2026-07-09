import { createAuthHandler } from "../utils/helpers/handlerHelpers.js";
import * as AuthService from "../services/auth.service.js";

export const login = createAuthHandler((req) =>
  AuthService.login({
    token: req.body.token,
    email: req.body.email,
    password: req.body.password,
  })
);

export const loginSeller = createAuthHandler((req) =>
  AuthService.loginSeller({
    token: req.body.token,
    email: req.body.email,
    password: req.body.password,
  })
);

export const loginAdmin = createAuthHandler((req) =>
  AuthService.loginAdmin({
    token: req.body.token,
    email: req.body.email,
    password: req.body.password,
    mobileNumber: req.body.mobileNumber,
  })
);

export const getProfile = createAuthHandler((req) => AuthService.getProfile(req.user));

export const updateProfile = createAuthHandler((req) =>
  AuthService.updateProfile(req.user, req.body)
);

export const logout = createAuthHandler(() => AuthService.logout());

export const deleteAccount = createAuthHandler((req) =>
  AuthService.deleteAccount(req.user)
);
