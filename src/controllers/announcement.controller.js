import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as AnnouncementService from "../services/announcement.service.js";

export const getAnnouncements = serviceHandler(() => AnnouncementService.getAnnouncements());

export const getAnnouncementById = serviceHandler((req) =>
  AnnouncementService.getAnnouncementById(req.params.id)
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

export const deleteAnnouncement = serviceHandler((req) =>
  AnnouncementService.deleteAnnouncement(req.params.id)
);
