import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as AnnouncementService from "../services/announcement.service.js";
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

export const getAnnouncements = withMarketingCache((req) =>
  AnnouncementService.getAnnouncements(buildAudienceContext(req))
);

export const getAnnouncementById = withMarketingCache((req) =>
  AnnouncementService.getAnnouncementById(
    req.params.id,
    buildAudienceContext(req)
  )
);

export const listAnnouncementsAdmin = serviceHandler(() =>
  AnnouncementService.listAnnouncementsAdmin()
);

export const createAnnouncement = serviceHandler(
  (req) => AnnouncementService.createAnnouncement(req.body),
  201
);

export const updateAnnouncement = serviceHandler((req) =>
  AnnouncementService.updateAnnouncement(req.params.id, req.body)
);

export const toggleAnnouncementStatus = serviceHandler((req) =>
  AnnouncementService.toggleAnnouncementStatus(req.params.id, req.body)
);

export const deleteAnnouncement = serviceHandler((req) =>
  AnnouncementService.deleteAnnouncement(req.params.id)
);
