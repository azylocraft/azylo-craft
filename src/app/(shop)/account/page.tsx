import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountPortal } from "@/components/account/AccountPortal";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default function AccountPage() {
  return (
    <Suspense>
      <AccountPortal />
    </Suspense>
  );
}
