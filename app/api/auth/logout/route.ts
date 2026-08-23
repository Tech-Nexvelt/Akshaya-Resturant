import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, redirectUrl: "/admin/login" });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && anonKey) {
    try {
      const supabase = createServerClient(url, anonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      });

      await supabase.auth.signOut();
    } catch {
      // Ignore if no active session
    }
  }

  // Purge any remaining auth / session cookies
  const allCookies = request.cookies.getAll();
  allCookies.forEach((cookie) => {
    if (
      cookie.name.includes("sb-") ||
      cookie.name.includes("supabase") ||
      cookie.name.includes("token") ||
      cookie.name.includes("session")
    ) {
      response.cookies.delete(cookie.name);
    }
  });

  return response;
}
