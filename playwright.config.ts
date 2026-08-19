import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",
    storageState: "playwright/.auth/user.json",
    extraHTTPHeaders: {
      "x-test-run": "api",
    },
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    { name: "sales", storageState: { cookies: [], origins: [] }, testMatch: /_sales\.spec\.ts/ },
    { name: "p1", dependencies: ["setup"], testMatch: /_p1qa/ },
    { name: "reg", dependencies: ["setup"], testMatch: /_p1reg/ },
  ],
  workers: 1,
});