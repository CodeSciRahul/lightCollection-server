import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import {
  createPresignedUploadUrl,
  deleteStoredImage,
} from "../services/upload.service.js";
import { UPLOAD_FOLDERS } from "../utils/helpers/uploadHelpers.js";
import { createError } from "../utils/AppError.js";

export const createPresignedUrl = serviceHandler(async (req) => {
  const { fileName, contentType, folder = UPLOAD_FOLDERS.PRODUCTS, documentType } = req.body;

  if (!fileName?.trim()) throw createError("fileName is required.", 400);
  if (!contentType?.trim()) throw createError("contentType is required.", 400);

  const result = await createPresignedUploadUrl({
    fileName,
    contentType,
    folder,
    documentType,
    user: req.user,
    seller: req.seller,
  });

  return result;
});

export const deleteImage = serviceHandler(async (req) => {
  const { key } = req.body;

  if (!key?.trim()) throw createError("key is required.", 400);

  await deleteStoredImage({
    key,
    user: req.user,
    seller: req.seller,
  });

  return { message: "Image deleted successfully" };
});
