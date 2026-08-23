import { createBrowserClient } from "@supabase/ssr";
import { useSuperAdminStore } from "@/store/useSuperAdminStore";
import { useBusinessAdminStore } from "@/store/useBusinessAdminStore";
import { useAdminStore } from "@/lib/admin-store";

export async function performLogout(redirectTarget: string = "/admin/login") {
  // 1. Supabase Client Sign Out
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && anonKey) {
      const supabase = createBrowserClient(url, anonKey);
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.error("Client Supabase signOut error:", err);
  }

  // 2. Server API Route Cookie Destruction
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Server API logout error:", err);
  }

  // 3. Clear Storage & Cached Tokens
  if (typeof window !== "undefined") {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (err) {
      console.error("Storage clear error:", err);
    }
  }

  // 4. Reset All Client Zustand Stores
  try {
    useSuperAdminStore.setState({
      userRole: "staff",
      searchQuery: "",
    });
    useAdminStore.setState({
      currentRole: null,
      currentUser: null,
    });
  } catch (err) {
    console.error("Store reset error:", err);
  }

  // 5. Immediate Redirect & Prevent Back Navigation
  if (typeof window !== "undefined") {
    window.location.replace(redirectTarget);
  }
}
