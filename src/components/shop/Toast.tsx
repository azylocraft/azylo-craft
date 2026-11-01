"use client";

import { Check } from "lucide-react";
import { useUi } from "@/lib/ui-store";

export function Toast() {
  const toast = useUi((s) => s.toast);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex justify-center px-4">
      {toast && (
        <span className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white shadow-float">
          <Check size={16} className="text-gold-line" aria-hidden />
          {toast}
        </span>
      )}
    </div>
  );
}
