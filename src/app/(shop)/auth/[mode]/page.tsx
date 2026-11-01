import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AuthForm, type AuthMode } from "@/components/account/AuthForms";

const MODES: Record<AuthMode, string> = {
  login: "Log in",
  "sign-up": "Sign up",
  "forgot-password": "Forgot password",
  "reset-password": "Set new password",
};

export async function generateMetadata({ params }: PageProps<"/auth/[mode]">): Promise<Metadata> {
  const { mode } = await params;
  return { title: MODES[mode as AuthMode] ?? "Account", robots: { index: false } };
}

export default async function AuthPage({ params }: PageProps<"/auth/[mode]">) {
  const { mode } = await params;
  if (!(mode in MODES)) notFound();
  return (
    <Suspense>
      <AuthForm mode={mode as AuthMode} />
    </Suspense>
  );
}
