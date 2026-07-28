import { defaultTargeting } from "../../models/schemas/targeting.schema.js";

const MOBILE_UA =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

/**
 * Build audience context from an Express request.
 * Prefers explicit `?device=` query; otherwise infers from User-Agent.
 */
export const buildAudienceContext = (req = {}) => {
  const queryDevice = String(req.query?.device || "").toLowerCase();
  let device = "desktop";

  if (queryDevice === "mobile" || queryDevice === "desktop") {
    device = queryDevice;
  } else {
    const ua = req.headers?.["user-agent"] || "";
    device = MOBILE_UA.test(ua) ? "mobile" : "desktop";
  }

  const auth = req.user ? "authenticated" : "guest";

  return { device, auth };
};

export const normalizeTargeting = (input) => {
  const base = defaultTargeting();
  if (!input || typeof input !== "object") return base;

  const devices = Array.isArray(input.devices) && input.devices.length
    ? input.devices
    : base.devices;

  const auth = input.auth || base.auth;

  return { devices, auth };
};

/**
 * Returns true when a document's targeting matches the audience.
 * Missing targeting = visible to all.
 */
export const matchesTargeting = (doc, audience = {}) => {
  const targeting = doc?.targeting || defaultTargeting();
  const devices = targeting.devices?.length ? targeting.devices : ["all"];
  const authRule = targeting.auth || "all";

  const device = audience.device || "desktop";
  const auth = audience.auth || "guest";

  const deviceOk =
    devices.includes("all") || devices.includes(device);

  const authOk =
    authRule === "all" ||
    (authRule === "guest" && auth === "guest") ||
    (authRule === "authenticated" && auth === "authenticated");

  return deviceOk && authOk;
};

/** Filter an array of docs by targeting rules. */
export const filterByTargeting = (docs, audience) =>
  (docs || []).filter((doc) => matchesTargeting(doc, audience));
