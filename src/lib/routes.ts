import type { LucideIcon } from "lucide-react";
import { BookOpen, Compass, Info, Layers, Mail, Smartphone } from "lucide-react";

export const collectionHref = (slug: string) => `/collections/${slug}`;

export const routes = {
  home: "/",
  search: "/search",
  cart: "/cart",
  checkout: "/checkout",
  login: "/auth/login",
  account: "/account",
  giftCards: "/pages/gift-cards",
  catalog: "/pages/electric-sofa-catalog",
  blogs: "/pages/blogs",
  materials: "/pages/sofa-materials-guide",
  about: "/pages/about-us",
  contact: "/pages/contact",
  faq: "/pages/faq",
  app: "/pages/app",
  shipping: "/pages/shipping-policy",
  refund: "/pages/refund-policy",
  privacy: "/pages/privacy-policy",
  terms: "/pages/terms-of-service",
} as const;

export type NavItem = { key: string; href: string };

/** Header row 2 category pills, in design order. */
export const categoryPills: NavItem[] = [
  { key: "nav.powerReclining", href: collectionHref("power-reclining-sofas") },
  { key: "nav.sofaBeds", href: collectionHref("convertible-sofa-beds") },
  { key: "nav.smallSpace", href: collectionHref("small-space-sofas") },
  { key: "nav.compressed", href: collectionHref("compressed-sofas") },
  { key: "nav.modular", href: collectionHref("modular-sectional-sofas") },
  { key: "nav.smartTables", href: collectionHref("rolling-side-table-with-storage") },
  { key: "nav.newArrivals", href: collectionHref("new-arrivals") },
];

/** Categories panel (spec §3.2). */
export const categoriesPanel: NavItem[] = [
  { key: "nav.home", href: routes.home },
  ...categoryPills,
  { key: "nav.catalog", href: routes.catalog },
  { key: "nav.blogs", href: routes.blogs },
  { key: "nav.contact", href: routes.contact },
  { key: "nav.app", href: routes.app },
];

export type DiscoverItem = NavItem & { sub: string; icon: LucideIcon };

export const discoverMenu: DiscoverItem[] = [
  { key: "nav.catalog", sub: "discoverSub.catalog", href: routes.catalog, icon: BookOpen },
  { key: "nav.guides", sub: "discoverSub.guides", href: routes.blogs, icon: Compass },
  { key: "nav.materials", sub: "discoverSub.materials", href: routes.materials, icon: Layers },
  { key: "nav.about", sub: "discoverSub.about", href: routes.about, icon: Info },
  { key: "nav.contact", sub: "discoverSub.contact", href: routes.contact, icon: Mail },
  { key: "nav.appShort", sub: "discoverSub.app", href: routes.app, icon: Smartphone },
];

export const footerColumns: { title: string; links: NavItem[] }[] = [
  {
    title: "footer.shop",
    links: [
      { key: "footer.links.bestSelling", href: collectionHref("best-selling-sofas") },
      { key: "footer.links.powerReclining", href: collectionHref("power-reclining-sofas") },
      { key: "footer.links.sofaBeds", href: collectionHref("convertible-sofa-beds") },
      { key: "footer.links.modular", href: collectionHref("modular-sectional-sofas") },
      { key: "footer.links.spaceSaving", href: collectionHref("small-space-sofas") },
    ],
  },
  {
    title: "footer.brand",
    links: [
      { key: "footer.links.about", href: routes.about },
      { key: "footer.links.guides", href: routes.blogs },
      { key: "footer.links.materials", href: routes.materials },
      { key: "footer.links.contact", href: routes.contact },
      { key: "footer.links.faq", href: routes.faq },
      { key: "footer.links.all", href: collectionHref("all") },
    ],
  },
  {
    title: "footer.support",
    links: [
      { key: "footer.links.shipping", href: routes.shipping },
      { key: "footer.links.refund", href: routes.refund },
      { key: "footer.links.privacy", href: routes.privacy },
      { key: "footer.links.terms", href: routes.terms },
      { key: "footer.links.orderHelp", href: routes.contact },
    ],
  },
];
