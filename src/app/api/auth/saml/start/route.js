import { NextResponse } from "next/server";
import { getSettings } from "@/lib/localDb";
import { buildSamlAuthorizeUrl, isSamlConfigured } from "@/lib/auth/saml.js";
import { getPublicOrigin } from "@/lib/auth/publicOrigin";
import { isSsoTypeEnabled } from "@/lib/auth/authMode";
import { isTunnelDashboardBlocked } from "@/lib/auth/tunnelAccess";

export async function GET(request) {
  const settings = await getSettings();
  const origin = getPublicOrigin(request);
  try {
    if (isTunnelDashboardBlocked(request, settings)) {
      return NextResponse.redirect(new URL("/login?error=tunnel_dashboard_disabled", origin));
    }
    if (!isSsoTypeEnabled(settings, "saml") || !isSamlConfigured(settings)) {
      return NextResponse.redirect(new URL("/login?error=saml_not_configured", origin));
    }

    // The AuthnRequest ID is kept server-side (see saml.js): the IdP's cross-site POST
    // back to the ACS would not carry a SameSite=Lax state cookie.
    const { authorizeUrl } = await buildSamlAuthorizeUrl(request, settings);

    return NextResponse.redirect(authorizeUrl);
  } catch (error) {
    console.error("[auth/saml/start] Could not start sign-in:", error);
    return NextResponse.redirect(new URL("/login?error=saml_start_failed", origin));
  }
}
