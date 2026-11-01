/** Per-language text pair; null means "not supplied yet" (renders MISSING). */
export type I18nText = { en: string | null; fr: string | null };

export const tx = (en: string | null | undefined, fr: string | null | undefined): I18nText => ({
  en: en ?? null,
  fr: fr ?? null,
});

export type ProductCardData = {
  id: string;
  slug: string;
  name: I18nText;
  eyebrow: I18nText;
  fromPriceInr: number | null;
  compareAtInr?: number | null;
  isNew: boolean;
  isBestSeller: boolean;
  reviewCount: number;
  chips: string[];
  tone: string | null;
  image: string | null;
  image2: string | null;
  imageCount: number;
  createdAt: string;
  /** Set when a collection shows one card per colour: the colour, its swatch hex and a link that preselects it. */
  color?: string | null;
  colorHex?: string | null;
  href?: string;
};

export type Variant = {
  id: string;
  model: I18nText;
  color: I18nText;
  colorHex: string | null;
  material: string | null;
  priceInr: number | null;
  compareAtInr?: number | null;
  stock: number | null;
};

/** `color` = the colour this photo shows (e.g. "Grey"); selecting that colour puts it first. */
export type ProductImage = { id: string; url: string; type: string; alt: I18nText; color: string | null };
export type ProductVideo = { id: string; url: string; poster: string | null; title: I18nText };

export type ProductDetail = ProductCardData & {
  shortDescription: I18nText;
  overview: I18nText;
  deliveryAccess: I18nText;
  specs: { label_en?: string; label_fr?: string; value_en?: string; value_fr?: string }[];
  functions: string[];
  leadMin: number | null;
  leadMax: number | null;
  variants: Variant[];
  images: ProductImage[];
  videos: ProductVideo[];
  collectionIds: string[];
  collectionSlugs: string[];
  comparisons: Comparison[];
  comparisonPoints: string[];
  bonuses: Bonus[];
  freeGiftEnabled: boolean;
  guaranteeDays: number | null;
  guaranteeText: string | null;
  reviews: Review[];
  recentOrders: number;
};

export type Collection = {
  id: string;
  slug: string;
  title: I18nText;
  description: I18nText;
  heroImage: string | null;
};

export type ArticleCard = {
  id: string;
  slug: string;
  template: "guide" | "product_review";
  category: "sofa_guides" | "home_decor";
  title: I18nText;
  excerpt: I18nText;
  cover: string | null;
  readMinutes: number | null;
  publishedAt: string | null;
};

export type StoreSettings = {
  email: string | null;
  phone: string | null;
  address: string | null;
  mapUrl: string | null;
  openingHours: I18nText;
  playStoreUrl: string | null;
  shippingMethods: { code: string; label_en?: string; label_fr?: string; price_inr: number; days_min?: number; days_max?: number }[];
  campaign: { title: string; code: string; endsAt: string } | null;
  bonusesDefault: Bonus[];
  bundleMinItems: number;
  bundlePercent: number;
  lowStockThreshold: number;
  emiMonths: number;
  emiNoCost: boolean;
  freeGifts: FreeGift[];
  bundleTiers: { min: number; pct: number }[];
  emailPopup: { enabled: boolean; code: string | null };
};

export type Rates = Record<string, number | null>;

export type Comparison = { id: string; seller: string; url: string | null; priceInr: number; includesDelivery: boolean; includesGst: boolean; notes: string | null; checkedOn: string };

export type Bonus = { title: string; value_inr?: number | null; href?: string | null };
export type FreeGift = { key: string; title: string; value_inr: number | null; image: string | null };
export type Review = {
  id: string; rating: number; title: string | null; body: string | null; reason: string | null; photos: string[];
  verified: boolean; location: string | null; author: string | null; createdAt: string;
};
