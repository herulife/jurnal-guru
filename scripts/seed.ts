import { db } from "../src/db";
import { users, settings, profilSekolah } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  const existing = await db.select().from(users).all();
  if (existing.length > 0) {
    console.log("Database already seeded");
    return;
  }

  const hashed = await hashPassword("admin123");
  await db.insert(users).values({
    id: uuidv4(),
    username: "admin",
    passwordHash: hashed,
    namaLengkap: "Administrator",
    role: "admin",
  });

  await db.insert(settings).values({ key: "app_name", value: "Teacher Dashboard" });
  await db.insert(settings).values({ key: "tahun_ajaran", value: "2024/2025" });
  await db.insert(settings).values({ key: "semester", value: "1" });
  await db.insert(settings).values({ key: "kkm_default", value: "75" });

  await db.insert(profilSekolah).values({
    id: uuidv4(),
    namaSekolah: "Sekolah",
    alamat: "",
    npsn: "",
    kota: "",
    provinsi: "",
    telepon: "",
    kepalaSekolah: "",
    nipKepsek: "",
    namaGuru: "",
    nipGuru: "",
    logoUrl: "",
  });

  console.log("Database seeded successfully!");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
