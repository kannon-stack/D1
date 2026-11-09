// Single source of truth for the dashboard auth mode. The profile page saves
// authMode as "password", "sso" or "both"; "oidc" / "saml" are older SSO-only
// values. ssoType ("oidc" | "saml") picks which SSO method is active.

const SSO_ONLY_MODES = ["sso", "oidc", "saml"];

// Explicit, server-side opt-in (not settable from the dashboard) to let every account a
// non-Google OIDC provider signs in reach the dashboard when no allowlist is set. Never
// applies to Google, where any Google account can sign in.
export function isOidcAllowAnyUserEnabled() {
  return process.env.OIDC_ALLOW_ANY_USER === "true";
}

export function isSsoOnlyMode(authMode) {
  return SSO_ONLY_MODES.includes(authMode);
}

export function isSsoEnabled(authMode) {
  return isSsoOnlyMode(authMode) || authMode === "both";
}

export function getSsoType(settings) {
  return settings?.ssoType || (settings?.authMode === "saml" ? "saml" : "oidc");
}

// True when `type` is the SSO method the login page offers for these settings.
export function isSsoTypeEnabled(settings, type) {
  return isSsoEnabled(settings?.authMode) && getSsoType(settings) === type;
}
