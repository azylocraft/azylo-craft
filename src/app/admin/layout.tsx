import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · AZYLO Admin" }, robots: { index: false } };

/** Admin-only area: everyone else gets the 404 page (RLS also blocks writes server-side). */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user) notFound();
  const { data: profile } = await sb.from("profiles").select("role, first_name").eq("id", data.user.id).maybeSingle();
  if (profile?.role !== "admin") notFound();
  return <AdminShell name={profile.first_name ?? data.user.email ?? "Admin"}>{children}</AdminShell>;
}
