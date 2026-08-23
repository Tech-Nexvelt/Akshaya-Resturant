import { test, expect } from "@playwright/test";

const PROTECTED_ADMIN_URLS = [
  "/admin/dashboard",
  "/admin/orders",
  "/admin/menu",
  "/admin/leads",
  "/admin/invoices",
  "/admin/payments",
  "/admin/webhooks",
  "/admin/settings",
];

test.describe("Admin Auth Guard & Signed-Out Redirection", () => {
  for (const path of PROTECTED_ADMIN_URLS) {
    test(`signed-out request to ${path} redirects to /admin/login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`/admin/login\\?redirect=${encodeURIComponent(path)}`));
    });
  }
});
