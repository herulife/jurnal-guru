import { db } from "@/db";
import { users, settings, profilSekolah } from "@/db/schema";
import { hashPassword } from "./auth";
import { v4 as uuidv4 } from "uuid";

export async function seedDatabase() {
  const existingUsers = await db.select().from(users).all();
  if (existingUsers.length > 0) return;

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
}
