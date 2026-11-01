import ShopLayout from "@/app/(shop)/layout";
import { SystemScreen } from "@/components/pages/SystemScreen";

/** Unknown URLs render the design's 404 inside the storefront shell. */
export default async function RootNotFound() {
  return (
    <ShopLayout params={Promise.resolve({})}>
      <SystemScreen kind="notFound" />
    </ShopLayout>
  );
}
