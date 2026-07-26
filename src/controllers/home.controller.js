import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as HomeService from "../services/home.service.js";

export const getHomePage = serviceHandler(() => HomeService.getHomePage());

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
