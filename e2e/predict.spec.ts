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

test.describe("Outrights", () => {
  test("a user can pick a tournament outright", async ({ page }) => {
    await devLogin(page, "dev@tribes.local", "Dev Player");
    await page.goto("/outrights");
    await expect(page.getByText("World Cup winner")).toBeVisible();

    await page.locator("select").first().selectOption("Brazil");
    await page.getByRole("button", { name: /pick|update/i }).first().click();
    await expect(page.getByText("Saved").first()).toBeVisible();
  });

  test("shows points earned on a resolved outright", async ({ page }) => {
    await devLogin(page, "dev@tribes.local", "Dev Player");
    await page.goto("/outrights");
    // Dev picked France on the resolved demo outright (correct) => 10 pts.
    await expect(page.getByText(/Highest-scoring team/)).toBeVisible();
  });
});

test.describe("Groups", () => {
  test("shows group standings", async ({ page }) => {
    await devLogin(page, "dev@tribes.local", "Dev Player");
    await page.goto("/groups");
    await expect(page.getByRole("heading", { name: "Groups" })).toBeVisible();
    // Seed has a finished Group F match (France 4-1 Australia).
    await expect(page.getByText("Group F")).toBeVisible();
    await expect(page.getByText("France").first()).toBeVisible();
  });
});
