import * as FlashSaleRepository from "../repositories/flashSale.repository.js";
import {
  formatFlashSaleForDashboard,
  formatFlashSaleForPublic,
  normalizeStoredImage,
} from "../utils/helpers/storedImageHelpers.js";
import { publicActiveFilter } from "../utils/helpers/scheduleHelpers.js";
import { createError } from "../utils/AppError.js";

export const getFlashSales = async () => {
  const flashSales = await FlashSaleRepository.find(publicActiveFilter()).sort({
    displayOrder: 1,
    endsAt: 1,
  });
  return { flashSales: flashSales.map(formatFlashSaleForPublic) };
};

export const listFlashSalesAdmin = async () => {
  const flashSales = await FlashSaleRepository.findAllSorted();
  return { flashSales: flashSales.map(formatFlashSaleForDashboard) };
};

export const createFlashSale = async (body) => {
  const { name, title, startsAt, endsAt } = body;
  if (!name?.trim() || !title?.trim()) {
    throw createError("name and title are required");
  }
  if (!startsAt || !endsAt) {
    throw createError("startsAt and endsAt are required for flash sales");
  }
  if (new Date(endsAt) <= new Date(startsAt)) {
    throw createError("endsAt must be after startsAt");
  }

  const flashSale = await FlashSaleRepository.create({
    name: name.trim(),
    title: title.trim(),
    subtitle: body.subtitle?.trim() || "",
    badgeText: body.badgeText || "Flash Sale",
    image: normalizeStoredImage(body.image),
    productIds: body.productIds || [],
    productSource: body.productSource === "sale" ? "sale" : "ids",
    discountLabel: body.discountLabel,
    ctaText: body.ctaText || "Shop Deals",
    ctaLink: body.ctaLink,
    backgroundColor: body.backgroundColor || "#1a1a1a",
    textColor: body.textColor || "#ffffff",
    accentColor: body.accentColor || "#ffbf00",
    displayOrder: Number(body.displayOrder) || 0,
    isActive: body.isActive ?? true,
    startsAt,
    endsAt,
  });

  return { flashSale: formatFlashSaleForDashboard(flashSale), __status: 201 };
};

export const updateFlashSale = async (id, body) => {
  const flashSale = await FlashSaleRepository.findById(id);
  if (!flashSale) throw createError("Flash sale not found", 404);

  const nextStarts = body.startsAt ?? flashSale.startsAt;
  const nextEnds = body.endsAt ?? flashSale.endsAt;
  if (nextStarts && nextEnds && new Date(nextEnds) <= new Date(nextStarts)) {
    throw createError("endsAt must be after startsAt");
  }

  const allowed = [
    "name",
    "title",
    "subtitle",
    "badgeText",
    "productIds",
    "productSource",
    "discountLabel",
    "ctaText",
    "ctaLink",
    "backgroundColor",
    "textColor",
    "accentColor",
    "displayOrder",
    "isActive",
    "startsAt",
    "endsAt",
  ];

  allowed.forEach((field) => {
    if (body[field] !== undefined) flashSale[field] = body[field];
  });

  if (body.image !== undefined) {
    flashSale.image = normalizeStoredImage(body.image);
  }

  await flashSale.save();
  return { flashSale: formatFlashSaleForDashboard(flashSale) };
};

export const toggleFlashSaleStatus = async (id, body) => {
  const flashSale = await FlashSaleRepository.findById(id);
  if (!flashSale) throw createError("Flash sale not found", 404);

  flashSale.isActive =
    typeof body?.isActive === "boolean" ? body.isActive : !flashSale.isActive;
  await flashSale.save();

  return { flashSale: formatFlashSaleForDashboard(flashSale) };
};

export const deleteFlashSale = async (id) => {
  const flashSale = await FlashSaleRepository.findById(id);
  if (!flashSale) throw createError("Flash sale not found", 404);

  flashSale.isActive = false;
  await flashSale.save();
  return { message: "Flash sale deactivated" };
};
