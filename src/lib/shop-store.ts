"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartLine = {
  variantId: string;
  productId: string;
  quantity: number;
  customColor?: boolean;
  /** Key of the free gift chosen with this piece (see store_settings.free_gifts). */
  gift?: string;
  /** The 2 gifts won on the gift wheel, included with this piece. */
  gifts?: string[];
  /** Customisation details the customer typed on the product page. */
  note?: string;
};

type ShopState = {
  cart: CartLine[];
  wishlist: string[];
  note: string;
  discountCode: string | null;
  recentlyViewed: string[];
  /** Gift keys won on the gift wheel (2 once complete). */
  wonGifts: string[];
  setWonGifts: (keys: string[]) => void;
  setNote: (note: string) => void;
  setDiscountCode: (code: string | null) => void;
  addRecentlyViewed: (productId: string) => void;
  clearCart: () => void;
  addToCart: (line: CartLine) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  removeLine: (variantId: string) => void;
  toggleWishlist: (productId: string) => void;
};

/**
 * Guest cart + wishlist saved on this device. Phase 5 adds Supabase sync and the
 * merge-on-login; the header badges read from here so they update instantly.
 */
export const useShop = create<ShopState>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      note: "",
      discountCode: null,
      recentlyViewed: [],
      wonGifts: [],
      setWonGifts: (wonGifts) => set({ wonGifts: wonGifts.slice(0, 2) }),
      setNote: (note) => set({ note }),
      setDiscountCode: (discountCode) => set({ discountCode }),
      addRecentlyViewed: (id) => set((s) => ({ recentlyViewed: [id, ...s.recentlyViewed.filter((x) => x !== id)].slice(0, 12) })),
      clearCart: () => set({ cart: [], note: "", discountCode: null }),
      addToCart: (line) =>
        set((s) => {
          const existing = s.cart.find((l) => l.variantId === line.variantId);
          if (!existing) return { cart: [...s.cart, line] };
          return {
            cart: s.cart.map((l) =>
              l.variantId === line.variantId ? { ...l, quantity: Math.min(10, l.quantity + line.quantity), note: line.note || l.note } : l,
            ),
          };
        }),
      setQuantity: (variantId, quantity) =>
        set((s) => ({
          cart: s.cart.map((l) => (l.variantId === variantId ? { ...l, quantity: Math.max(1, Math.min(10, quantity)) } : l)),
        })),
      removeLine: (variantId) => set((s) => ({ cart: s.cart.filter((l) => l.variantId !== variantId) })),
      toggleWishlist: (productId) =>
        set((s) => {
          const saved = !s.wishlist.includes(productId);
          // Synced to the account when signed in (lazy import avoids a module cycle).
          import("@/lib/auth").then((m) => m.persistWishlistToggle(productId, saved));
          return { wishlist: saved ? [...s.wishlist, productId] : s.wishlist.filter((id) => id !== productId) };
        }),
    }),
    { name: "azylo-shop", storage: createJSONStorage(() => localStorage) },
  ),
);

export const useCartCount = () => useShop((s) => s.cart.reduce((n, l) => n + l.quantity, 0));
export const useWishCount = () => useShop((s) => s.wishlist.length);
