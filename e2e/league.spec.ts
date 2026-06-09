import { test, expect } from "@playwright/test";
import { devLogin } from "./helpers";

test.describe("Leagues", () => {
  test("a user can create a league and see the leaderboard", async ({ page }) => {
    await devLogin(page, "creator@tribes.local", "Creator");
    await page.goto("/leagues/new");

    await page.getByLabel("League name").fill("Test League");
    await page.getByRole("button", { name: /create league/i }).click();

    await expect(page).toHaveURL(/\/leagues\/.+/);
    await expect(
      page.getByRole("heading", { name: "Test League" }),
    ).toBeVisible();
    await expect(page.getByText("Leaderboard")).toBeVisible();
    // Creator is auto-added as a member (scope to the leaderboard table).
    await expect(page.locator("table").getByText("Creator")).toBeVisible();
  });

  test("an invite link joins the league after sign-in", async ({ page }) => {
    await devLogin(page, "linkjoiner@tribes.local", "Link Joiner");
    await page.goto("/join/DEMO01");
    await expect(page).toHaveURL(/\/leagues\/.+/);
    await expect(page.getByText("Demo Tribe")).toBeVisible();
  });

  test("an invite link sends signed-out users to login first", async ({ page }) => {
    await page.goto("/join/DEMO01");
    await expect(page).toHaveURL(/\/login\?callbackUrl=/);
  });

  test("the global leaderboard lists all players", async ({ page }) => {
    await devLogin(page, "dev@tribes.local", "Dev Player");
    await page.goto("/leaderboard");
    await expect(
      page.getByRole("heading", { name: "Global leaderboard" }),
    ).toBeVisible();
    await expect(page.locator("table").getByText("Dev Player")).toBeVisible();
    await expect(page.locator("table").getByText("Rival Riley")).toBeVisible();
  });

  test("a user can join the seeded league with its code", async ({ page }) => {
    await devLogin(page, "joiner@tribes.local", "Joiner");
    await page.goto("/leagues/join");

    await page.getByLabel("Invite code").fill("DEMO01");
    await page.getByRole("button", { name: /join league/i }).click();

    await expect(page).toHaveURL(/\/leagues\/.+/);
    await expect(page.getByText("Demo Tribe")).toBeVisible();
    // Seeded members are visible on the leaderboard.
    await expect(page.getByText("Dev Player")).toBeVisible();
    await expect(page.getByText("Rival Riley")).toBeVisible();
  });
});
