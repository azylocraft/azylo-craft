import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutView } from "@/components/pages/AboutView";
import { ComingSoon } from "@/components/pages/ComingSoon";
import { ContactView } from "@/components/pages/ContactView";
import { FaqView } from "@/components/pages/FaqView";
import { JournalView } from "@/components/pages/JournalView";
import { MaterialsView } from "@/components/pages/MaterialsView";
import { PolicyView } from "@/components/pages/Policy";
import { getPage, listArticles, listFaqs, listMaterials } from "@/lib/catalog";

export const revalidate = 60;

const POLICIES = ["shipping-policy", "refund-policy", "privacy-policy", "terms-of-service"];
const TITLES: Record<string, string> = {
  "about-us": "About us",
  contact: "Contact",
  faq: "FAQ",
  blogs: "The Sofa Journal",
  "sofa-materials-guide": "Sofa Materials Guide",
  "gift-cards": "Gift cards",
  app: "AZYLO App",
  "electric-sofa-catalog": "2026 Electric Sofa Catalog",
};
const GUIDES_PER_PAGE = 9;

export async function generateMetadata({ params }: PageProps<"/pages/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (TITLES[slug]) return { title: TITLES[slug] };
  if (POLICIES.includes(slug)) {
    const p = await getPage(slug);
    return { title: p?.title.en ?? slug };
  }
  return { title: "Page not found" };
}

export default async function ContentPage({ params, searchParams }: PageProps<"/pages/[slug]">) {
  const { slug } = await params;
  switch (slug) {
    case "about-us": {
      const p = await getPage("about-us");
      return <AboutView blocks={p?.blocks ?? {}} />;
    }
    case "contact":
      return <ContactView />;
    case "faq":
      return <FaqView faqs={await listFaqs()} />;
    case "sofa-materials-guide":
      return <MaterialsView materials={await listMaterials()} />;
    case "gift-cards":
      return <ComingSoon kind="giftCards" />;
    case "app":
      return <ComingSoon kind="app" />;
    case "electric-sofa-catalog":
      return <ComingSoon kind="catalog" />;
    case "blogs": {
      const sp = await searchParams;
      const tab = (Array.isArray(sp.tab) ? sp.tab[0] : sp.tab) ?? "all";
      const category = tab === "sofa_guides" || tab === "home_decor" ? tab : undefined;
      const page = Math.max(1, Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1);
      const [{ articles: latest }, { articles, total }] = await Promise.all([
        listArticles({ limit: 1 }),
        listArticles({ category, limit: GUIDES_PER_PAGE, offset: (page - 1) * GUIDES_PER_PAGE }),
      ]);
      return <JournalView latest={latest[0] ?? null} articles={articles} page={page} pages={Math.max(1, Math.ceil(total / GUIDES_PER_PAGE))} tab={category ?? "all"} />;
    }
  }
  if (POLICIES.includes(slug)) {
    const p = await getPage(slug);
    if (!p) notFound();
    return <PolicyView title={p.title} body={p.body} lastUpdated={p.lastUpdated} />;
  }
  notFound();
}
