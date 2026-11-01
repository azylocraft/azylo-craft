"use client";

import clsx from "clsx";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Media } from "@/components/shop/Media";
import { Overlay } from "@/components/shop/Overlay";
import { useText } from "@/components/shop/ShopContext";
import type { ProductImage } from "@/lib/types";

const TONES = ["#E7DFD1", "#DCD0BE", "#CDBEA6", "#E2D7C4", "#D3C2AB"];

/** Main image + thumbnails, arrows, swipe, click-to-zoom lightbox. */
export function Gallery({ images, tone, name }: { images: ProductImage[]; tone: string | null; name: string }) {
  const text = useText();
  const slides = images.length ? images : null;
  const count = slides?.length ?? 5;
  const [ref, api] = useEmblaCarousel({ loop: false });
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setIndex(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const go = useCallback((i: number) => api?.scrollTo(i), [api]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-block bg-white">
        <div ref={ref} className="overflow-hidden">
          <div className="flex touch-pan-y">
            {Array.from({ length: count }, (_, i) => (
              <button key={i} type="button" onClick={() => setZoom(i)} className="relative min-w-0 flex-[0_0_100%] cursor-zoom-in" aria-label={`Zoom image ${i + 1}`}>
                <Media
                  src={slides?.[i]?.url}
                  alt={slides ? text(slides[i].alt, "image alt") : `${name} — photo ${i + 1}`}
                  tone={slides ? undefined : i === 0 ? tone : TONES[i % TONES.length]}
                  label={slides ? undefined : `product photo ${i + 1} / ${count}`}
                  eager={i === 0}
                  className="aspect-[4/3.4] w-full"
                />
              </button>
            ))}
          </div>
        </div>
        <span className="pointer-events-none absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/90">
          <Expand size={15} aria-hidden />
        </span>
        {count > 1 && (
          <>
            <button type="button" aria-label="Previous image" onClick={() => api?.scrollPrev()} disabled={index === 0} className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 shadow-soft disabled:opacity-40">
              <ChevronLeft size={18} aria-hidden />
            </button>
            <button type="button" aria-label="Next image" onClick={() => api?.scrollNext()} disabled={index === count - 1} className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 shadow-soft disabled:opacity-40">
              <ChevronRight size={18} aria-hidden />
            </button>
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 md:hidden">
              {Array.from({ length: count }, (_, i) => (
                <span key={i} className={clsx("h-1.5 rounded-full transition-all", i === index ? "w-[18px] bg-ink" : "w-1.5 bg-black/25")} />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="hidden gap-2.5 overflow-x-auto md:flex">
        {Array.from({ length: count }, (_, i) => (
          <button key={i} type="button" aria-label={`Show image ${i + 1}`} aria-current={i === index} onClick={() => go(i)} className={clsx("flex-none overflow-hidden rounded-xl border-2", i === index ? "border-ink" : "border-transparent")}>
            <Media src={slides?.[i]?.url} alt="" tone={slides ? undefined : i === 0 ? tone : TONES[i % TONES.length]} className="h-[72px] w-[88px]" />
          </button>
        ))}
      </div>
      {zoom != null && <Lightbox urls={slides?.map((s) => s.url) ?? []} tones={Array.from({ length: count }, (_, i) => (i === 0 ? tone : TONES[i % TONES.length]))} start={zoom} onClose={() => setZoom(null)} label={name} />}
    </div>
  );
}

/** Full-screen viewer with arrows, counter and swipe. */
export function Lightbox({ urls, tones, start, onClose, label }: { urls: string[]; tones?: (string | null)[]; start: number; onClose: () => void; label: string }) {
  const count = urls.length || tones?.length || 1;
  const [ref, api] = useEmblaCarousel({ startIndex: start });
  const [index, setIndex] = useState(start);
  useEffect(() => {
    if (!api) return;
    const onSelect = () => setIndex(api.selectedScrollSnap());
    api.on("select", onSelect);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") api.scrollNext();
      if (e.key === "ArrowLeft") api.scrollPrev();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      api.off("select", onSelect);
      document.removeEventListener("keydown", onKey);
    };
  }, [api]);
  return (
    <Overlay onClose={onClose} label={label} className="!bg-[rgba(20,19,17,.88)]">
      <div className="absolute inset-0 flex flex-col">
        <div className="flex items-center justify-between p-4 text-white md:p-6">
          <span className="text-sm font-bold" aria-live="polite">
            {index + 1} / {count}
          </span>
          <button type="button" aria-label="Close" onClick={onClose} data-autofocus className="flex size-11 items-center justify-center rounded-full bg-white text-ink">
            <X size={18} aria-hidden />
          </button>
        </div>
        <div ref={ref} className="flex-1 overflow-hidden" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
          <div className="flex h-full touch-pan-y">
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="flex min-w-0 flex-[0_0_100%] items-center justify-center px-4 md:px-20">
                {urls[i] ? (
                  <img src={urls[i]} alt={`${label} ${i + 1}`} className="max-h-[80vh] max-w-full rounded-tile object-contain" />
                ) : (
                  <Media alt={`${label} ${i + 1}`} tone={tones?.[i]} label={`photo ${i + 1}`} className="aspect-[4/3] w-full max-w-[900px] rounded-tile" />
                )}
              </div>
            ))}
          </div>
        </div>
        {count > 1 && (
          <div className="flex justify-center gap-3 p-6">
            <button type="button" aria-label="Previous" onClick={() => api?.scrollPrev()} className="flex size-12 items-center justify-center rounded-full bg-white text-ink">
              <ChevronLeft size={20} aria-hidden />
            </button>
            <button type="button" aria-label="Next" onClick={() => api?.scrollNext()} className="flex size-12 items-center justify-center rounded-full bg-white text-ink">
              <ChevronRight size={20} aria-hidden />
            </button>
          </div>
        )}
      </div>
    </Overlay>
  );
}
