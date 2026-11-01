"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect } from "react";
import { create } from "zustand";
import { useShop } from "@/lib/shop-store";
import { supabaseBrowser } from "@/lib/supabase/client";

export type Profile = { first_name: string | null; last_name: string | null; role: "customer" | "admin"; marketing_opt_in: boolean };

type AuthState = { user: User | null; profile: Profile | null; ready: boolean; set: (s: Partial<AuthState>) => void };
export const useAuth = create<AuthState>((set) => ({ user: null, profile: null, ready: false, set }));

async function loadProfile(userId: string) {
  const { data } = await supabaseBrowser().from("profiles").select("first_name, last_name, role, marketing_opt_in").eq("id", userId).maybeSingle();
  return (data as Profile | null) ?? null;
}

export async function refreshProfile() {
  const user = useAuth.getState().user;
  if (user) useAuth.getState().set({ profile: await loadProfile(user.id) });
}

/**
 * Keeps the auth store in sync with Supabase and merges the device wishlist
 * into the account on login (quantities/ids are unioned, nothing is lost).
 */
export function useAuthListener() {
  useEffect(() => {
    const sb = supabaseBrowser();
    const apply = async (user: User | null) => {
      useAuth.getState().set({ user, profile: user ? await loadProfile(user.id) : null, ready: true });
      if (user) await syncWishlist(user.id);
    };
    sb.auth.getUser().then(({ data }) => apply(data.user));
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") apply(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
}

async function syncWishlist(userId: string) {
  const sb = supabaseBrowser();
  const local = useShop.getState().wishlist;
  if (local.length) await sb.from("wishlists").upsert(local.map((product_id) => ({ user_id: userId, product_id })), { onConflict: "user_id,product_id" });
  const { data } = await sb.from("wishlists").select("product_id").eq("user_id", userId);
  const remote = (data ?? []).map((r: { product_id: string }) => r.product_id);
  useShop.setState({ wishlist: [...new Set([...local, ...remote])] });
}

/** Mirror a wishlist toggle to the account when signed in. */
export async function persistWishlistToggle(productId: string, saved: boolean) {
  const user = useAuth.getState().user;
  if (!user) return;
  const sb = supabaseBrowser();
  if (saved) await sb.from("wishlists").upsert({ user_id: user.id, product_id: productId });
  else await sb.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
}

export const firstName = (p: Profile | null, u: User | null) => p?.first_name || (u?.email ? u.email.split("@")[0] : "");
