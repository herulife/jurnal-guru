import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",
    extraHTTPHeaders: {
      "x-test-run": "api",
    },
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    { name: "sales", testMatch: /_sales\.spec\.ts/ },
    { name: "checkout", testMatch: /_checkout\.spec\.ts/ },
    { name: "security", testMatch: /_security\.spec\.ts/ },
    { name: "tracking", testMatch: /_tracking\.spec\.ts/ },
    { name: "mobile", testMatch: /_mobile\.spec\.ts/ },
    { name: "tracking", testMatch: /_tracking\.spec\.ts/ },
    { name: "p1", dependencies: ["setup"], use: { storageState: "playwright/.auth/user.json" }, testMatch: /_p1qa/ },
    { name: "reg", dependencies: ["setup"], use: { storageState: "playwright/.auth/user.json" }, testMatch: /_p1reg/ },
  ],
  workers: 1,
});