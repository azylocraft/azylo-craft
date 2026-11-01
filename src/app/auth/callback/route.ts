import { requestOrigin } from "@/lib/request-origin";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/** Email links (confirm sign-up, reset password) land here and exchange the code for a session. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/account";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  if (code) {
    const sb = await supabaseServer();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeNext, requestOrigin(request)));
  }
  return NextResponse.redirect(new URL("/auth/login?error=link", requestOrigin(request)));
}
