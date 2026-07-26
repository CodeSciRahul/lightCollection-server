import * as BrandRepository from "../repositories/brand.repository.js";
import {
  formatBrandForDashboard,
  formatBrandForPublic,
  normalizeStoredImage,
} from "../utils/helpers/storedImageHelpers.js";
import { createError } from "../utils/AppError.js";
import { slugify } from "../utils/helpers/userHelpers.js";

export const getBrands = async () => {
  const brands = await BrandRepository.find({ isActive: true }).sort({ name: 1 });
  return { brands: brands.map(formatBrandForPublic) };
};

export const listBrandsAdmin = async () => {
  const brands = await BrandRepository.findAllSorted();
  return { brands: brands.map(formatBrandForDashboard) };
};

export const createBrand = async (body) => {
  const { name } = body;
  if (!name?.trim()) throw createError("name is required");

  const slug = body.slug?.trim() ? slugify(body.slug) : slugify(name);
  const existing = await BrandRepository.findOne({ slug });
  if (existing) throw createError("A brand with this slug already exists", 409);

  const brand = await BrandRepository.create({
    name: name.trim(),
    slug,
    logo: normalizeStoredImage(body.logo),
    isActive: body.isActive ?? true,
  });

  return { brand: formatBrandForDashboard(brand), __status: 201 };
};

export const updateBrand = async (id, body) => {
  const brand = await BrandRepository.findById(id);
  if (!brand) throw createError("Brand not found", 404);

  if (body.name !== undefined || body.slug !== undefined) {
    const slug = body.slug?.trim()
      ? slugify(body.slug)
      : body.name
        ? slugify(body.name)
        : brand.slug;
    const existing = await BrandRepository.findOne({ slug, _id: { $ne: id } });
    if (existing) throw createError("A brand with this slug already exists", 409);
    brand.slug = slug;
  }

  if (body.name !== undefined) brand.name = body.name.trim();
  if (body.isActive !== undefined) brand.isActive = body.isActive;
  if (body.logo !== undefined) brand.logo = normalizeStoredImage(body.logo);

  await brand.save();
  return { brand: formatBrandForDashboard(brand) };
};

export const toggleBrandStatus = async (id, body) => {
  const brand = await BrandRepository.findById(id);
  if (!brand) throw createError("Brand not found", 404);

  brand.isActive =
    typeof body?.isActive === "boolean" ? body.isActive : !brand.isActive;
  await brand.save();

  return { brand: formatBrandForDashboard(brand) };
};

export const deleteBrand = async (id) => {
  const brand = await BrandRepository.findById(id);
  if (!brand) throw createError("Brand not found", 404);

  brand.isActive = false;
  await brand.save();
  return { message: "Brand deactivated" };
};
