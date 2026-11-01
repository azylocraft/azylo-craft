import type { NextRequest } from "next/server";

/**
 * The origin the browser actually used (from the Host / X-Forwarded-* headers).
 * `request.nextUrl.origin` can be the dev server's bind address (0.0.0.0),
 * which browsers can't open, so redirects must be built from this instead.
 */
export function requestOrigin(request: NextRequest): string {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  if (host) return `${proto}://${host}`.replace("//0.0.0.0", "//localhost");
  return request.nextUrl.origin.replace("//0.0.0.0", "//localhost");
}
