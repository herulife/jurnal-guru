import { defineConfig } from "@playwright/test";

const TEST_DB = "file:./tests/.tmp/reg.db";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  retries: 0,
  reporter: [["list"]],
  globalSetup: "./tests/register.global-setup.ts",
  use: {
    baseURL: "http://localhost:3100",
  },
  webServer: [
    {
      command: "node tests/helpers/mock-email-server.mjs",
      port: 3199,
      reuseExistingServer: false,
      timeout: 15000,
    },
    {
      command: `PORT=3100 DATABASE_URL=${TEST_DB} RATE_LIMIT_FILE=/tmp/jg-reg-rate.json RESEND_API_URL=http://localhost:3199/emails JWT_SECRET=register-test-secret D1_ACTIVE=false npx next start`,
      port: 3100,
      reuseExistingServer: false,
      timeout: 120000,
    },
  ],
  projects: [{ name: "register", testMatch: /auth-register\.spec\.ts/ }],
  workers: 1,
});