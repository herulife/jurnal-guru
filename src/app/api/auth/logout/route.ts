import { getSession, destroySession, addLog } from "@/lib/auth";
import { apiResponse } from "@/lib/utils";

export async function POST() {
  let session = null;
  try {
    session = await getSession();
  } catch {
    // ignore
  }
  try {
    if (session) {
      await addLog(session.id, "LOGOUT", `${session.username} logout`);
    }
  } catch {
    // ignore
  }
  try {
    await destroySession();
  } catch {
    // ignore
  }
  return apiResponse(true, null, "Logout berhasil");
}
