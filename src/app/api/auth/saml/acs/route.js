import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSettings } from "@/lib/localDb";
import {
  isSamlConfigured,
  pickSamlDisplayName,
  pickSamlEmail,
  validateSamlResponse,
} from "@/lib/auth/saml.js";
import { getPublicOrigin } from "@/lib/auth/publicOrigin";
import { setDashboardAuthCookie } from "@/lib/auth/dashboardSession";
import { checkLock, recordFail, recordSuccess, getClientIp } from "@/lib/auth/loginLimiter";
import { isSsoTypeEnabled } from "@/lib/auth/authMode";
import { isTunnelDashboardBlocked } from "@/lib/auth/tunnelAccess";

// The IdP POSTs here. 303 makes the browser follow with a GET, so it does not re-POST
// the SAMLResponse and the top-level navigation carries the new Lax auth_token.
function redirect(path, origin) {
  return NextResponse.redirect(new URL(path, origin), 303);
}

export async function POST(request) {
  const settings = await getSettings();
  const origin = getPublicOrigin(request);
  const ip = getClientIp(request);

  const lock = checkLock(ip);
  if (lock.locked) {
    return redirect("/login?error=saml_rate_limited", origin);
  }

  try {
    const formData = await request.formData();
    const SAMLResponse = formData.get("SAMLResponse");

    if (!SAMLResponse) {
      recordFail(ip);
      return redirect("/login?error=saml_missing_response", origin);
    }

    if (!isSsoTypeEnabled(settings, "saml") || !isSamlConfigured(settings)) {
      recordFail(ip);
      return redirect("/login?error=saml_not_configured", origin);
    }

    if (isTunnelDashboardBlocked(request, settings)) {
      return redirect("/login?error=tunnel_dashboard_disabled", origin);
    }

    const profile = await validateSamlResponse(request, { SAMLResponse }, settings);

    const samlEmail = pickSamlEmail(profile, settings) || null;
    const samlName = pickSamlDisplayName(profile, settings) || "SAML user";

    recordSuccess(ip);

    const cookieStore = await cookies();
    await setDashboardAuthCookie(cookieStore, request, {
      saml: true,
      samlEmail,
      samlName,
    });

    return redirect("/dashboard", origin);
  } catch (error) {
    console.error("[auth/saml/acs] SAML response rejected:", error);
    recordFail(ip);
    return redirect("/login?error=saml_acs_failed", origin);
  }
}
