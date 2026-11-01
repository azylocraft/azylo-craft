"use client";

import { useState } from "react";
import { Eye, PencilLine, Wand2 } from "lucide-react";
import { Markdown } from "@/components/ui/Markdown";
import { plainToMarkdown } from "@/lib/plain-to-markdown";

/**
 * Markdown textarea for admin content with two helpers:
 * "Format pasted text" turns plain pasted text into headings, lists and bold labels,
 * and "Preview" shows it exactly as the storefront will render it.
 */
export function MarkdownField({
  label,
  value,
  onChange,
  hint,
  dropTitle,
  rows = 10,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  dropTitle?: string;
  rows?: number;
}) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-ink2">{label}</span>
        <span className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onChange(plainToMarkdown(value, { dropTitle }))}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-xs font-bold hover:border-ink"
          >
            <Wand2 size={13} aria-hidden /> Format pasted text
          </button>
          <button
            type="button"
            aria-pressed={preview}
            onClick={() => setPreview(!preview)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-xs font-bold hover:border-ink"
          >
            {preview ? <PencilLine size={13} aria-hidden /> : <Eye size={13} aria-hidden />} {preview ? "Edit" : "Preview"}
          </button>
        </span>
      </div>
      {preview ? (
        <div className="max-h-[520px] overflow-y-auto rounded-field border border-line bg-white p-5">
          <Markdown source={value} field={label} />
        </div>
      ) : (
        <textarea className="field resize-y font-mono text-[13px]" style={{ height: rows * 22 }} value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} />
      )}
      <span className="text-[11px] text-faint">
        {hint ?? "Paste plain text and press “Format pasted text”, or write Markdown: ## heading, - bullet, **bold**, > highlighted note."}
      </span>
    </div>
  );
}
