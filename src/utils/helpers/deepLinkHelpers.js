/**
 * Resolve a structured deepLink into a storefront href.
 * Falls back to legacy `ctaLink` / `link` string when deepLink is empty.
 */
export const resolveDeepLink = (deepLink, fallbackUrl = "") => {
  if (!deepLink || typeof deepLink !== "object") {
    return fallbackUrl || null;
  }

  const kind = deepLink.kind || "page";
  const ref = (deepLink.ref || "").trim().replace(/^\/+/, "");
  const url = (deepLink.url || "").trim();

  switch (kind) {
    case "product":
      return ref ? `/product/${ref}` : fallbackUrl || null;
    case "category":
      return ref ? `/category/${ref}` : fallbackUrl || null;
    case "brand":
      return ref ? `/brand/${ref}` : fallbackUrl || null;
    case "collection":
      return ref ? `/collections/${ref}` : fallbackUrl || null;
    case "external":
      return url || fallbackUrl || null;
    case "page": {
      if (url) {
        return url.startsWith("/") ? url : `/${url.replace(/^\/+/, "")}`;
      }
      if (ref) {
        return `/${ref}`;
      }
      return fallbackUrl || null;
    }
    default:
      return fallbackUrl || null;
  }
};

export const normalizeDeepLink = (input) => {
  if (!input || typeof input !== "object") return undefined;

  const kind = input.kind || "page";
  const ref = input.ref?.trim() || undefined;
  const url = input.url?.trim() || undefined;

  if (!ref && !url) return undefined;

  return { kind, ...(ref ? { ref } : {}), ...(url ? { url } : {}) };
};

/** Sync legacy string link from deepLink when applicable. */
export const legacyUrlFromDeepLink = (deepLink) => {
  if (!deepLink) return undefined;
  if (deepLink.kind === "external" || deepLink.kind === "page") {
    return resolveDeepLink(deepLink) || undefined;
  }
  return resolveDeepLink(deepLink) || undefined;
};
