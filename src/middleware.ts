import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/shared/config/env";

/**
 * Per-request security headers, including Content-Security-Policy.
 *
 * Why middleware (not `next.config.mjs` `async headers()`):
 *   We need a fresh nonce per request so `script-src 'nonce-…' 'strict-dynamic'`
 *   can work in production. Static headers in `next.config.mjs` can't do that.
 *
 * Strategy (see `docs/auth.md` §XSS hardening):
 * - Prod CSP: `script-src 'self' 'nonce-…' 'strict-dynamic'`. Next.js 15 reads
 *   the CSP from the request header we set and auto-applies this nonce to its
 *   own injected scripts, so our app code doesn't have to do anything.
 * - Dev CSP: same, plus `'unsafe-inline' 'unsafe-eval'`. Turbopack's HMR
 *   runtime injects scripts without a nonce; without the escape hatch, dev is
 *   unusable. CSP in dev still protects against the obvious things
 *   (frame-ancestors, object-src, base-uri).
 * - `connect-src` is built from `@/shared/config/env` so the same code works
 *   against any backend host (local, staging, prod) without editing this file.
 *
 * Non-CSP headers (X-Frame-Options, Referrer-Policy, X-Content-Type-Options,
 * Permissions-Policy) are set here too so every response gets them in one place.
 */

const PROD_CSP_SCRIPT_SRC = "'self' 'nonce-NONCE' 'strict-dynamic'";
const DEV_CSP_SCRIPT_SRC = "'self' 'nonce-NONCE' 'unsafe-inline' 'unsafe-eval'";

function buildConnectSrc(): string {
  const sources = new Set<string>([
    "'self'",
    env.apiBaseUrl,
    env.wsBaseUrl,
    "https://*.livekit.cloud",
    "wss://*.livekit.cloud",
  ]);
  return Array.from(sources).join(" ");
}

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== "production";
  const scriptSrc = (isDev ? DEV_CSP_SCRIPT_SRC : PROD_CSP_SCRIPT_SRC).replace(
    "NONCE",
    nonce,
  );

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https:`,
    `media-src 'self' blob: https:`,
    `font-src 'self' data:`,
    `connect-src ${buildConnectSrc()}`,
    `frame-src 'self' https://*.livekit.cloud`,
    `object-src 'none'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(self), microphone=(self), geolocation=(), payment=()",
  );

  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
