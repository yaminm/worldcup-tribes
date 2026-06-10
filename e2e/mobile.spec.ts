import { test, expect } from "@playwright/test";
import { devLogin } from "./helpers";

test.use({ viewport: { width: 390, height: 844 } });

test.describe("Mobile navigation", () => {
  test("the hamburger menu opens and navigates", async ({ page }) => {
    await devLogin(page, "dev@tribes.local", "Dev Player");

    // The full nav is hidden on mobile; open the menu instead.
    await page.getByRole("button", { name: /open menu/i }).click();
    await page.getByRole("link", { name: "Predict", exact: true }).click();
    await expect(page).toHaveURL("/predict");
  });
});
