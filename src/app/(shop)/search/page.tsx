import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResultsHead, SearchEmpty } from "@/components/shop/SearchParts";
import { NoMatches, Pagination, ProductGrid, Toolbar } from "@/components/shop/Listing";
import { listCards, listProducts, searchProducts } from "@/lib/catalog";
import { applyListing, parseListing } from "@/lib/listing";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  if (!q) return <SearchResultsHead q="" total={0} />;
  const matches = await searchProducts(q);
  const ids = new Set(matches.map((m) => m.id));
  const rows = (await listProducts()).filter((r) => ids.has(r.card.id));
  const listing = parseListing(sp);
  const { total, page, pages, items, facets } = applyListing(rows, listing);
  if (rows.length === 0) {
    const suggestions = await listCards({ flag: "is_best_seller", limit: 4 });
    return <SearchEmpty q={q} suggestions={suggestions} />;
  }
  return (
    <>
      <SearchResultsHead q={q} total={total} />
      <div className="px-4 md:px-12">
        <Suspense>
          <Toolbar total={total} params={listing} facets={facets} />
        </Suspense>
        <div className="mt-6">{items.length ? <ProductGrid items={items} /> : <Suspense><NoMatches /></Suspense>}</div>
        <Suspense>
          <Pagination page={page} pages={pages} />
        </Suspense>
      </div>
    </>
  );
}
