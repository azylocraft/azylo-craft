import { CartDrawer } from "@/components/shop/CartDrawer";
import { ChatPill } from "@/components/shop/ChatPill";
import { AppStrip, Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { ShopProvider } from "@/components/shop/ShopContext";
import { WishDrawer } from "@/components/shop/WishDrawer";
import { Toast } from "@/components/shop/Toast";
import { SearchOverlay } from "@/components/shop/SearchOverlay";
import { Reveal } from "@/components/shop/Reveal";
import { AccountDrawer } from "@/components/account/AccountDrawer";
import { CampaignBar, EmailPopup } from "@/components/shop/Campaign";
import { getRates, getStoreSettings } from "@/lib/catalog";

export const revalidate = 60;

/** Storefront shell: sticky header, drawers, app strip + footer, floating chat pill. */
export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const [rates, settings] = await Promise.all([getRates(), getStoreSettings()]);
  return (
    <ShopProvider rates={rates} settings={settings}>
      <CampaignBar />
      <Header />
      <main className="flex-1">{children}</main>
      <AppStrip />
      <Footer
        year={new Date().getFullYear()}
        contact={{
          email: settings.email ?? undefined,
          phone: settings.phone ?? undefined,
          address: settings.address ?? undefined,
        }}
      />
      <ChatPill />
      <CartDrawer />
      <Toast />
      <SearchOverlay />
      <WishDrawer />
      <AccountDrawer />
      <EmailPopup />
      <Reveal />
    </ShopProvider>
  );
}
