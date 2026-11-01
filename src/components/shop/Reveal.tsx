"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const TARGETS = "main section, main [data-reveal]";
const FRAMES: Keyframe[] = [
  { opacity: 0, transform: "translateY(36px)" },
  { opacity: 1, transform: "none" },
];

/**
 * Fades sections up as they scroll into view. Uses the Web Animations API (no class or
 * attribute changes), so streamed sections still hydrate cleanly. Only sections that start
 * below the fold are animated, and pages render fully without JS.
 */
export function Reveal() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const seen = new WeakSet<Element>();
    const pending = new Map<Element, Animation>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          pending.get(e.target)?.play();
          pending.delete(e.target);
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scan = () => {
      document.querySelectorAll(TARGETS).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if ([...pending.keys()].some((p) => p.contains(el))) return;
        if (el.getBoundingClientRect().top < innerHeight * 0.92) return;
        const anim = el.animate(FRAMES, { duration: 900, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" });
        anim.pause();
        pending.set(el, anim);
        io.observe(el);
      });
    };
    scan();
    const mo = new MutationObserver(scan);
    const main = document.querySelector("main");
    if (main) mo.observe(main, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      pending.forEach((a) => a.cancel());
    };
  }, [pathname]);
  return null;
}
