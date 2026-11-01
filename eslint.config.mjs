import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Product media is served straight from Supabase Storage with native lazy loading.
    rules: { "@next/next/no-img-element": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Design export kept for reference only.
    "AZYLO website design/**",
    "test-results/**",
    // Deno edge functions are checked by the Supabase CLI, not the Next.js toolchain.
    "supabase/functions/**",
  ]),
]);

export default eslintConfig;
