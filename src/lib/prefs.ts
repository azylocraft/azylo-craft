"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const LANGS = ["en", "fr"] as const;
export type Lang = (typeof LANGS)[number];

export const CURRENCIES = ["CAD", "USD", "EUR", "GBP", "AUD"] as const;
export type Currency = (typeof CURRENCIES)[number];

type PrefsState = {
  lang: Lang;
  currency: Currency;
  setLang: (lang: Lang) => void;
  setCurrency: (currency: Currency) => void;
};

/** Language + currency, saved on this device. Synced to the profile once auth lands. */
export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      lang: "en",
      currency: "CAD",
      setLang: (lang) => {
        if (typeof document !== "undefined") document.documentElement.lang = lang;
        set({ lang });
      },
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "azylo-prefs",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== "undefined") document.documentElement.lang = state.lang;
      },
    },
  ),
);
