import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from "jose";

const mocks = vi.hoisted(() => ({
  getSettings: vi.fn(),
  setDashboardAuthCookie: vi.fn(),
  cookieValues: {},
  jwks: null,
}));

vi.mock("@/lib/localDb", () => ({ getSettings: mocks.getSettings }));

vi.mock("@/lib/auth/dashboardSession", () => ({
  setDashboardAuthCookie: mocks.setDashboardAuthCookie,
  shouldUseSecureCookie: () => false,
}));

vi.mock("next/server", () => ({
  NextResponse: { redirect: vi.fn((url) => ({ status: 307, url: String(url) })) },
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name) => (name in mocks.cookieValues ? { value: mocks.cookieValues[name] } : undefined),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

// Serve ID-token signing keys locally instead of fetching an IdP's jwks_uri.
vi.mock("jose", async (importOriginal) => {
  const jose = await importOriginal();
  return { ...jose, createRemoteJWKSet: () => mocks.jwks };
});

const { getSsoType, isSsoTypeEnabled } = await import("../../src/lib/auth/authMode.js");
const { isTunnelDashboardBlocked } = await import("../../src/lib/auth/tunnelAccess.js");
const { getOidcRuntimeConfig, verifyOidcIdToken } = await import("../../src/lib/auth/oidc.js");
const { GET: oidcStart } = await import("../../src/app/api/auth/oidc/start/route.js");
const { GET: oidcCallback } = await import("../../src/app/api/auth/oidc/callback/route.js");

const OIDC_SETTINGS = {
  ssoType: "oidc",
  oidcIssuerUrl: "https://accounts.google.com",
  oidcClientId: "client-id",
  oidcClientSecret: "client-secret",
};

function request(url, headers = {}) {
  return { url, headers: new Headers({ host: new URL(url).host, ...headers }) };
}

describe("dashboard auth mode", () => {
  it("enables OIDC for the 'sso' mode the profile page saves", async () => {
    // Regression: "OIDC only" saved authMode "sso", which the login page offered
    // but getOidcRuntimeConfig rejected, bouncing every SSO click back to /login.
    mocks.getSettings.mockResolvedValue({ ...OIDC_SETTINGS, authMode: "sso" });
    await expect(getOidcRuntimeConfig()).resolves.toMatchObject({ clientId: "client-id" });
  });

  it("enables OIDC for 'both' and legacy 'oidc' modes", async () => {
    for (const authMode of ["both", "oidc"]) {
      mocks.getSettings.mockResolvedValue({ ...OIDC_SETTINGS, authMode });
      await expect(getOidcRuntimeConfig()).resolves.not.toBeNull();
    }
  });

  it("keeps OIDC off in password mode or when SAML is the active SSO type", async () => {
    mocks.getSettings.mockResolvedValue({ ...OIDC_SETTINGS, authMode: "password" });
    await expect(getOidcRuntimeConfig()).resolves.toBeNull();
    mocks.getSettings.mockResolvedValue({ ...OIDC_SETTINGS, authMode: "sso", ssoType: "saml" });
    await expect(getOidcRuntimeConfig()).resolves.toBeNull();
  });

  it("resolves the SSO type from ssoType, falling back to the legacy authMode", () => {
    expect(getSsoType({ authMode: "sso", ssoType: "saml" })).toBe("saml");
    expect(getSsoType({ authMode: "saml" })).toBe("saml");
    expect(getSsoType({ authMode: "sso" })).toBe("oidc");
    expect(isSsoTypeEnabled({ authMode: "saml" }, "saml")).toBe(true);
    expect(isSsoTypeEnabled({ authMode: "password", ssoType: "saml" }, "saml")).toBe(false);
  });
});

describe("tunnel dashboard access", () => {
  const settings = { tunnelUrl: "https://abc.trycloudflare.com", tunnelDashboardAccess: false };

  it("blocks only requests on the tunnel host when tunnel access is off", () => {
    expect(isTunnelDashboardBlocked(request("https://abc.trycloudflare.com/login"), settings)).toBe(true);
    expect(isTunnelDashboardBlocked(request("http://localhost:20128/login"), settings)).toBe(false);
    expect(isTunnelDashboardBlocked(request("https://abc.trycloudflare.com/login"), { ...settings, tunnelDashboardAccess: true })).toBe(false);
  });

  it("ignores a malformed tunnel URL instead of throwing", () => {
    expect(isTunnelDashboardBlocked(request("http://localhost/login"), { tunnelUrl: "not a url" })).toBe(false);
  });
});

describe("OIDC routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Vite exposes BASE_URL="/" in tests; getPublicOrigin would treat it as the public URL.
    vi.stubEnv("BASE_URL", "");
    mocks.cookieValues = { oidc_state: "state-1", oidc_nonce: "nonce-1", oidc_code_verifier: "verifier-1" };
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not issue a session on a blocked tunnel host (avoids /login <-> /dashboard loop)", async () => {
    mocks.getSettings.mockResolvedValue({
      ...OIDC_SETTINGS,
      authMode: "sso",
      tunnelUrl: "https://abc.trycloudflare.com",
      tunnelDashboardAccess: false,
    });
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const res = await oidcCallback(request("https://abc.trycloudflare.com/api/auth/oidc/callback?code=c&state=state-1"));

    expect(res.url).toContain("/login?error=tunnel_dashboard_disabled");
    expect(mocks.setDashboardAuthCookie).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("refuses to start sign-in on a blocked tunnel host", async () => {
    mocks.getSettings.mockResolvedValue({
      ...OIDC_SETTINGS,
      authMode: "sso",
      tunnelUrl: "https://abc.trycloudflare.com",
      tunnelDashboardAccess: false,
    });

    const res = await oidcStart(request("https://abc.trycloudflare.com/api/auth/oidc/start"));

    expect(res.url).toContain("/login?error=tunnel_dashboard_disabled");
  });
});

describe("verifyOidcIdToken", () => {
  let privateKey;

  beforeEach(async () => {
    const pair = await generateKeyPair("RS256");
    privateKey = pair.privateKey;
    const jwk = { ...(await exportJWK(pair.publicKey)), kid: "k1", alg: "RS256" };
    mocks.jwks = createLocalJWKSet({ keys: [jwk] });
  });

  function idToken(claims) {
    return new SignJWT(claims)
      .setProtectedHeader({ alg: "RS256", kid: "k1" })
      .setIssuedAt()
      .setExpirationTime("5m")
      .setAudience("client-id")
      .sign(privateKey);
  }

  const verify = (token, nonce = "nonce-1") =>
    verifyOidcIdToken({
      idToken: token,
      issuer: "https://accounts.google.com",
      audience: "client-id",
      jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
      nonce,
    });

  it("accepts Google's scheme-less issuer", async () => {
    const token = await idToken({ iss: "accounts.google.com", nonce: "nonce-1", email: "a@b.c" });
    await expect(verify(token)).resolves.toMatchObject({ email: "a@b.c" });
  });

  it("rejects an id_token whose nonce does not match the login attempt", async () => {
    const token = await idToken({ iss: "https://accounts.google.com", nonce: "someone-elses-nonce" });
    await expect(verify(token)).rejects.toThrow("nonce mismatch");
  });

  it("rejects an id_token without a nonce", async () => {
    const token = await idToken({ iss: "https://accounts.google.com" });
    await expect(verify(token)).rejects.toThrow("nonce mismatch");
  });
});
