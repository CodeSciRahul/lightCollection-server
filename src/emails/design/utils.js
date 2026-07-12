import { colors, typography } from "./tokens.js";

/** Escape user-provided strings for safe HTML interpolation. */
export const escapeHtml = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

export const formatDate = (date = new Date(), timeZone = "UTC") => {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
      timeZoneName: "short",
    }).format(date instanceof Date ? date : new Date(date));
  } catch {
    return String(date);
  }
};

export const textStyle = (overrides = {}) => ({
  margin: "0",
  fontFamily: typography.fontFamily,
  fontSize: typography.fontSize.base,
  lineHeight: typography.lineHeight.relaxed,
  color: colors.ink,
  ...overrides,
});

export const styleAttr = (styleObj) =>
  Object.entries(styleObj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) =>
        `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${v}`
    )
    .join(";");
