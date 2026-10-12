import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSettings } from "@/lib/localDb";
import {
  OIDC_COOKIE_NAMES,
  checkOidcAllowedIdentity,
  exchangeOidcCode,
  fetchOidcDiscovery,
  getOidcRuntimeConfig,
  getPublicOrigin,
  pickOidcDisplayName,
  pickOidcEmail,
  verifyOidcIdToken,
} from "@/lib/auth/oidc";
import { setDashboardAuthCookie } from "@/lib/auth/dashboardSession";
import { isTunnelDashboardBlocked } from "@/lib/auth/tunnelAccess";

// The IdP's own error (e.g. access_denied) is shown only when it looks like an OAuth
// error code, so a crafted link cannot put free text on the login page.
const IDP_ERROR_CODE = /^[a-z0-9_.-]{1,64}$/i;

function clearOidcCookies(cookieStore) {
  for (const name of Object.values(OIDC_COOKIE_NAMES)) cookieStore.delete(name);
}

function loginError(request, code) {
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(code)}`, getPublicOrigin(request)));
}

export async function GET(request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  if (error) {
    console.error("[auth/oidc/callback] IdP returned an error:", error, url.searchParams.get("error_description") || "");
    return loginError(request, IDP_ERROR_CODE.test(error) ? error : "oidc_callback_failed");
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return loginError(request, "oidc_missing_code");
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(OIDC_COOKIE_NAMES.state)?.value;
  const storedNonce = cookieStore.get(OIDC_COOKIE_NAMES.nonce)?.value;
  const codeVerifier = cookieStore.get(OIDC_COOKIE_NAMES.verifier)?.value;

  // Leave the cookies alone: a stale tab's callback must not wipe a newer attempt's state.
  if (!storedState || !storedNonce || !codeVerifier || storedState !== state) {
    return loginError(request, "oidc_invalid_state");
  }

  try {
    if (isTunnelDashboardBlocked(request, await getSettings())) {
      clearOidcCookies(cookieStore);
      return loginError(request, "tunnel_dashboard_disabled");
    }

    const config = await getOidcRuntimeConfig();
    if (!config) {
      clearOidcCookies(cookieStore);
      return loginError(request, "oidc_not_configured");
    }

    const discovery = await fetchOidcDiscovery(config.issuerUrl);
    const discoveredIssuer = discovery.issuer || config.issuerUrl;
    const redirectUri = `${getPublicOrigin(request)}/api/auth/oidc/callback`;
    const tokenData = await exchangeOidcCode({
      tokenEndpoint: discovery.token_endpoint,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      code,
      redirectUri,
      codeVerifier,
    });

    if (!tokenData.id_token) {
      throw new Error("OIDC provider did not return an id_token");
    }

    const payload = await verifyOidcIdToken({
      idToken: tokenData.id_token,
      issuer: discoveredIssuer,
      audience: config.clientId,
      jwksUri: discovery.jwks_uri,
      nonce: storedNonce,
    });

    clearOidcCookies(cookieStore);

    const notAllowed = checkOidcAllowedIdentity(payload, { issuer: discoveredIssuer, allowedEmails: config.allowedEmails });
    if (notAllowed) {
      console.error(`[auth/oidc/callback] Rejected ${pickOidcEmail(payload) || payload.sub || "unknown identity"}: ${notAllowed}`);
      return loginError(request, notAllowed);
    }

    await setDashboardAuthCookie(cookieStore, request, {
      oidc: true,
      oidcSub: payload.sub || null,
      oidcEmail: pickOidcEmail(payload) || null,
      oidcName: pickOidcDisplayName(payload),
    });

    return NextResponse.redirect(new URL("/dashboard", getPublicOrigin(request)));
  } catch (error) {
    console.error("[auth/oidc/callback] Sign-in failed:", error);
    clearOidcCookies(cookieStore);
    return loginError(request, "oidc_callback_failed");
  }
}
