import clsx from "clsx";

/**
 * Product/editorial image. Without a real URL it renders the design's tonal
 * placeholder (tone + mono label) so layouts keep their rhythm until photos arrive.
 */
export function Media({
  src,
  alt,
  tone = "#E4DACA",
  label,
  className,
  dark,
  eager,
  fit = "cover",
  children,
}: {
  src?: string | null;
  alt: string;
  tone?: string | null;
  label?: string;
  className?: string;
  dark?: boolean;
  eager?: boolean;
  /** "contain" shows the whole image (letterboxed) instead of cropping it to fill the box. */
  fit?: "cover" | "contain";
  children?: React.ReactNode;
}) {
  return (
    <div className={clsx("relative overflow-hidden", className)}>
      {src ? (
        <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" className={clsx("absolute inset-0 size-full", fit === "contain" ? "object-contain" : "object-cover")} />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${tone ?? "#E4DACA"} 0 64%, color-mix(in oklab, ${tone ?? "#E4DACA"} 86%, #000) 64% 100%)`,
          }}
        >
          {label && (
            <span
              className={clsx(
                "absolute bottom-2.5 left-3 font-mono text-[10px] uppercase tracking-[.06em]",
                dark ? "text-white/70" : "text-ink/45",
              )}
            >
              {label}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
