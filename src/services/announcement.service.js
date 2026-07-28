import * as AnnouncementRepository from "../repositories/announcement.repository.js";
import {
  formatAnnouncementForDashboard,
  formatAnnouncementForPublic,
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
import { ANNOUNCEMENT_TYPES } from "../constants/marketing.js";
import { createError } from "../utils/AppError.js";

export const getAnnouncements = async (audience = {}) => {
  const announcements = await AnnouncementRepository.find(
    publicActiveFilter()
  ).sort({
    priority: -1,
    createdAt: -1,
  });

  const filtered = filterByTargeting(announcements, audience);
  return { announcements: filtered.map(formatAnnouncementForPublic) };
};

export const getAnnouncementById = async (id, audience = {}) => {
  const announcement = await AnnouncementRepository.findOne({
    _id: id,
    ...publicActiveFilter(),
  });

  if (!announcement) throw createError("Announcement not found", 404);
  if (!filterByTargeting([announcement], audience).length) {
    throw createError("Announcement not found", 404);
  }

  return { announcement: formatAnnouncementForPublic(announcement) };
};

export const listAnnouncementsAdmin = async () => {
  const announcements = await AnnouncementRepository.findAllSorted();
  return {
    announcements: announcements.map(formatAnnouncementForDashboard),
  };
};

export const createAnnouncement = async (body) => {
  const { message } = body;

  if (!message?.trim()) throw createError("Message is required");

  if (body.type && !ANNOUNCEMENT_TYPES.includes(body.type)) {
    throw createError("Invalid announcement type");
  }

  const deepLink = normalizeDeepLink(body.deepLink);
  const link = body.link || legacyUrlFromDeepLink(deepLink) || undefined;

  const announcement = await AnnouncementRepository.create({
    message: message.trim(),
    type: body.type || "top_bar",
    isActive: body.isActive ?? true,
    priority: body.priority ?? 0,
    startsAt: body.startsAt,
    endsAt: body.endsAt,
    backgroundColor: body.backgroundColor?.trim(),
    textColor: body.textColor?.trim(),
    link,
    deepLink,
    dismissible: body.dismissible !== false,
    targeting: normalizeTargeting(body.targeting),
  });

  return {
    announcement: formatAnnouncementForDashboard(announcement),
    __status: 201,
  };
};

export const updateAnnouncement = async (id, body) => {
  const announcement = await AnnouncementRepository.findById(id);
  if (!announcement) throw createError("Announcement not found", 404);

  if (body.message !== undefined) {
    const message = body.message?.trim();
    if (!message) throw createError("Message is required");
    announcement.message = message;
  }

  if (body.type !== undefined) {
    if (body.type && !ANNOUNCEMENT_TYPES.includes(body.type)) {
      throw createError("Invalid announcement type");
    }
    announcement.type = body.type || "top_bar";
  }

  if (body.deepLink !== undefined) {
    announcement.deepLink = normalizeDeepLink(body.deepLink);
    if (body.link === undefined) {
      announcement.link =
        legacyUrlFromDeepLink(announcement.deepLink) || announcement.link;
    }
  }

  if (body.targeting !== undefined) {
    announcement.targeting = normalizeTargeting(body.targeting);
  }

  const allowed = [
    "isActive",
    "priority",
    "startsAt",
    "endsAt",
    "backgroundColor",
    "textColor",
    "link",
    "dismissible",
  ];

  allowed.forEach((field) => {
    if (body[field] === undefined) return;

    if (field === "backgroundColor" || field === "textColor" || field === "link") {
      announcement[field] = body[field]?.trim() || undefined;
      return;
    }

    announcement[field] = body[field];
  });

  await announcement.save();
  return {
    announcement: formatAnnouncementForDashboard(announcement),
  };
};

export const toggleAnnouncementStatus = async (id, body) => {
  const announcement = await AnnouncementRepository.findById(id);
  if (!announcement) throw createError("Announcement not found", 404);

  announcement.isActive =
    typeof body?.isActive === "boolean"
      ? body.isActive
      : !announcement.isActive;
  await announcement.save();

  return {
    announcement: formatAnnouncementForDashboard(announcement),
  };
};

export const deleteAnnouncement = async (id) => {
  const announcement = await AnnouncementRepository.findById(id);
  if (!announcement) throw createError("Announcement not found", 404);

  announcement.isActive = false;
  await announcement.save();

  return { message: "Announcement deactivated" };
};
