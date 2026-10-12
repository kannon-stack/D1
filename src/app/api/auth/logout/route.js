import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearDashboardAuthCookie } from "@/lib/auth/dashboardSession";
import { OIDC_COOKIE_NAMES } from "@/lib/auth/oidc";

export async function POST() {
  const cookieStore = await cookies();
  clearDashboardAuthCookie(cookieStore);
  for (const name of Object.values(OIDC_COOKIE_NAMES)) cookieStore.delete(name);
  return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}
