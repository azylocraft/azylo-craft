"use client";

import en from "@/i18n/en.json";
import fr from "@/i18n/fr.json";
import { usePrefs, type Lang } from "@/lib/prefs";

const dictionaries: Record<Lang, unknown> = { en, fr };

function lookup(dict: unknown, key: string): string | undefined {
  let node: unknown = dict;
  for (const part of key.split(".")) {
    if (node && typeof node === "object" && part in node) node = (node as Record<string, unknown>)[part];
    else return undefined;
  }
  return typeof node === "string" ? node : undefined;
}

export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  // English is the primary language; other languages fall back to it.
  const raw = lookup(dictionaries[lang], key) ?? lookup(dictionaries.en, key) ?? `MISSING: ${key}`;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

/** UI strings for the current language (en.json / fr.json). */
export function useT() {
  const lang = usePrefs((s) => s.lang);
  return (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars);
}
