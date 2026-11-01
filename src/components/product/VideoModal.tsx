"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Overlay } from "@/components/shop/Overlay";
import type { ProductVideo } from "@/lib/types";

/** 9:16 player: autoplays muted, loops, native controls; pauses and resets on close. */
export function VideoModal({ videos, onClose }: { videos: ProductVideo[]; onClose: () => void }) {
  const [i, setI] = useState(0);
  const ref = useRef<HTMLVideoElement>(null);
  const v = videos[i];

  useEffect(() => {
    const el = ref.current;
    return () => {
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
    };
  }, [i]);

  return (
    <Overlay onClose={onClose} label="Product video" blur className="!bg-[rgba(20,19,17,.5)]">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-0 md:p-6">
        <div className="pointer-events-auto relative h-full w-full overflow-hidden bg-black md:h-[min(86vh,820px)] md:w-auto md:rounded-block md:[aspect-ratio:9/16]">
          <video
            key={v.id}
            ref={ref}
            src={v.url}
            poster={v.poster ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            controls
            className="size-full object-contain"
          />
          <button type="button" aria-label="Close video" onClick={onClose} data-autofocus className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-white text-ink">
            <X size={18} aria-hidden />
          </button>
          {videos.length > 1 && (
            <>
              <button type="button" aria-label="Previous video" onClick={() => setI((i - 1 + videos.length) % videos.length)} className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink">
                <ChevronLeft size={18} aria-hidden />
              </button>
              <button type="button" aria-label="Next video" onClick={() => setI((i + 1) % videos.length)} className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink">
                <ChevronRight size={18} aria-hidden />
              </button>
            </>
          )}
        </div>
      </div>
    </Overlay>
  );
}
