"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, FileText, HelpCircle, Inbox, LayoutGrid, Package, Settings, ShoppingBag, Star } from "lucide-react";
import { Logo } from "@/components/ui/primitives";

const NAV = [
  ["/admin", "Products", Package],
  ["/admin/collections", "Collections", LayoutGrid],
  ["/admin/orders", "Orders", ShoppingBag],
  ["/admin/reviews", "Reviews", Star],
  ["/admin/faqs", "FAQs", HelpCircle],
  ["/admin/pages", "Pages", FileText],
  ["/admin/inbox", "Inbox", Inbox],
  ["/admin/settings", "Settings", Settings],
] as const;

/** Admin chrome (design screens 85–89): dark sidebar, cream workspace. */
export function AdminShell({ name, children }: { name: string; children: React.ReactNode }) {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === "/admin" || path.startsWith("/admin/products") : path.startsWith(href));
  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="flex items-center gap-4 overflow-x-auto bg-dark px-4 py-3 text-white lg:sticky lg:top-0 lg:h-screen lg:flex-col lg:items-stretch lg:gap-1 lg:px-4 lg:py-6">
        <Link href="/admin" className="flex-none lg:mb-6 lg:px-3">
          <Logo light size={16} />
          <span className="ml-2 text-[10px] font-bold uppercase tracking-[.16em] text-gold-line">Admin</span>
        </Link>
        {NAV.map(([href, label, Icon]) => (
          <Link key={href} href={href} className={clsx("flex h-10 flex-none items-center gap-3 rounded-xl px-3 text-sm font-bold", active(href) ? "bg-white/10 text-white" : "text-on-dark-muted hover:text-white")}>
            <Icon size={16} aria-hidden />
            {label}
          </Link>
        ))}
        <span className="hidden flex-1 lg:block" />
        <Link href="/" target="_blank" className="flex h-10 flex-none items-center gap-3 rounded-xl px-3 text-sm text-on-dark-muted hover:text-white">
          <ExternalLink size={16} aria-hidden />
          View store
        </Link>
        <span className="hidden px-3 text-xs text-on-dark-faint lg:block">Signed in as {name}</span>
      </aside>
      <main className="min-w-0 px-4 py-6 md:px-10 md:py-10">{children}</main>
    </div>
  );
}

export function AdminTitle({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="text-[30px] font-extrabold tracking-[-0.03em]">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, children, actions, className }: { title?: string; children: React.ReactNode; actions?: React.ReactNode; className?: string }) {
  return (
    <section className={clsx("rounded-block border border-line2 bg-white p-5 shadow-card md:p-6", className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-extrabold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
