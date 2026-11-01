import clsx from "clsx";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Missing } from "@/components/ui/primitives";

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Renders admin-authored markdown. `MISSING: …` lines become visible placeholders. */
export function Markdown({ source, field, className }: { source: string | null | undefined; field: string; className?: string }) {
  if (!source || !source.trim()) return <Missing field={field} />;
  if (/^MISSING:/i.test(source.trim())) return <Missing field={source.trim().replace(/^MISSING:\s*/i, "")} />;
  return (
    <div className={clsx("az-prose", className)}>
      <ReactMarkdown
        components={{
          h2: ({ children }) => <h2 id={slugify(String(children))}>{children}</h2>,
          a: ({ href = "", children }) =>
            href.startsWith("/") ? (
              <Link href={href}>{children}</Link>
            ) : (
              <a href={href} target="_blank" rel="noreferrer">
                {children}
              </a>
            ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
