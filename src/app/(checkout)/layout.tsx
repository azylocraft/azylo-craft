import Link from "next/link";
import { Lock, ShoppingBag } from "lucide-react";
import { AuthBoot } from "@/components/account/AuthBoot";
import { ShopProvider } from "@/components/shop/ShopContext";
import { Logo } from "@/components/ui/primitives";
import { getRates, getStoreSettings } from "@/lib/catalog";

export const revalidate = 60;

/** Checkout shell: simple header with logo and bag icon (design screens 39–44). */
export default async function CheckoutLayout({ children }: LayoutProps<"/">) {
  const [rates, settings] = await Promise.all([getRates(), getStoreSettings()]);
  return (
    <ShopProvider rates={rates} settings={settings}>
      <AuthBoot />
      <header className="flex h-16 items-center justify-between border-b border-line bg-white px-4 md:h-[76px] md:px-12">
        <Link href="/" aria-label="AZYLO home">
          <Logo />
        </Link>
        <span className="flex items-center gap-4">
          <span className="hidden items-center gap-1.5 text-xs font-bold text-green sm:flex">
            <Lock size={14} aria-hidden /> Secure checkout
          </span>
          <Link href="/cart" aria-label="Back to cart">
            <ShoppingBag size={20} aria-hidden />
          </Link>
        </span>
      </header>
      <main className="flex-1 bg-bg">{children}</main>
    </ShopProvider>
  );
}
