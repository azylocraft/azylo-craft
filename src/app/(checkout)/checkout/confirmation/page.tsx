import type { Metadata } from "next";
import { Suspense } from "react";
import { Confirmation } from "@/components/checkout/Confirmation";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default function ConfirmationPage() {
  return (
    <Suspense>
      <Confirmation />
    </Suspense>
  );
}
