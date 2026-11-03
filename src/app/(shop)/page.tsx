import { Hero } from "@/components/home/Hero";
import { HowItWorks, Obstacles, Outcomes, WhyItMatters } from "@/components/home/Story";
import { BestSellers, ExploreTypes, JournalRow, MaterialsTeaser, NewArrivals, type TypeTab } from "@/components/home/HomeSections";
import { collectionCounts, listArticles, listCards, listMaterials } from "@/lib/catalog";

export const revalidate = 60;

const TYPES = [
  { key: "home.tabPower", slug: "power-reclining-sofas", title: "Power Reclining Sofas" },
  { key: "home.tabBeds", slug: "convertible-sofa-beds", title: "Convertible Sofa Beds" },
  { key: "home.tabModular", slug: "modular-sectional-sofas", title: "Modular Sofas" },
];

export default async function HomePage() {
  const [featured, best, fresh, counts, journal, materials, ...typeCards] = await Promise.all([
    listCards({ flag: "is_featured", limit: 1 }),
    listCards({ flag: "is_best_seller", limit: 12 }),
    listCards({ flag: "is_new", limit: 12 }),
    collectionCounts(),
    listArticles({ limit: 8 }),
    listMaterials(),
    ...TYPES.map((x) => listCards({ collection: x.slug, limit: 12 })),
  ]);
  const tabs: TypeTab[] = TYPES.map((x, i) => ({ ...x, count: counts[x.slug] ?? 0, products: typeCards[i] }));
  const f = featured[0];

  return (
    <>
      <Hero featured={f ? { name: f.name.en ?? "", slug: f.slug, imageUrl: f.image ?? undefined, tone: f.tone } : null} />
      <Outcomes />
      <BestSellers products={best} />
      <Obstacles />
      <HowItWorks />
      <ExploreTypes tabs={tabs} />
      <NewArrivals products={fresh} />
      <WhyItMatters />
      <MaterialsTeaser materials={materials.filter((m) => m.category === "upholstery").map((m) => ({ slug: m.slug, name: m.name, image: m.sofaImage }))} />
      <JournalRow articles={journal.articles} />
    </>
  );
}
