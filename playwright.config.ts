import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

// Keep Playwright browsers inside the project so `npm run verify` works without
// extra env setup (and stays sandbox-friendly). Install them with:
//   PLAYWRIGHT_BROWSERS_PATH=$PWD/.playwright npx playwright install chromium
process.env.PLAYWRIGHT_BROWSERS_PATH = `${process.cwd()}/.playwright`;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ENABLE_DEV_LOGIN: "true",
      ADMIN_EMAILS: "dev@tribes.local",
    },
  },
});
