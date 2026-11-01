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
  fromPriceCad: number | null;
  isNew: boolean;
  isBestSeller: boolean;
  reviewCount: number;
  chips: string[];
  tone: string | null;
  image: string | null;
  image2: string | null;
  imageCount: number;
  createdAt: string;
};

export type Variant = {
  id: string;
  model: I18nText;
  color: I18nText;
  colorHex: string | null;
  material: string | null;
  priceCad: number | null;
  stock: number | null;
};

export type ProductImage = { id: string; url: string; type: string; alt: I18nText };
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
  shippingMethods: { code: string; label_en?: string; label_fr?: string; price_cad: number; days_min?: number; days_max?: number }[];
};

export type Rates = Record<string, number | null>;
