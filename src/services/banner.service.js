import * as BannerRepository from "../repositories/banner.repository.js";
import {
  formatBannerForDashboard,
  formatBannerForPublic,
  normalizeStoredImage,
} from "../utils/helpers/storedImageHelpers.js";
import { publicActiveFilter } from "../utils/helpers/scheduleHelpers.js";
import {
  filterByTargeting,
  normalizeTargeting,
} from "../utils/helpers/targetingHelpers.js";
import {
  legacyUrlFromDeepLink,
  normalizeDeepLink,
} from "../utils/helpers/deepLinkHelpers.js";
import { BANNER_TYPES } from "../constants/marketing.js";
import { createError } from "../utils/AppError.js";

const applyBannerFields = (banner, body) => {
  const allowed = [
    "title",
    "subtitle",
    "description",
    "type",
    "image",
    "mobileImage",
    "ctaText",
    "ctaLink",
    "deepLink",
    "displayOrder",
    "priority",
    "startsAt",
    "endsAt",
    "isActive",
    "targeting",
  ];

  allowed.forEach((field) => {
    if (body[field] === undefined) return;

    if (field === "image" || field === "mobileImage") {
      banner[field] = normalizeStoredImage(body[field]);
      return;
    }

    if (field === "deepLink") {
      banner.deepLink = normalizeDeepLink(body.deepLink);
      const resolved = legacyUrlFromDeepLink(banner.deepLink);
      if (resolved && body.ctaLink === undefined) {
        banner.ctaLink = resolved;
      }
      return;
    }

    if (field === "targeting") {
      banner.targeting = normalizeTargeting(body.targeting);
      return;
    }

    if (field === "type") {
      if (body.type && !BANNER_TYPES.includes(body.type)) {
        throw createError("Invalid banner type");
      }
      banner.type = body.type || "hero";
      return;
    }

    banner[field] = body[field];
  });
};

export const getBanners = async (audience = {}) => {
  const banners = await BannerRepository.find(publicActiveFilter()).sort({
    displayOrder: 1,
    priority: -1,
    createdAt: -1,
  });

  const filtered = filterByTargeting(banners, audience);
  return { banners: filtered.map(formatBannerForPublic) };
};

export const listBannersAdmin = async () => {
  const banners = await BannerRepository.findAllSorted();
  return { banners: banners.map(formatBannerForDashboard) };
};

export const createBanner = async (body) => {
  const { title, image } = body;
  if (!title || !image) throw createError("title and image are required");

  if (body.type && !BANNER_TYPES.includes(body.type)) {
    throw createError("Invalid banner type");
  }

  const deepLink = normalizeDeepLink(body.deepLink);
  const ctaLink =
    body.ctaLink || legacyUrlFromDeepLink(deepLink) || undefined;

  const banner = await BannerRepository.create({
    title: body.title,
    subtitle: body.subtitle,
    description: body.description,
    type: body.type || "hero",
    image: normalizeStoredImage(image),
    mobileImage: normalizeStoredImage(body.mobileImage),
    ctaText: body.ctaText || "Shop Now",
    ctaLink,
    deepLink,
    displayOrder: body.displayOrder ?? 0,
    priority: body.priority ?? 0,
    startsAt: body.startsAt,
    endsAt: body.endsAt,
    isActive: body.isActive ?? true,
    targeting: normalizeTargeting(body.targeting),
  });

  return { banner: formatBannerForDashboard(banner), __status: 201 };
};

export const updateBanner = async (id, body) => {
  const banner = await BannerRepository.findById(id);
  if (!banner) throw createError("Banner not found", 404);

  applyBannerFields(banner, body);
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

export const reorderBanners = async (body) => {
  const items = Array.isArray(body?.items) ? body.items : [];
  if (!items.length) throw createError("items array is required");

  const ops = items.map((item, index) => ({
    updateOne: {
      filter: { _id: item.id || item._id },
      update: {
        $set: {
          displayOrder:
            item.displayOrder !== undefined
              ? item.displayOrder
              : (index + 1) * 10,
        },
      },
    },
  }));

  await BannerRepository.bulkWrite(ops);
  return listBannersAdmin();
};

export const deleteBanner = async (id) => {
  const banner = await BannerRepository.findById(id);
  if (!banner) throw createError("Banner not found", 404);

  banner.isActive = false;
  await banner.save();

  return { message: "Banner deactivated" };
};
