import { GCardSkeleton } from "@/components/shop/ProductCards";

/** Collection grid skeleton (design screen 19). */
export default function Loading() {
  return (
    <div className="px-4 pt-6 md:px-12" aria-busy="true" aria-label="Loading">
      <div className="az-skeleton h-3 w-56 rounded" />
      <div className="az-skeleton mt-5 h-[220px] rounded-block md:h-[360px] md:rounded-hero" />
      <div className="az-skeleton mt-8 h-[60px] rounded-tile" />
      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <GCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
