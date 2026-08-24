import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/unit/**/*.test.ts"],
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      include: [
        "lib/supabase/admin.ts",
        "lib/auth/require-admin.ts",
        "lib/observability.ts",
        "lib/rate-limit.ts",
        "app/api/webhooks/razorpay/route.ts",
      ],
    },
  },
});
