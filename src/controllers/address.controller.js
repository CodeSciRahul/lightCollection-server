import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as AddressService from "../services/address.service.js";

export const getAddresses = serviceHandler((req) =>
  AddressService.getAddresses(req.user._id)
);

export const createAddress = serviceHandler(
  (req) => AddressService.createAddress(req.user._id, req.body),
  201
);

export const updateAddress = serviceHandler((req) =>
  AddressService.updateAddress(req.user._id, req.params.id, req.body)
);

export const deleteAddress = serviceHandler((req) =>
  AddressService.deleteAddress(req.user._id, req.params.id)
);

export const setDefaultAddress = serviceHandler((req) =>
  AddressService.setDefaultAddress(req.user._id, req.params.id)
);
