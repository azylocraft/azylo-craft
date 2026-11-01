import type { EmailOtpType } from "@supabase/supabase-js";
import { requestOrigin } from "@/lib/request-origin";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Email links (sign-up confirmation, password reset) land here with a token_hash.
 * Verifying it on the server signs the user in with cookies, so the link works
 * in any browser or device — not only the one that started the sign-up.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = url.searchParams.get("next") ?? "/account";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  if (tokenHash && type) {
    const sb = await supabaseServer();
    const { error } = await sb.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      const dest = new URL(safeNext, requestOrigin(request));
      if (type === "signup" || type === "email") dest.searchParams.set("welcome", "1");
      return NextResponse.redirect(dest);
    }
  }
  return NextResponse.redirect(new URL("/auth/login?error=link", requestOrigin(request)));
}
