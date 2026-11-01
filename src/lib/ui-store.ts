"use client";

import { create } from "zustand";

type Drawer = "cart" | "wish" | "account" | "search" | null;

type UiState = {
  drawer: Drawer;
  open: (d: Exclude<Drawer, null>) => void;
  close: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
};

export const useUi = create<UiState>((set) => ({
  drawer: null,
  open: (drawer) => set({ drawer }),
  close: () => set({ drawer: null }),
  toast: null,
  showToast: (toast) => {
    set({ toast });
    setTimeout(() => set((s) => (s.toast === toast ? { toast: null } : s)), 2400);
  },
}));
