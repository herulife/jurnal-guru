import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";

export default function globalSetup() {
  const dir = "tests/.tmp";
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  // Buat database test terisolasi dari schema.ts (bukan produksi).
  execFileSync("npx", ["drizzle-kit", "push", "--force"], {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: `file:./${dir}/reg.db` },
    stdio: "inherit",
  });
  console.log("[global-setup] test DB siap: tests/.tmp/reg.db");
}