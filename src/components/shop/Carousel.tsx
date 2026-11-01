"use client";

import clsx from "clsx";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, useCallback, useEffect, useState, type ReactNode } from "react";

/** Horizontal carousel: prev/next arrows, progress bar, touch swipe (Embla). */
export function Carousel({
  children,
  label,
  controls = "below",
  slideClass = "basis-[78%] sm:basis-[46%] lg:basis-[calc(25%-15px)]",
}: {
  children: ReactNode;
  label: string;
  controls?: "below" | "none";
  slideClass?: string;
}) {
  const [ref, api] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", dragFree: false });
  const [progress, setProgress] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    if (!api) return;
    setProgress(Math.max(0, Math.min(1, api.scrollProgress())));
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    api.on("scroll", sync).on("reInit", sync).on("select", sync);
    queueMicrotask(sync);
    return () => {
      api.off("scroll", sync).off("reInit", sync).off("select", sync);
    };
  }, [api, sync]);

  const slides = Children.toArray(children);
  const visible = 4;
  const thumb = Math.min(1, visible / Math.max(slides.length, 1));

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      <div ref={ref} className="overflow-hidden">
        <div className="-ml-0 flex gap-5 touch-pan-y">
          {slides.map((child, i) => (
            <div key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${slides.length}`} className={clsx("min-w-0 flex-none", slideClass)}>
              {child}
            </div>
          ))}
        </div>
      </div>
      {controls === "below" && slides.length > 1 && (
        <div className="mt-7 flex items-center gap-5">
          <div className="relative h-[3px] flex-1 overflow-hidden rounded bg-line">
            <div
              className="absolute top-0 h-[3px] rounded bg-ink transition-[left] duration-150"
              style={{ width: `${thumb * 100}%`, left: `${progress * (1 - thumb) * 100}%` }}
            />
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              aria-label="Previous"
              disabled={!canPrev}
              onClick={() => api?.scrollPrev()}
              className="flex size-11 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink disabled:bg-transparent disabled:text-faint disabled:hover:border-line"
            >
              <ChevronLeft size={18} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next"
              disabled={!canNext}
              onClick={() => api?.scrollNext()}
              className="flex size-11 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink disabled:bg-transparent disabled:text-faint disabled:hover:border-line"
            >
              <ChevronRight size={18} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
