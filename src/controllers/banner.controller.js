import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as BannerService from "../services/banner.service.js";

export const getBanners = serviceHandler(() => BannerService.getBanners());

export const listBannersAdmin = serviceHandler(() => BannerService.listBannersAdmin());

export const createBanner = serviceHandler(
  (req) => BannerService.createBanner(req.body),
  201
);

export const updateBanner = serviceHandler((req) =>
  BannerService.updateBanner(req.params.id, req.body)
);

export const toggleBannerStatus = serviceHandler((req) =>
  BannerService.toggleBannerStatus(req.params.id, req.body)
);

export const deleteBanner = serviceHandler((req) =>
  BannerService.deleteBanner(req.params.id)
);
