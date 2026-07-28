import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as BannerService from "../services/banner.service.js";
import { buildAudienceContext } from "../utils/helpers/targetingHelpers.js";
import { MARKETING_CACHE_CONTROL } from "../constants/marketing.js";

const withMarketingCache = (handler) =>
  serviceHandler(async (req) => {
    const result = await handler(req);
    return {
      ...result,
      __setHeaders: { "Cache-Control": MARKETING_CACHE_CONTROL },
    };
  });

export const getBanners = withMarketingCache((req) =>
  BannerService.getBanners(buildAudienceContext(req))
);

export const listBannersAdmin = serviceHandler(() =>
  BannerService.listBannersAdmin()
);

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

export const reorderBanners = serviceHandler((req) =>
  BannerService.reorderBanners(req.body)
);

export const deleteBanner = serviceHandler((req) =>
  BannerService.deleteBanner(req.params.id)
);
