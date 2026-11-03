"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";
import { categoryPills, collectionHref } from "@/lib/routes";

/** Swipeable sofa-category row for phones (desktop already has the header pills). */
export function CategoryChips({ className }: { className?: string }) {
  const t = useT();
  const path = usePathname();
  const items = [{ key: "listing.allCategories", href: collectionHref("all") }, ...categoryPills];
  return (
    <nav aria-label={t("header.categories")} className={clsx("-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden", className)}>
      <div className="flex w-max gap-2">
        {items.map((item) => {
          const active = path === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "inline-flex h-9 flex-none items-center whitespace-nowrap rounded-full border px-4 text-[13px]",
                active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink2",
              )}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
