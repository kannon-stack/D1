import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSettings } from "@/lib/localDb";
import {
  OIDC_COOKIE_NAMES,
  buildOidcAuthorizationUrl,
  createOidcNonce,
  createOidcState,
  createPkcePair,
  fetchOidcDiscovery,
  getOidcRuntimeConfig,
  getPublicOrigin,
} from "@/lib/auth/oidc";
import { shouldUseSecureCookie } from "@/lib/auth/dashboardSession";
import { isTunnelDashboardBlocked } from "@/lib/auth/tunnelAccess";

export async function GET(request) {
  try {
    if (isTunnelDashboardBlocked(request, await getSettings())) {
      return NextResponse.redirect(new URL("/login?error=tunnel_dashboard_disabled", getPublicOrigin(request)));
    }

    const config = await getOidcRuntimeConfig();
    if (!config) {
      return NextResponse.redirect(new URL("/login?error=oidc_not_configured", getPublicOrigin(request)));
    }

    const discovery = await fetchOidcDiscovery(config.issuerUrl);
    const state = createOidcState();
    const nonce = createOidcNonce();
    const { verifier, challenge } = createPkcePair();
    const redirectUri = `${getPublicOrigin(request)}/api/auth/oidc/callback`;
    const authUrl = buildOidcAuthorizationUrl({
      authorizationEndpoint: discovery.authorization_endpoint,
      clientId: config.clientId,
      redirectUri,
      scopes: config.scopes,
      state,
      nonce,
      codeChallenge: challenge,
    });

    const cookieStore = await cookies();
    const baseOptions = {
      httpOnly: true,
      secure: shouldUseSecureCookie(request),
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60,
    };
    cookieStore.set(OIDC_COOKIE_NAMES.state, state, baseOptions);
    cookieStore.set(OIDC_COOKIE_NAMES.nonce, nonce, baseOptions);
    cookieStore.set(OIDC_COOKIE_NAMES.verifier, verifier, baseOptions);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message || "oidc_start_failed")}`, getPublicOrigin(request)));
  }
}
