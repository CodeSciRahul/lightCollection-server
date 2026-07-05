import * as BannerRepository from "../repositories/banner.repository.js";
import {
  formatBannerForDashboard,
  formatBannerForPublic,
  normalizeStoredImage,
} from "../utils/helpers/storedImageHelpers.js";
import { createError } from "../utils/AppError.js";

const now = () => new Date();

const activeDateFilter = {
  $or: [
    { startsAt: null, endsAt: null },
    { startsAt: { $lte: now() }, endsAt: null },
    { startsAt: null, endsAt: { $gte: now() } },
    { startsAt: { $lte: now() }, endsAt: { $gte: now() } },
  ],
};

export const getBanners = async () => {
  const banners = await BannerRepository.find({
    isActive: true,
    ...activeDateFilter,
  }).sort({ displayOrder: 1 });

  return { banners: banners.map(formatBannerForPublic) };
};

export const listBannersAdmin = async () => {
  const banners = await BannerRepository.findAllSorted();
  return { banners: banners.map(formatBannerForDashboard) };
};

export const createBanner = async (body) => {
  const { title, image } = body;
  if (!title || !image) throw createError("title and image are required");

  const banner = await BannerRepository.create({
    ...body,
    image: normalizeStoredImage(image),
  });

  return { banner: formatBannerForDashboard(banner), __status: 201 };
};

export const updateBanner = async (id, body) => {
  const banner = await BannerRepository.findById(id);
  if (!banner) throw createError("Banner not found", 404);

  const allowed = [
    "title",
    "subtitle",
    "description",
    "image",
    "ctaText",
    "ctaLink",
    "displayOrder",
    "startsAt",
    "endsAt",
    "isActive",
  ];

  allowed.forEach((field) => {
    if (body[field] !== undefined) {
      banner[field] =
        field === "image" ? normalizeStoredImage(body[field]) : body[field];
    }
  });

  await banner.save();
  return { banner: formatBannerForDashboard(banner) };
};

export const toggleBannerStatus = async (id, body) => {
  const banner = await BannerRepository.findById(id);
  if (!banner) throw createError("Banner not found", 404);

  banner.isActive =
    typeof body.isActive === "boolean" ? body.isActive : !banner.isActive;
  await banner.save();

  return { banner: formatBannerForDashboard(banner) };
};

export const deleteBanner = async (id) => {
  const banner = await BannerRepository.findById(id);
  if (!banner) throw createError("Banner not found", 404);

  banner.isActive = false;
  await banner.save();

  return { message: "Banner deactivated" };
};
