"use client";

import clsx from "clsx";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

/** Numbered section row (circled number, black chevron toggle) or a plain question row (— / + toggle). */
export function AccordionRow({
  title,
  number,
  children,
  defaultOpen,
  id,
  open: controlled,
  onToggle,
  size = "lg",
  last,
}: {
  title: ReactNode;
  number?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  id?: string;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  size?: "lg" | "sm";
  last?: boolean;
}) {
  const [local, setLocal] = useState(!!defaultOpen);
  const open = controlled ?? local;
  const panelId = useId();
  const toggle = () => {
    onToggle?.(!open);
    if (controlled === undefined) setLocal(!open);
  };
  return (
    <div id={id} className={clsx("scroll-mt-40", !last && "border-b border-line")}>
      <h3>
        <button type="button" aria-expanded={open} aria-controls={panelId} onClick={toggle} className={clsx("flex w-full items-center gap-4 text-left", size === "lg" ? "py-6" : "py-4")}>
          {number && (
            <span className="flex size-10 flex-none items-center justify-center rounded-full border border-gold-line text-[13px] text-gold">{number}</span>
          )}
          <span className={clsx("flex-1 tracking-[-0.01em]", size === "lg" ? "text-[17px] font-[600] md:text-lg" : "text-[15px] font-[600]")}>{title}</span>
          {size === "lg" ? (
            <span className="flex size-8 flex-none items-center justify-center rounded-full bg-ink text-white">
              <ChevronDown size={16} aria-hidden className={clsx("transition-transform duration-300", open && "rotate-180")} />
            </span>
          ) : (
            <span className="flex size-8 flex-none items-center justify-center text-ink2">{open ? <Minus size={16} aria-hidden /> : <Plus size={16} aria-hidden />}</span>
          )}
        </button>
      </h3>
      <div id={panelId} hidden={!open} className={size === "lg" ? (number ? "pb-8 md:pl-14" : "pb-8") : "pb-5"}>
        {children}
      </div>
    </div>
  );
}
