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
        {/* Full-width photo banner: slow zoom on the photo, text rises in over a white fade. */}
        <div className="relative mt-5 isolate flex min-h-[340px] items-end overflow-hidden rounded-block border border-line2 bg-white md:min-h-[420px] md:items-center md:rounded-hero">
          <div className="absolute inset-0 -z-20 overflow-hidden md:left-[30%]">
            <Media src={collection.heroImage} alt="" tone="#ECEBE6" label={collection.heroImage ? undefined : "collection hero photo"} eager className="az-kenburns size-full" />
          </div>
          <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(255,255,255,.96)_0%,rgba(255,255,255,.75)_45%,rgba(255,255,255,0)_75%)] md:bg-[linear-gradient(90deg,#fff_0%,#fff_30%,rgba(255,255,255,.7)_40%,rgba(255,255,255,0)_58%)]" />
          <div className="flex max-w-[560px] flex-col gap-3 p-6 md:gap-4 md:p-14">
            <div className="az-fade-up">
              <Eyebrow>AZYLO · Curated collection</Eyebrow>
            </div>
            <H as="h1" className="az-fade-up text-[32px] md:text-[56px]" >
              <TitleText text={collection.title} field="collection title" />
            </H>
            <div className="az-fade-up" style={{ ["--d" as string]: "200ms" }}>
              <P className="max-w-[460px] text-ink2">
                <TitleText text={collection.description} field="collection description" />
              </P>
            </div>
          </div>
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
