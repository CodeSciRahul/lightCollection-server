import * as CampaignRepository from "../repositories/campaign.repository.js";
import {
  formatCampaignForDashboard,
  formatCampaignForPublic,
  normalizeStoredImage,
} from "../utils/helpers/storedImageHelpers.js";
import { publicActiveFilter } from "../utils/helpers/scheduleHelpers.js";
import { CAMPAIGN_TYPES } from "../constants/homeSections.js";
import { createError } from "../utils/AppError.js";
import { slugify } from "../utils/helpers/userHelpers.js";

export const getCampaigns = async (query = {}) => {
  const filter = publicActiveFilter();
  if (query.type && CAMPAIGN_TYPES.includes(query.type)) {
    filter.type = query.type;
  }

  const campaigns = await CampaignRepository.find(filter).sort({
    displayOrder: 1,
    createdAt: -1,
  });

  return { campaigns: campaigns.map(formatCampaignForPublic) };
};

export const listCampaignsAdmin = async () => {
  const campaigns = await CampaignRepository.findAllSorted();
  return { campaigns: campaigns.map(formatCampaignForDashboard) };
};

export const createCampaign = async (body) => {
  const { name, title } = body;
  if (!name?.trim() || !title?.trim()) {
    throw createError("name and title are required");
  }

  const type = body.type || "promotional";
  if (!CAMPAIGN_TYPES.includes(type)) throw createError("Invalid campaign type");

  const slug = body.slug?.trim() ? slugify(body.slug) : slugify(name);
  const existing = await CampaignRepository.findOne({ slug });
  if (existing) throw createError("A campaign with this slug already exists", 409);

  const campaign = await CampaignRepository.create({
    name: name.trim(),
    slug,
    type,
    title: title.trim(),
    subtitle: body.subtitle?.trim() || "",
    description: body.description?.trim() || "",
    image: normalizeStoredImage(body.image),
    mobileImage: normalizeStoredImage(body.mobileImage),
    backgroundColor: body.backgroundColor || "#111111",
    textColor: body.textColor || "#ffffff",
    accentColor: body.accentColor,
    ctaText: body.ctaText || "Shop Now",
    ctaLink: body.ctaLink,
    deepLink: body.deepLink,
    displayOrder: Number(body.displayOrder) || 0,
    isActive: body.isActive ?? true,
    startsAt: body.startsAt || undefined,
    endsAt: body.endsAt || undefined,
    popupFrequency: body.popupFrequency || "session",
    dismissible: body.dismissible ?? true,
  });

  return { campaign: formatCampaignForDashboard(campaign), __status: 201 };
};

export const updateCampaign = async (id, body) => {
  const campaign = await CampaignRepository.findById(id);
  if (!campaign) throw createError("Campaign not found", 404);

  if (body.type !== undefined && !CAMPAIGN_TYPES.includes(body.type)) {
    throw createError("Invalid campaign type");
  }

  if (body.slug !== undefined || body.name !== undefined) {
    const slug = body.slug?.trim()
      ? slugify(body.slug)
      : body.name
        ? slugify(body.name)
        : campaign.slug;
    const existing = await CampaignRepository.findOne({
      slug,
      _id: { $ne: id },
    });
    if (existing) throw createError("A campaign with this slug already exists", 409);
    campaign.slug = slug;
  }

  const allowed = [
    "name",
    "type",
    "title",
    "subtitle",
    "description",
    "backgroundColor",
    "textColor",
    "accentColor",
    "ctaText",
    "ctaLink",
    "deepLink",
    "displayOrder",
    "isActive",
    "startsAt",
    "endsAt",
    "popupFrequency",
    "dismissible",
  ];

  allowed.forEach((field) => {
    if (body[field] !== undefined) campaign[field] = body[field];
  });

  if (body.image !== undefined) campaign.image = normalizeStoredImage(body.image);
  if (body.mobileImage !== undefined) {
    campaign.mobileImage = normalizeStoredImage(body.mobileImage);
  }

  await campaign.save();
  return { campaign: formatCampaignForDashboard(campaign) };
};

export const toggleCampaignStatus = async (id, body) => {
  const campaign = await CampaignRepository.findById(id);
  if (!campaign) throw createError("Campaign not found", 404);

  campaign.isActive =
    typeof body?.isActive === "boolean" ? body.isActive : !campaign.isActive;
  await campaign.save();

  return { campaign: formatCampaignForDashboard(campaign) };
};

export const deleteCampaign = async (id) => {
  const campaign = await CampaignRepository.findById(id);
  if (!campaign) throw createError("Campaign not found", 404);

  campaign.isActive = false;
  await campaign.save();
  return { message: "Campaign deactivated" };
};
