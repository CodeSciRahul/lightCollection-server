/** Supported homepage section types rendered by the storefront. */
export const HOME_SECTION_TYPES = [
  "hero_banner",
  "announcement_bar",
  "promotional_campaign",
  "flash_sale",
  "category_highlights",
  "brand_showcase",
  "featured_collection",
  "recommended_products",
  "seasonal_campaign",
  "custom_marketing",
  "popup_campaign",
];

export const PRODUCT_SOURCES = [
  "trending",
  "sale",
  "new",
  "ids",
  "all",
];

export const CAMPAIGN_TYPES = [
  "promotional",
  "seasonal",
  "custom",
  "popup",
];

export const SECTION_TYPE_LABELS = {
  hero_banner: "Hero Banner",
  announcement_bar: "Announcement Bar",
  promotional_campaign: "Promotional Campaign",
  flash_sale: "Flash Sale",
  category_highlights: "Category Highlights",
  brand_showcase: "Brand Showcase",
  featured_collection: "Featured Collection",
  recommended_products: "Recommended Products",
  seasonal_campaign: "Seasonal Campaign",
  custom_marketing: "Custom Marketing",
  popup_campaign: "Popup Campaign",
};

/** Default homepage layout seeded when no sections exist. */
export const DEFAULT_HOME_SECTIONS = [
  {
    key: "hero-main",
    type: "hero_banner",
    title: "Hero Banners",
    subtitle: "",
    displayOrder: 10,
    isActive: true,
    config: { source: "all_active", layout: "carousel", limit: 8 },
  },
  {
    key: "categories-highlight",
    type: "category_highlights",
    title: "Shop by Category",
    subtitle: "Explore curated styles for every mood",
    displayOrder: 20,
    isActive: true,
    config: { source: "nav", layout: "grid", limit: 8 },
  },
  {
    key: "trending-rail",
    type: "recommended_products",
    title: "Trending Now",
    subtitle: "Fashion picks everyone's loving",
    displayOrder: 30,
    isActive: true,
    config: { productSource: "trending", layout: "grid", limit: 8 },
  },
  {
    key: "top-picks",
    type: "recommended_products",
    title: "Top Picks You'll Love",
    subtitle: "Products you might like",
    displayOrder: 40,
    isActive: true,
    config: { productSource: "all", layout: "grid", limit: 12 },
  },
  {
    key: "brands-showcase",
    type: "brand_showcase",
    title: "Shop by Brand",
    subtitle: "Your favourite labels in one place",
    displayOrder: 50,
    isActive: false,
    config: { source: "all_active", layout: "strip", limit: 12 },
  },
];
