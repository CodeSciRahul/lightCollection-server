import bcrypt from "bcryptjs";
import { createError } from "../AppError.js";

const SALT_ROUNDS = 12;

export const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

export const comparePassword = (password, passwordHash) =>
  bcrypt.compare(password, passwordHash);

export const assertValidPassword = (password) => {
  if (!password || String(password).length < 6) {
    throw createError("Password must be at least 6 characters.", 400);
  }
};

export const verifyUserPassword = async (user, password) => {
  if (!user?.passwordHash) {
    throw createError("Invalid email or password.", 401);
  }

  const isMatch = await comparePassword(password, user.passwordHash);

  if (!isMatch) {
    throw createError("Invalid email or password.", 401);
  }
};
