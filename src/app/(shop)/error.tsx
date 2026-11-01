"use client";

import { SystemScreen } from "@/components/pages/SystemScreen";

export default function ShopError({ reset }: { error: Error; reset: () => void }) {
  return <SystemScreen kind="error" onRetry={reset} />;
}
