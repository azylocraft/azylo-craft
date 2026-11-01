"use client";

import type { ReactNode } from "react";

/**
 * White "studio" hero (Mogg / Múse style): a large centred title with the furniture cut-out
 * floating below it over a soft floor shadow, and a slow olive glow drifting behind.
 * `cutout` should be a transparent image (studio/<name>-cut.webp); `fallback` is used otherwise.
 */
export function StudioHero({
  eyebrow,
  title,
  cutout,
  fallback,
  alt,
  children,
  dark,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  cutout?: string | null;
  fallback?: string | null;
  alt: string;
  children?: ReactNode;
  dark?: boolean;
}) {
  const src = cutout ?? fallback;
  return (
    <section className="px-4 pt-4 md:px-12 md:pt-6">
      <div className={`relative isolate overflow-hidden rounded-block px-5 pb-10 pt-10 text-center md:rounded-hero md:px-12 md:pb-14 md:pt-16 ${dark ? "bg-dark text-white" : "border border-line2 bg-white"}`}>
        <div aria-hidden className="az-drift pointer-events-none absolute left-1/2 top-[38%] -z-10 size-[70vw] max-h-[720px] max-w-[720px] rounded-full bg-gold-soft opacity-80 blur-3xl" />
        {eyebrow && <div className="az-fade-up flex justify-center">{eyebrow}</div>}
        <h1 className="mx-auto mt-4 max-w-[1100px] text-balance text-[40px] font-[800] leading-[0.98] tracking-[-0.05em] md:text-[64px] xl:text-[84px]">{title}</h1>

        <div className="relative mx-auto mt-6 h-[200px] w-full max-w-[640px] md:h-[300px]">
          <div aria-hidden className="absolute bottom-[4%] left-1/2 h-7 w-[64%] -translate-x-1/2">
            <div className="az-floor size-full rounded-[50%] bg-black/25 blur-xl" />
          </div>
          {src && (
            <div className="az-settle absolute inset-0" style={{ ["--d" as string]: "250ms" }}>
              <img src={src} alt={alt} loading="eager" className={`az-float size-full object-contain ${cutout ? "" : "mix-blend-multiply"}`} />
            </div>
          )}
        </div>

        <div className="az-fade-up relative mx-auto mt-4 flex max-w-[620px] flex-col items-center gap-5" style={{ ["--d" as string]: "450ms" }}>
          {children}
        </div>
      </div>
    </section>
  );
}

/** studio/p000.webp → studio/p000-cut.webp (the transparent version uploaded alongside). */
export function cutoutOf(url: string | null | undefined) {
  return url && /\/studio\/[^/]+\.webp$/.test(url) ? url.replace(/\.webp$/, "-cut.webp") : null;
}
