"use client";

import clsx from "clsx";
import { useEffect, useRef, type ReactNode } from "react";

/** Dimmed full-screen layer that locks scroll, closes on Esc / backdrop click and traps initial focus. */
export function Overlay({
  onClose,
  children,
  label,
  className,
  blur,
}: {
  onClose: () => void;
  children: ReactNode;
  label: string;
  className?: string;
  blur?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLElement>("[data-autofocus], button, a, input, textarea")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div
      className={clsx("fixed inset-0 z-[60] bg-[rgba(20,19,17,.38)]", blur && "backdrop-blur-sm", className)}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div ref={ref} role="dialog" aria-modal="true" aria-label={label} className="contents">
        {children}
      </div>
    </div>
  );
}

export function DrawerPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        "absolute inset-x-0 bottom-0 top-[70px] flex flex-col rounded-t-[26px] bg-bg2 text-ink shadow-float sm:inset-y-0 sm:left-auto sm:right-0 sm:top-0 sm:w-[460px] sm:rounded-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Modal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
      <div className={clsx("pointer-events-auto w-full max-w-[520px] rounded-modal bg-white p-7 text-ink shadow-float md:p-9", className)}>{children}</div>
    </div>
  );
}
