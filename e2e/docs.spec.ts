import { test, expect } from "@playwright/test";

test.describe("Docs", () => {
  test("how-it-works explains scoring (public, no login)", async ({ page }) => {
    await page.goto("/how-it-works");
    await expect(
      page.getByRole("heading", { name: /Every way to score/ }),
    ).toBeVisible();
    await expect(page.getByText(/Exact score — 10 pts/)).toBeVisible();
    await expect(page.getByText("Knockout bracket")).toBeVisible();
  });

  test("whats-new page renders the Hebrew update", async ({ page }) => {
    await page.goto("/whats-new");
    await expect(page.getByRole("heading", { name: /עדכון חדש/ })).toBeVisible();
    await expect(page.getByText(/יריבים אוטומטיים/)).toBeVisible();
  });

  test("llms.txt is served as plain text", async ({ page }) => {
    const res = await page.request.get("/llms.txt");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/plain");
    const body = await res.text();
    expect(body).toContain("# Tribes");
    expect(body).toContain("Scoring & rules");
    expect(body).toContain("/how-it-works");
  });
});
