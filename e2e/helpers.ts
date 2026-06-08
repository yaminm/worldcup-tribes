import { Page, expect } from "@playwright/test";

export async function devLogin(page: Page, email: string, name: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Display name").fill(name);
  await page.getByRole("button", { name: /continue \(dev login\)/i }).click();
  // Redirected to the dashboard.
  await expect(page).toHaveURL("/");
}
