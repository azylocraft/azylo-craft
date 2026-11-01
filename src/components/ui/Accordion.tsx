"use client";

import clsx from "clsx";
import { Minus, Plus } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

/** Numbered or plain accordion row with a circled +/− toggle. */
export function AccordionRow({
  title,
  number,
  children,
  defaultOpen,
  id,
  open: controlled,
  onToggle,
  size = "lg",
}: {
  title: ReactNode;
  number?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  id?: string;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  size?: "lg" | "sm";
}) {
  const [local, setLocal] = useState(!!defaultOpen);
  const open = controlled ?? local;
  const panelId = useId();
  const toggle = () => {
    onToggle?.(!open);
    if (controlled === undefined) setLocal(!open);
  };
  return (
    <div id={id} className="scroll-mt-40 border-b border-line">
      <h3>
        <button type="button" aria-expanded={open} aria-controls={panelId} onClick={toggle} className={clsx("flex w-full items-center gap-4 text-left", size === "lg" ? "py-6" : "py-4")}>
          {number && <span className="font-mono text-xs text-gold">{number}</span>}
          <span className={clsx("flex-1 font-extrabold tracking-[-0.01em]", size === "lg" ? "text-lg md:text-xl" : "text-[15px]")}>{title}</span>
          <span className={clsx("flex flex-none items-center justify-center rounded-full border", size === "lg" ? "size-9" : "size-8", open ? "border-ink bg-ink text-white" : "border-line")}>
            {open ? <Minus size={14} aria-hidden /> : <Plus size={14} aria-hidden />}
          </span>
        </button>
      </h3>
      <div id={panelId} hidden={!open} className={size === "lg" ? "pb-7" : "pb-5"}>
        {children}
      </div>
    </div>
  );
}
