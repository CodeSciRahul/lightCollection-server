/**
 * NileCart email design tokens — aligned with storefront brand palette.
 * Prefer hex values; email clients have limited CSS variable support.
 */

export const brand = {
  name: "NileCart",
  domain: "nilescart.com",
  tagline: "Fashion marketplace for modern sellers",
};

export const colors = {
  amber: "#ffbf00",
  cream: "#fff5d1",
  white: "#ffffff",
  ink: "#1a1a1a",
  gray: "#777777",
  muted: "#9a9a9a",
  border: "#e8e0c8",
  surface: "#faf8f0",
  success: "#15803d",
  successBg: "#f0fdf4",
  successBorder: "#bbf7d0",
  warning: "#b45309",
  warningBg: "#fffbeb",
  warningBorder: "#fde68a",
  danger: "#dc2626",
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
  info: "#1d4ed8",
  infoBg: "#eff6ff",
  infoBorder: "#bfdbfe",
};

export const typography = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  fontSize: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "22px",
    "2xl": "28px",
  },
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.65",
  },
};

export const spacing = {
  xs: "8px",
  sm: "12px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
};

export const layout = {
  maxWidth: "600px",
  borderRadius: "10px",
  buttonRadius: "8px",
};

export const defaults = {
  reviewTimelineDays: 3,
  supportEmail: `support@${brand.domain}`,
  sellerEmail: `seller@${brand.domain}`,
  legalEmail: `legal@${brand.domain}`,
  returnsEmail: `returns@${brand.domain}`,
};
