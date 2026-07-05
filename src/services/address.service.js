import * as AddressRepository from "../repositories/address.repository.js";
import { createError } from "../utils/AppError.js";

export const getAddresses = async (userId) => {
  const addresses = await AddressRepository.findByUser(userId);
  return { addresses };
};

export const createAddress = async (userId, body) => {
  const data = { ...body, user: userId };

  if (data.isDefault) {
    await AddressRepository.clearDefaultForUser(userId);
  }

  const addressCount = await AddressRepository.countDocuments({ user: userId });
  if (addressCount === 0) data.isDefault = true;

  const address = await AddressRepository.create(data);
  return { address, __status: 201 };
};

export const updateAddress = async (userId, addressId, body) => {
  const address = await AddressRepository.findOneByIdAndUser(addressId, userId);
  if (!address) throw createError("Address not found", 404);

  if (body.isDefault) {
    await AddressRepository.clearDefaultForUser(userId);
  }

  Object.assign(address, body);
  await address.save();
  return { address };
};

export const deleteAddress = async (userId, addressId) => {
  const address = await AddressRepository.findOneAndDelete({
    _id: addressId,
    user: userId,
  });

  if (!address) throw createError("Address not found", 404);
  return { message: "Address deleted" };
};

export const setDefaultAddress = async (userId, addressId) => {
  await AddressRepository.clearDefaultForUser(userId);
  const address = await AddressRepository.setDefaultForUser(addressId, userId);

  if (!address) throw createError("Address not found", 404);
  return { address };
};
