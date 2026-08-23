"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white text-xs">
      <span>Redirecting to authentication portal...</span>
    </div>
  );
}
