import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ENTRY_COOKIE = "akshaya_entry";

const ENTRY_DESTINATION: Record<string, string> = {
  restaurant: "/restaurant",
  banquet: "/banquet",
  catering: "/catering",
};

// Known search crawler user agents to serve landing gate directly for indexing
const BOT_USER_AGENTS = /bot|googlebot|crawler|spider|robot|crawling/i;

/** Admin surfaces that require an authenticated session. */
const PROTECTED_PREFIX = "/admin";

/** Paths under /admin that must stay reachable while signed out. */
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/forgot-password", "/admin/reset-password", "/admin/set-password"];

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Middleware responsibilities, in order:
 *
 * 1. AUTH GATE on /admin/* — this is new. Previously this file performed no
 *    authentication at all, so every admin route was reachable by URL and the
 *    only protection was <RoleGate>, a CLIENT component reading Zustand state
 *    that any visitor can set from the browser console.
 *
 *    Scope note: this checks only that a VALID SESSION EXISTS. It deliberately
 *    does not check role, because that would require a profiles lookup on every
 *    request at the edge. Role authorization stays where it can be done once,
 *    with the data in hand: `requireAdminSession([...roles])` inside each admin
 *    Server Component. Middleware narrows the door; the page decides the room.
 *    Neither replaces RLS, which is the actual boundary.
 *
 * 2. Crawlers & search bots receive the landing decision gate directly.
 * 3. Explicit resets (/?reset=true) clear cookie and show the decision gate.
 * 4. Returning users are 302-redirected to their chosen service route,
 *    preserving all incoming query parameters.
 */
export async function middleware(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const { pathname } = request.nextUrl;

  // ─────────────────────────────────────────────────────────────────────────
  // 1. AUTH GATE — /admin/* (runs before everything else)
  // ─────────────────────────────────────────────────────────────────────────
  if (pathname.startsWith(PROTECTED_PREFIX) && !isPublicAdminPath(pathname)) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Deny by default. If auth is not configured we cannot verify anyone, so we
    // must not let the request through — the failure mode of "staff locked out"
    // is strictly better than "everyone admitted".
    if (!url || !anonKey) {
      const denied = new URL("/admin/login", request.url);
      denied.searchParams.set("error", "auth-unavailable");
      const res = NextResponse.redirect(denied, 302);
      res.headers.set("x-request-id", requestId);
      return res;
    }

    let response = NextResponse.next({ request: { headers: requestHeaders } });

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // getUser() revalidates the JWT against the auth server.
    // getSession() would trust a cookie the browser can forge — do not swap it.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      // Same-origin relative path only — never echo an absolute URL back into
      // a redirect param, which is how open-redirects get built.
      loginUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);
      const res = NextResponse.redirect(loginUrl, 302);
      res.headers.set("x-request-id", requestId);
      return res;
    }

    response.headers.set("x-request-id", requestId);
    return response;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Crawlers
  // ─────────────────────────────────────────────────────────────────────────
  const userAgent = request.headers.get("user-agent") || "";

  if (BOT_USER_AGENTS.test(userAgent)) {
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set("x-request-id", requestId);
    return res;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Explicit reset (AKSHAYA logo / Switch Service link)
  // ─────────────────────────────────────────────────────────────────────────
  if (request.nextUrl.searchParams.has("reset")) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.cookies.delete(ENTRY_COOKIE);
    response.headers.set("x-request-id", requestId);
    return response;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Returning-user service redirect at "/"
  // ─────────────────────────────────────────────────────────────────────────
  if (pathname === "/") {
    const entry = request.cookies.get(ENTRY_COOKIE)?.value;
    const destination = entry ? ENTRY_DESTINATION[entry] : undefined;

    if (destination) {
      const targetUrl = new URL(destination, request.url);

      // Preserve search params (UTM, referral tags)
      request.nextUrl.searchParams.forEach((value, key) => {
        targetUrl.searchParams.set(key, value);
      });

      const redirectRes = NextResponse.redirect(targetUrl, 302);
      redirectRes.headers.set("x-request-id", requestId);
      return redirectRes;
    }
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("x-request-id", requestId);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
