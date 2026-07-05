import { asyncHandler } from "../asyncHandler.js";
import { sendSuccess, sendError } from "../response.js";
import { createError } from "../AppError.js";
/**
 * Wraps a pure service call for use in controllers.
 * Service fn receives (req) and returns a plain data object for sendSuccess.
 * Throw errors with `statusCode` for client errors.
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
      const status = result.__status ?? defaultStatus;
      const payload = { ...result };
      delete payload.__status;

      sendSuccess(res, payload, status);
    } catch (err) {
      if (err.statusCode) {
        return sendError(res, err.message, err.statusCode);
      }
      throw err;
    }
  });
