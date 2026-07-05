export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

export const createError = (message, statusCode = 400) =>
  Object.assign(new Error(message), { statusCode });

export const throwIf = (condition, message, statusCode = 400) => {
  if (condition) {
    throw createError(message, statusCode);
  }
};
