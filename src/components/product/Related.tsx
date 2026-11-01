"use client";

import { Carousel } from "@/components/shop/Carousel";
import { GCard } from "@/components/shop/ProductCards";
import { Eyebrow, H } from "@/components/ui/primitives";
import type { ProductCardData } from "@/lib/types";

/** "You may also like" — same collection, current product excluded. */
export function RelatedCarousel({ title, products }: { title: string; products: ProductCardData[] }) {
  return (
    <section className="px-4 pt-16 md:px-12 md:pt-24">
      <Eyebrow>AZYLO</Eyebrow>
      <H className="mb-8 mt-3 text-[30px] md:text-[40px]">{title}</H>
      <Carousel label={title}>
        {products.map((p) => (
          <GCard key={p.id} p={p} imgH={220} />
        ))}
      </Carousel>
    </section>
  );
}
