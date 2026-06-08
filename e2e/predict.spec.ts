import { test, expect } from "@playwright/test";
import { devLogin } from "./helpers";

test.describe("Predictions", () => {
  test("a user can submit a prediction on an open match", async ({ page }) => {
    await devLogin(page, "dev@tribes.local", "Dev Player");
    await page.goto("/predict");

    const card = page.getByTestId("match-Mexico-Croatia");
    await expect(card).toBeVisible();

    await card.getByRole("button", { name: "Increase home score" }).click();
    await card.getByRole("button", { name: /predict|update/i }).click();

    await expect(card.getByText("Saved")).toBeVisible();
  });

  test("a match within the lock window is locked", async ({ page }) => {
    await devLogin(page, "dev@tribes.local", "Dev Player");
    await page.goto("/predict");

    const locked = page.getByTestId("match-Spain-Japan");
    await expect(locked.getByText("Predictions locked")).toBeVisible();
  });

  test("a TBD knockout fixture is not open", async ({ page }) => {
    await devLogin(page, "dev@tribes.local", "Dev Player");
    await page.goto("/predict");

    const tbd = page.getByTestId("match-TBD-TBD");
    await expect(tbd.getByText("Teams not confirmed yet")).toBeVisible();
  });

  test("finished matches show earned points", async ({ page }) => {
    await devLogin(page, "dev@tribes.local", "Dev Player");
    await page.goto("/predict");

    // Dev predicted 4-1 exactly on France v Australia => 10 pts.
    const finished = page.getByTestId("match-France-Australia");
    await expect(finished.getByText(/10 pts/)).toBeVisible();
  });
});
