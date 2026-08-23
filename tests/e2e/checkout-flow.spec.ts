import { test, expect } from "@playwright/test";

test.describe("Restaurant Ordering UI & Cart Flow", () => {
  test("guest can search dishes, add to cart, and open checkout modal", async ({ page }) => {
    await page.goto("/restaurant");

    // 1. Verify Menu loads and search works
    const searchInput = page.locator("input[type='search']");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Biryani");
    await page.waitForTimeout(350); // debounce wait

    // 2. Add dish to cart
    const addButton = page.locator("button:has-text('ADD')").first();
    await expect(addButton).toBeVisible();
    await addButton.click();

    // 3. Open cart panel/drawer
    const cartButton = page.locator("button:has-text('Cart')").first();
    await expect(cartButton).toBeVisible();
    await cartButton.click();

    // 4. Verify checkout button is active
    const checkoutButton = page.locator("button:has-text('Proceed to Checkout')");
    await expect(checkoutButton).toBeVisible();
    await expect(checkoutButton).toBeEnabled();
  });
});
