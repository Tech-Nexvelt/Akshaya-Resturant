import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ENTRY_COOKIE = "akshaya_entry";

const ENTRY_DESTINATION: Record<string, string> = {
  restaurant: "/restaurant",
  banquet: "/banquet",
  catering: "/catering",
};

const BOT_USER_AGENTS = /bot|googlebot|crawler|spider|robot|crawling/i;

const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
  "/admin/set-password",
];

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const { pathname } = request.nextUrl;

  // 1. AUTH & RBAC GATE — /admin/*, /super-admin/*, /owner/*
  const isProtectedAdmin =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/super-admin") ||
    pathname.startsWith("/owner");

  if (isProtectedAdmin && !isPublicAdminPath(pathname)) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);
      const res = NextResponse.redirect(loginUrl, 302);
      res.headers.set("x-request-id", requestId);
      return res;
    }

    // Role Lookup for Route Protection
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

    if (!profile || profile.status !== "active") {
      const denied = new URL("/admin/login", request.url);
      denied.searchParams.set("error", "account-inactive");
      const res = NextResponse.redirect(denied, 302);
      res.headers.set("x-request-id", requestId);
      return res;
    }

    // Route-level RBAC Guards
    if (pathname.startsWith("/super-admin") && profile.role !== "super_admin") {
      const denied = new URL("/admin/dashboard", request.url);
      denied.searchParams.set("error", "unauthorized");
      const res = NextResponse.redirect(denied, 302);
      res.headers.set("x-request-id", requestId);
      return res;
    }

    if (pathname.startsWith("/owner") && !["owner", "super_admin"].includes(profile.role)) {
      const denied = new URL("/admin/dashboard", request.url);
      denied.searchParams.set("error", "unauthorized");
      const res = NextResponse.redirect(denied, 302);
      res.headers.set("x-request-id", requestId);
      return res;
    }

    response.headers.set("x-request-id", requestId);
    return response;
  }

  // 2. Crawlers
  const userAgent = request.headers.get("user-agent") || "";
  if (BOT_USER_AGENTS.test(userAgent)) {
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set("x-request-id", requestId);
    return res;
  }

  // 3. Reset
  if (request.nextUrl.searchParams.has("reset")) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.cookies.delete(ENTRY_COOKIE);
    response.headers.set("x-request-id", requestId);
    return response;
  }

  // 4. Root landing page always renders service selection directly
  // (Cookie redirect removed so users always see the entry selection cards at "/")

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("x-request-id", requestId);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
