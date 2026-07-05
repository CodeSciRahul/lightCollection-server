import * as AnnouncementRepository from "../repositories/announcement.repository.js";
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

const publicAnnouncementFilter = {
  isActive: true,
  ...activeDateFilter,
};

export const getAnnouncements = async () => {
  const announcements = await AnnouncementRepository.find(publicAnnouncementFilter).sort({
    priority: -1,
    createdAt: -1,
  });
  return { announcements };
};

export const getAnnouncementById = async (id) => {
  const announcement = await AnnouncementRepository.findOne({
    _id: id,
    ...publicAnnouncementFilter,
  });

  if (!announcement) throw createError("Announcement not found", 404);
  return { announcement };
};

export const listAnnouncementsAdmin = async () => {
  const announcements = await AnnouncementRepository.findAllSorted();
  return { announcements };
};

export const createAnnouncement = async (body) => {
  const { message } = body;

  if (!message?.trim()) throw createError("Message is required");

  const announcement = await AnnouncementRepository.create({
    message: message.trim(),
    isActive: body.isActive ?? true,
    priority: body.priority ?? 0,
    startsAt: body.startsAt,
    endsAt: body.endsAt,
    backgroundColor: body.backgroundColor?.trim(),
    textColor: body.textColor?.trim(),
  });

  return { announcement, __status: 201 };
};

export const updateAnnouncement = async (id, body) => {
  const announcement = await AnnouncementRepository.findById(id);
  if (!announcement) throw createError("Announcement not found", 404);

  if (body.message !== undefined) {
    const message = body.message?.trim();
    if (!message) throw createError("Message is required");
    announcement.message = message;
  }

  const allowed = [
    "isActive",
    "priority",
    "startsAt",
    "endsAt",
    "backgroundColor",
    "textColor",
  ];

  allowed.forEach((field) => {
    if (body[field] === undefined) return;

    if (field === "backgroundColor" || field === "textColor") {
      announcement[field] = body[field]?.trim() || undefined;
      return;
    }

    announcement[field] = body[field];
  });

  await announcement.save();
  return { announcement };
};

export const deleteAnnouncement = async (id) => {
  const announcement = await AnnouncementRepository.findById(id);
  if (!announcement) throw createError("Announcement not found", 404);

  await announcement.deleteOne();
  return { message: "Announcement deleted" };
};
