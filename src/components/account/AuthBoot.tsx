"use client";

import { useAuthListener } from "@/lib/auth";

/** Starts the auth listener on pages that don't render the account drawer. */
export function AuthBoot() {
  useAuthListener();
  return null;
}
