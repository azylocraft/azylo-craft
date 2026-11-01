import clsx from "clsx";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

/* Typography ------------------------------------------------------------ */

export function Serif({ children, gold, className }: { children: ReactNode; gold?: boolean; className?: string }) {
  return (
    <span className={clsx("az-accent", gold && "text-gold", className)}>
      {children}
    </span>
  );
}

export function Eyebrow({
  children,
  line = true,
  center,
  className,
}: {
  children: ReactNode;
  line?: boolean;
  center?: boolean;
  className?: string;
}) {
  return (
    <div
      data-n={line ? "" : undefined}
      className={clsx("az-eb flex items-center gap-[0.45em] text-[12.5px] font-normal lowercase tracking-normal text-muted", center && "justify-center", className)}
    >
      {children}
    </div>
  );
}

type HeadingTag = "h1" | "h2" | "h3" | "div";
export function H({ as: Tag = "h2", children, className }: { as?: HeadingTag; children: ReactNode; className?: string }) {
  return (
    <Tag className={clsx("az-h text-balance font-[800] leading-[1.04] tracking-[-0.04em]", className)}>{children}</Tag>
  );
}

export function P({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={clsx("m-0 text-pretty text-[15px] leading-[1.65] text-muted", className)}>{children}</p>;
}

/* Buttons --------------------------------------------------------------- */

export type BtnKind = "dark" | "outline" | "light" | "gold" | "ghostW" | "white";
export type BtnSize = "sm" | "md" | "lg";

const btnKinds: Record<BtnKind, string> = {
  dark: "bg-ink text-white border-ink hover:bg-ink2",
  outline: "bg-transparent text-ink border-ink hover:bg-ink hover:text-white",
  light: "bg-white text-ink border-line hover:border-ink",
  gold: "bg-gold text-white border-gold hover:brightness-110",
  ghostW: "bg-transparent text-white border-white/50 hover:border-white hover:bg-white/10",
  white: "bg-white text-ink border-white hover:bg-bg2",
};
const btnSizes: Record<BtnSize, string> = {
  sm: "h-9 px-4 text-[12.5px]",
  md: "h-[44px] px-[24px] text-[13.5px]",
  lg: "h-[52px] px-[26px] text-[14px]",
};

export function btnClass(kind: BtnKind = "dark", size: BtnSize = "md", full?: boolean) {
  return clsx(
    "az-btn inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full border font-medium transition-[background-color,color,border-color,transform] duration-300 active:scale-[.98]",
    "disabled:cursor-not-allowed disabled:border-line disabled:bg-line2 disabled:text-faint",
    btnKinds[kind],
    btnSizes[size],
    full && "w-full",
  );
}

type BtnOwn = { kind?: BtnKind; size?: BtnSize; full?: boolean; icon?: LucideIcon; iconL?: LucideIcon };

/** Trailing arrow in a ringed circle at the pill's right edge (the "to gallery ↗" button). */
const arrowEdge: Record<BtnSize, string> = { sm: "-mr-[13px]", md: "-mr-[21px]", lg: "-mr-[23px]" };

export function BtnArrow({ Icon, size = "md" }: { Icon: LucideIcon; size?: BtnSize }) {
  return (
    <span aria-hidden className={clsx("az-btn-ic flex aspect-square h-[calc(100%-6px)] flex-none items-center justify-center rounded-full border-[1.5px] border-current", arrowEdge[size])}>
      <Icon size={15} />
    </span>
  );
}

/** The kit draws "arrow-right" button icons as ↗. */
const arrowIcon = (Icon: LucideIcon) => (Icon === ArrowRight ? ArrowUpRight : Icon);

export function Btn({ kind, size, full, icon: Icon, iconL: IconL, className, children, ...rest }: BtnOwn & ComponentProps<"button">) {
  return (
    <button type="button" className={clsx(btnClass(kind, size, full), className)} {...rest}>
      {IconL && <IconL size={16} aria-hidden />}
      {children}
      {Icon && <BtnArrow Icon={arrowIcon(Icon)} size={size} />}
    </button>
  );
}

export function BtnLink({ kind, size, full, icon: Icon, iconL: IconL, className, children, ...rest }: BtnOwn & ComponentProps<typeof Link>) {
  return (
    <Link className={clsx(btnClass(kind, size, full), className)} {...rest}>
      {IconL && <IconL size={16} aria-hidden />}
      {children}
      {Icon && <BtnArrow Icon={arrowIcon(Icon)} size={size} />}
    </Link>
  );
}

/* Small pieces ---------------------------------------------------------- */

export function Chip({ children, active, dot, className }: { children: ReactNode; active?: boolean; dot?: boolean; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] border-ink px-4 text-[12.5px] font-medium lowercase",
        active ? "bg-ink text-white" : "bg-white text-ink",
        className,
      )}
    >
      {dot && <span aria-hidden className="size-[5px] rounded-full bg-gold" />}
      {children}
    </span>
  );
}

export type RoundKind = "outline" | "dark" | "ghost";
const roundKinds: Record<RoundKind, string> = {
  outline: "bg-white text-ink border-line",
  dark: "bg-ink text-white border-ink",
  ghost: "bg-transparent text-faint border-line",
};

export function Round({
  icon: Icon,
  size = 44,
  kind = "outline",
  className,
}: {
  icon: LucideIcon;
  size?: number;
  kind?: RoundKind;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={clsx("inline-flex flex-none items-center justify-center rounded-full border", roundKinds[kind], className)}
    >
      <Icon size={Math.round(size * 0.4)} />
    </span>
  );
}

export type BadgeTone = "gold" | "dark" | "blue" | "green" | "red" | "grey";
const badgeTones: Record<BadgeTone, string> = {
  gold: "bg-gold-soft text-gold",
  dark: "bg-ink text-white",
  blue: "bg-blue text-white",
  green: "bg-green-soft text-green",
  red: "bg-red-soft text-red",
  grey: "bg-line2 text-muted",
};

export function Badge({ children, tone = "gold", className }: { children: ReactNode; tone?: BadgeTone; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[10.5px] font-bold uppercase tracking-[.06em]",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("rounded-block border border-line2 bg-white p-7", className)}>{children}</div>;
}

export function Skel({ className }: { className?: string }) {
  return <div aria-hidden className={clsx("az-skeleton h-3.5 rounded-lg", className)} />;
}

export function Divider({ className }: { className?: string }) {
  return <div aria-hidden className={clsx("h-px bg-line", className)} />;
}

/**
 * Wordmark "ΛZYLO": thin geometric capitals drawn as strokes (the A has no crossbar),
 * matching the logo on the product photography. `size` sets the cap height scale.
 */
export function Logo({ className, light, size = 20 }: { className?: string; light?: boolean; size?: number }) {
  const h = Math.round(size * 1.05);
  return (
    <svg
      role="img"
      aria-label="AZYLO"
      viewBox="0 0 344 64"
      height={h}
      width={Math.round((h * 344) / 64)}
      className={clsx("az-logo inline-block flex-none", light ? "text-white" : "text-ink", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={7}
      strokeLinejoin="miter"
      strokeMiterlimit={10}
    >
      <path pathLength={1} d="M2 62 L30 2 L58 62" />
      <path pathLength={1} d="M80 5 H128 L80 59 H130" />
      <path pathLength={1} d="M150 2 L176 33 L202 2 M176 33 V62" />
      <path pathLength={1} d="M227 2 V59 H262" />
      <circle pathLength={1} cx={312} cy={32} r={27} />
    </svg>
  );
}

/** Visible placeholder for any missing data, text or image (global content rule). */
export function Missing({ field, className, block }: { field: string; className?: string; block?: boolean }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md border border-dashed border-red bg-red-soft px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[.04em] text-red",
        block && "flex w-full justify-center",
        className,
      )}
    >
      MISSING: {field}
    </span>
  );
}

/** Image slot that shows a MISSING placeholder until a real image URL exists. */
export function MissingImage({ field, className, dark }: { field: string; className?: string; dark?: boolean }) {
  return (
    <div
      role="img"
      aria-label={`MISSING: ${field}`}
      className={clsx(
        "relative flex items-center justify-center overflow-hidden",
        dark ? "bg-dark2" : "bg-cream",
        className,
      )}
    >
      <Missing field={field} />
    </div>
  );
}
