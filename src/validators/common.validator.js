import { createError } from "../utils/AppError.js";

export const requireField = (value, fieldName) => {
  if (value === undefined || value === null || value === "") {
    throw createError(`${fieldName} is required`, 400);
  }
  return value;
};

export const requireNonEmptyString = (value, fieldName) => {
  requireField(value, fieldName);
  if (typeof value !== "string" || !value.trim()) {
    throw createError(`${fieldName} must be a non-empty string`, 400);
  }
  return value.trim();
};
