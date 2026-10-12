// Single source of truth for the dashboard auth mode. The profile page saves
// authMode as "password", "sso" or "both"; "oidc" / "saml" are older SSO-only
// values. ssoType ("oidc" | "saml") picks which SSO method is active.

const SSO_ONLY_MODES = ["sso", "oidc", "saml"];

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
