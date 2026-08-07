import { getSession } from "@/lib/auth";
import { getUserPlan } from "@/lib/plans";
import { apiOk, apiError } from "@/lib/utils";

export async function GET() {
  const session = await getSession();
  if (!session) return apiError("Unauthorized", 401);
  const plan = await getUserPlan(session.id);
  return apiOk({ user: { ...session, plan } });
}