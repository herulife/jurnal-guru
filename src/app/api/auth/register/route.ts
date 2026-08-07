import { hashPassword, addLog, createSession } from "@/lib/auth";
import { apiError, apiResponse } from "@/lib/utils";
import { db } from "@/db";
import { users, settings, profilSekolah } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { username, password, namaLengkap } = await req.json();

    if (!username || !password || !namaLengkap) {
      return apiError("Username, password, dan nama lengkap wajib diisi");
    }

    if (username.length < 4) {
      return apiError("Username minimal 4 karakter");
    }

    if (password.length < 6) {
      return apiError("Password minimal 6 karakter");
    }

    // Check if username already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .get();

    if (existing) {
      return apiError("Username sudah digunakan");
    }

    // Create new user
    const userId = uuidv4();
    const hashedPassword = await hashPassword(password);

    await db.insert(users).values({
      id: userId,
      username,
      passwordHash: hashedPassword,
      namaLengkap,
      role: "guru",
    });

    // Create default profile
    await db.insert(profilSekolah).values({
      id: uuidv4(),
      namaSekolah: "",
      alamat: "",
      npsn: "",
      kota: "",
      provinsi: "",
      telepon: "",
      kepalaSekolah: "",
      nipKepsek: "",
      namaGuru: namaLengkap,
      nipGuru: "",
      logoUrl: "",
    });

    // Auto login after registration
    const user = {
      id: userId,
      username,
      role: "guru",
      nama: namaLengkap,
    };

    await createSession(user);
    await addLog(userId, "REGISTER", `${username} mendaftar`);

    return apiResponse(true, { user }, "Registrasi berhasil");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Terjadi kesalahan";
    return apiError(msg);
  }
}
