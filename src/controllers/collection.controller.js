import { serviceHandler } from "../utils/helpers/controllerHelpers.js";
import * as CollectionService from "../services/collection.service.js";

export const getCollections = serviceHandler(() =>
  CollectionService.getCollections()
);

export const getCollectionBySlug = serviceHandler((req) =>
  CollectionService.getCollectionBySlug(req.params.slug)
);

export const listCollectionsAdmin = serviceHandler(() =>
  CollectionService.listCollectionsAdmin()
);

export const createCollection = serviceHandler(
  (req) => CollectionService.createCollection(req.body),
  201
);

export const updateCollection = serviceHandler((req) =>
  CollectionService.updateCollection(req.params.id, req.body)
);

export const toggleCollectionStatus = serviceHandler((req) =>
  CollectionService.toggleCollectionStatus(req.params.id, req.body)
);

export const deleteCollection = serviceHandler((req) =>
  CollectionService.deleteCollection(req.params.id)
);
