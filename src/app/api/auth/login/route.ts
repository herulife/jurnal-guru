import { createSession, verifyCredentials, addLog } from "@/lib/auth";
import { apiError, apiResponse } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return apiError("Username dan password wajib diisi");
    }
    const user = await verifyCredentials(username, password);
    if (!user) {
      return apiError("Username atau password salah");
    }
    await createSession(user);
    await addLog(user.id, "LOGIN", `${user.username} login`);
    return apiResponse(true, { user }, "Login berhasil");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Terjadi kesalahan";
    return apiError(msg);
  }
}
