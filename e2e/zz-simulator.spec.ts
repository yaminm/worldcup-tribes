import { test, expect } from "@playwright/test";
import { devLogin } from "./helpers";

// Runs last (filename) because it mutates seeded match state.
test.describe("Simulator end-to-end (kickoff locks, finish scores)", () => {
  test("kicking off locks predictions; finishing scores them", async ({ page }) => {
    await devLogin(page, "dev@tribes.local", "Dev Player");

    await page.goto("/admin");
    await page.getByRole("button", { name: /kick off next/i }).click();
    await expect(page.getByText(/predictions now locked/i)).toBeVisible();

    // A kicked-off match is now locked on the predict page (backend + UI).
    await page.goto("/predict");
    const card = page.getByTestId("match-Mexico-Croatia");
    await expect(card.getByText(/Predictions locked/i)).toBeVisible();

    // Finish + score the now-live matches.
    await page.goto("/admin");
    await page.getByRole("button", { name: /finish live/i }).click();
    await expect(page.getByText(/Finished \+ scored/i)).toBeVisible();
  });
});
