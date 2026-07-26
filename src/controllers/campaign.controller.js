import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as CampaignService from "../services/campaign.service.js";

export const getCampaigns = serviceHandler((req) =>
  CampaignService.getCampaigns(req.query)
);

export const listCampaignsAdmin = serviceHandler(() =>
  CampaignService.listCampaignsAdmin()
);

export const createCampaign = serviceHandler(
  (req) => CampaignService.createCampaign(req.body),
  201
);

export const updateCampaign = serviceHandler((req) =>
  CampaignService.updateCampaign(req.params.id, req.body)
);

export const toggleCampaignStatus = serviceHandler((req) =>
  CampaignService.toggleCampaignStatus(req.params.id, req.body)
);

export const deleteCampaign = serviceHandler((req) =>
  CampaignService.deleteCampaign(req.params.id)
);
