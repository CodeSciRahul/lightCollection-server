import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as HomeService from "../services/home.service.js";
import { buildAudienceContext } from "../utils/helpers/targetingHelpers.js";
import { MARKETING_CACHE_CONTROL } from "../constants/marketing.js";

export const getHomePage = serviceHandler(async (req) => {
  const result = await HomeService.getHomePage(buildAudienceContext(req));
  return {
    ...result,
    __setHeaders: { "Cache-Control": MARKETING_CACHE_CONTROL },
  };
});

export const listHomeSectionsAdmin = serviceHandler(() =>
  HomeService.listHomeSectionsAdmin()
);

export const createHomeSection = serviceHandler(
  (req) => HomeService.createHomeSection(req.body),
  201
);

export const updateHomeSection = serviceHandler((req) =>
  HomeService.updateHomeSection(req.params.id, req.body)
);

export const reorderHomeSections = serviceHandler((req) =>
  HomeService.reorderHomeSections(req.body)
);

export const toggleHomeSectionStatus = serviceHandler((req) =>
  HomeService.toggleHomeSectionStatus(req.params.id, req.body)
);

export const deleteHomeSection = serviceHandler((req) =>
  HomeService.deleteHomeSection(req.params.id)
);
