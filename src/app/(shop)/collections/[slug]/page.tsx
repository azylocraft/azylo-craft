import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Media } from "@/components/shop/Media";
import { Crumb, NoMatches, Pagination, ProductGrid, RecentlyViewed, TitleText, Toolbar } from "@/components/shop/Listing";
import { Eyebrow, H, P } from "@/components/ui/primitives";
import { getCollection, listProducts } from "@/lib/catalog";
import { applyListing, parseListing } from "@/lib/listing";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCollection(slug);
  if (!c) return {};
  return {
    title: c.title.en ?? slug,
    description: c.description.en ?? undefined,
    openGraph: { title: c.title.en ?? slug, images: c.heroImage ? [c.heroImage] : undefined },
  };
}

export default async function CollectionPage({ params, searchParams }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const [collection, rows] = await Promise.all([getCollection(slug), listProducts({ collection: slug })]);
  if (!collection) notFound();
  const listing = parseListing(await searchParams);
  const { total, page, pages, items, facets } = applyListing(rows, listing);

  return (
    <>
      <div className="px-4 pt-6 md:px-12">
        <Crumb items={[{ label: "Home", href: "/" }, { label: "Collections", href: "/collections/all" }, { label: <TitleText text={collection.title} field="collection title" /> }]} />
        <div className="mt-5 grid overflow-hidden rounded-block border border-line2 bg-white shadow-card md:grid-cols-2 md:rounded-hero">
          <div className="order-2 flex flex-col justify-center gap-4 p-6 md:order-1 md:p-14">
            <Eyebrow>AZYLO · Curated collection</Eyebrow>
            <H as="h1" className="text-[30px] md:text-[52px]">
              <TitleText text={collection.title} field="collection title" />
            </H>
            <P className="max-w-[520px]">
              <TitleText text={collection.description} field="collection description" />
            </P>
          </div>
          <Media src={collection.heroImage} alt="" tone="#D9CDB9" label={collection.heroImage ? undefined : "collection hero photo"} eager className="order-1 h-[160px] md:order-2 md:h-auto md:min-h-[360px]" />
        </div>
        <div className="mt-8">
          <Suspense>
            <Toolbar total={total} params={listing} facets={facets} />
          </Suspense>
        </div>
        <div className="mt-6">{items.length ? <ProductGrid items={items} /> : <Suspense><NoMatches /></Suspense>}</div>
        <Suspense>
          <Pagination page={page} pages={pages} />
        </Suspense>
      </div>
      <RecentlyViewed />
    </>
  );
}
