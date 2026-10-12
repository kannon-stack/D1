import crypto from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { getSettings } from "@/lib/localDb";
import { isSsoTypeEnabled } from "@/lib/auth/authMode";

export { getPublicOrigin } from "@/lib/auth/publicOrigin";

export const OIDC_COOKIE_NAMES = {
  state: "oidc_state",
  nonce: "oidc_nonce",
  verifier: "oidc_code_verifier",
};

const DEFAULT_SCOPES = "openid profile email";
// Without a timeout an unreachable IdP leaves the browser on a blank loading tab.
const OIDC_FETCH_TIMEOUT_MS = 10_000;
// Google documents both forms as valid `iss` values for its ID tokens.
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

function trimTrailingSlashes(value) {
  return (value || "").trim().replace(/\/+$/, "");
}

export function isGoogleIssuer(issuer) {
  return GOOGLE_ISSUERS.includes(trimTrailingSlashes(issuer));
}

function normalizeScopes(value) {
  return (value || DEFAULT_SCOPES).trim() || DEFAULT_SCOPES;
}

export function isOidcConfigured(settings) {
  return !!(
    trimTrailingSlashes(settings?.oidcIssuerUrl) &&
    (settings?.oidcClientId || "").trim() &&
    (settings?.oidcClientSecret || "").trim()
  );
}

// Google sign-in rejects everyone until an allowlist exists (checkOidcAllowedIdentity),
// so until then it must not count as a working SSO method: the login page and the
// password route keep password login open instead of locking the admin out.
export function isOidcLoginUsable(settings) {
  return isOidcConfigured(settings) &&
    !(isGoogleIssuer(settings?.oidcIssuerUrl) && !parseOidcAllowedEmails(settings?.oidcAllowedEmails).length);
}

export async function getOidcRuntimeConfig() {
  const settings = await getSettings();
  if (!isSsoTypeEnabled(settings, "oidc") || !isOidcConfigured(settings)) return null;

  const issuerUrl = trimTrailingSlashes(settings.oidcIssuerUrl);
  return {
    issuerUrl,
    clientId: settings.oidcClientId.trim(),
    clientSecret: settings.oidcClientSecret.trim(),
    scopes: normalizeScopes(settings.oidcScopes),
    allowedEmails: settings.oidcAllowedEmails || "",
  };
}

// "you@gmail.com, @example.com" -> ["you@gmail.com", "@example.com"]
export function parseOidcAllowedEmails(value) {
  return String(value || "")
    .split(/[\s,]+/)
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

// Returns null when the identity may sign in, otherwise the /login error code.
// Any Google account can complete Google sign-in, so Google requires a list; other
// issuers control access themselves unless the admin also sets a list.
export function checkOidcAllowedIdentity(payload, { issuer, allowedEmails } = {}) {
  const entries = parseOidcAllowedEmails(allowedEmails);
  const google = isGoogleIssuer(issuer);
  if (!entries.length) return google ? "oidc_allowlist_required" : null;

  const verified = google ? payload?.email_verified === true : payload?.email_verified !== false;
  const email = String(payload?.email || "").trim().toLowerCase();
  if (!verified || !email) return "oidc_email_not_allowed";

  const at = email.lastIndexOf("@");
  const domain = at === -1 ? "" : email.slice(at);
  const allowed = entries.some((entry) => (entry.startsWith("@") ? entry === domain : entry === email));
  return allowed ? null : "oidc_email_not_allowed";
}

export async function fetchOidcDiscovery(issuerUrl) {
  const discoveryUrl = `${trimTrailingSlashes(issuerUrl)}/.well-known/openid-configuration`;
  const res = await fetch(discoveryUrl, { cache: "no-store", signal: AbortSignal.timeout(OIDC_FETCH_TIMEOUT_MS) });
  if (!res.ok) {
    throw new Error(`Failed to load OIDC discovery document from ${discoveryUrl}`);
  }
  return await res.json();
}

export function createPkcePair() {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function createOidcState() {
  return crypto.randomBytes(16).toString("base64url");
}

export function createOidcNonce() {
  return crypto.randomBytes(16).toString("base64url");
}

export function buildOidcAuthorizationUrl({
  authorizationEndpoint,
  clientId,
  redirectUri,
  scopes = DEFAULT_SCOPES,
  state,
  nonce,
  codeChallenge,
}) {
  const url = new URL(authorizationEndpoint);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", normalizeScopes(scopes));
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

export async function exchangeOidcCode({
  tokenEndpoint,
  clientId,
  clientSecret,
  code,
  redirectUri,
  codeVerifier,
}) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  if (clientSecret) {
    body.set("client_secret", clientSecret);
  }

  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(OIDC_FETCH_TIMEOUT_MS),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error_description || data?.error || `OIDC token exchange failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export async function probeOidcClientSecret({
  tokenEndpoint,
  clientId,
  clientSecret,
  redirectUri,
}) {
  if (!clientSecret) {
    return {
      tested: false,
      valid: null,
      message: "No client secret was provided, so secret validation was skipped.",
    };
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    code: "__oidc_test_invalid_code__",
    redirect_uri: redirectUri,
    code_verifier: "__oidc_test_invalid_verifier__",
  });

  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(OIDC_FETCH_TIMEOUT_MS),
  });

  const data = await res.json().catch(() => ({}));
  const error = (data?.error || "").toLowerCase();
  const errorDescription = data?.error_description || data?.error || "";

  if (res.ok) {
    return {
      tested: true,
      valid: true,
      message: "Client secret was accepted by the token endpoint.",
      raw: data,
    };
  }

  if (error === "invalid_client" || error === "unauthorized_client" || /client.*(invalid|failed|mismatch)/i.test(errorDescription)) {
    return {
      tested: true,
      valid: false,
      message: errorDescription || "Client secret is not valid.",
      raw: data,
    };
  }

  if (error === "invalid_grant" || error === "invalid_code" || /grant|code/i.test(errorDescription)) {
    return {
      tested: true,
      valid: true,
      message: "Client secret was accepted; the token exchange failed only because the test authorization code is invalid.",
      raw: data,
    };
  }

  return {
    tested: true,
    valid: null,
    message: errorDescription || `Token endpoint responded with ${res.status}`,
    raw: data,
  };
}

export async function verifyOidcIdToken({
  idToken,
  issuer,
  audience,
  jwksUri,
  nonce,
}) {
  const jwks = createRemoteJWKSet(new URL(jwksUri), { timeoutDuration: OIDC_FETCH_TIMEOUT_MS });
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: GOOGLE_ISSUERS.includes(issuer) ? GOOGLE_ISSUERS : issuer,
    audience,
  });
  // jose does not check `nonce`; it must match the one sent with the authorization request.
  if (!nonce || payload.nonce !== nonce) {
    throw new Error("OIDC id_token nonce mismatch");
  }
  return payload;
}

export function pickOidcDisplayName(payload = {}) {
  return payload.preferred_username || payload.email || payload.name || payload.given_name || payload.sub || "OIDC user";
}

export function pickOidcEmail(payload = {}) {
  return payload.email || "";
}
