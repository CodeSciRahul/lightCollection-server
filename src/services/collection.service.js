import * as CollectionRepository from "../repositories/collection.repository.js";
import * as ProductRepository from "../repositories/product.repository.js";
import {
  formatCollectionForDashboard,
  formatCollectionForPublic,
  normalizeStoredImage,
} from "../utils/helpers/storedImageHelpers.js";
import { formatProductCard } from "../utils/helpers/productHelpers.js";
import { publicActiveFilter } from "../utils/helpers/scheduleHelpers.js";
import { createError } from "../utils/AppError.js";
import { slugify } from "../utils/helpers/userHelpers.js";

export const getCollections = async () => {
  const collections = await CollectionRepository.find(publicActiveFilter()).sort({
    displayOrder: 1,
  });
  return { collections: collections.map(formatCollectionForPublic) };
};

export const getCollectionBySlug = async (slug) => {
  const collection = await CollectionRepository.findOne({
    slug,
    ...publicActiveFilter(),
  });
  if (!collection) throw createError("Collection not found", 404);

  const products = await ProductRepository.find({
    _id: { $in: collection.productIds || [] },
    isActive: true,
  })
    .populate("category", "name slug")
    .populate("brand", "name slug logo");

  const byId = new Map(products.map((p) => [String(p._id), p]));
  const ordered = (collection.productIds || [])
    .map((id) => byId.get(String(id)))
    .filter(Boolean)
    .map(formatProductCard);

  return {
    collection: {
      ...formatCollectionForPublic(collection),
      products: ordered,
    },
  };
};

export const listCollectionsAdmin = async () => {
  const collections = await CollectionRepository.findAllSorted();
  return { collections: collections.map(formatCollectionForDashboard) };
};

export const createCollection = async (body) => {
  const { name, title } = body;
  if (!name?.trim() || !title?.trim()) {
    throw createError("name and title are required");
  }

  const slug = body.slug?.trim() ? slugify(body.slug) : slugify(name);
  const existing = await CollectionRepository.findOne({ slug });
  if (existing) throw createError("A collection with this slug already exists", 409);

  const collection = await CollectionRepository.create({
    name: name.trim(),
    slug,
    title: title.trim(),
    subtitle: body.subtitle?.trim() || "",
    description: body.description?.trim() || "",
    image: normalizeStoredImage(body.image),
    productIds: body.productIds || [],
    ctaText: body.ctaText || "Explore Collection",
    ctaLink: body.ctaLink,
    backgroundColor: body.backgroundColor,
    textColor: body.textColor,
    displayOrder: Number(body.displayOrder) || 0,
    isActive: body.isActive ?? true,
    startsAt: body.startsAt || undefined,
    endsAt: body.endsAt || undefined,
  });

  return { collection: formatCollectionForDashboard(collection), __status: 201 };
};

export const updateCollection = async (id, body) => {
  const collection = await CollectionRepository.findById(id);
  if (!collection) throw createError("Collection not found", 404);

  if (body.slug !== undefined || body.name !== undefined) {
    const slug = body.slug?.trim()
      ? slugify(body.slug)
      : body.name
        ? slugify(body.name)
        : collection.slug;
    const existing = await CollectionRepository.findOne({
      slug,
      _id: { $ne: id },
    });
    if (existing) throw createError("A collection with this slug already exists", 409);
    collection.slug = slug;
  }

  const allowed = [
    "name",
    "title",
    "subtitle",
    "description",
    "productIds",
    "ctaText",
    "ctaLink",
    "backgroundColor",
    "textColor",
    "displayOrder",
    "isActive",
    "startsAt",
    "endsAt",
  ];

  allowed.forEach((field) => {
    if (body[field] !== undefined) collection[field] = body[field];
  });

  if (body.image !== undefined) {
    collection.image = normalizeStoredImage(body.image);
  }

  await collection.save();
  return { collection: formatCollectionForDashboard(collection) };
};

export const toggleCollectionStatus = async (id, body) => {
  const collection = await CollectionRepository.findById(id);
  if (!collection) throw createError("Collection not found", 404);

  collection.isActive =
    typeof body?.isActive === "boolean" ? body.isActive : !collection.isActive;
  await collection.save();

  return { collection: formatCollectionForDashboard(collection) };
};

export const deleteCollection = async (id) => {
  const collection = await CollectionRepository.findById(id);
  if (!collection) throw createError("Collection not found", 404);

  collection.isActive = false;
  await collection.save();
  return { message: "Collection deactivated" };
};
