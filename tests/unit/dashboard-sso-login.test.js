import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from "jose";

const mocks = vi.hoisted(() => ({
  getSettings: vi.fn(),
  setDashboardAuthCookie: vi.fn(),
  cookieValues: {},
  deleteCookie: vi.fn(),
  jwks: null,
}));

vi.mock("@/lib/localDb", () => ({ getSettings: mocks.getSettings, validateApiKey: vi.fn(async () => false) }));

vi.mock("@/lib/auth/dashboardSession", () => ({
  setDashboardAuthCookie: mocks.setDashboardAuthCookie,
  shouldUseSecureCookie: () => false,
}));

vi.mock("next/server", () => ({
  NextResponse: {
    redirect: vi.fn((url) => ({ status: 307, url: String(url) })),
    json: vi.fn((body, init) => ({ status: init?.status || 200, body })),
  },
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name) => (name in mocks.cookieValues ? { value: mocks.cookieValues[name] } : undefined),
    set: vi.fn(),
    delete: mocks.deleteCookie,
  }),
}));

// Serve ID-token signing keys locally instead of fetching an IdP's jwks_uri.
vi.mock("jose", async (importOriginal) => {
  const jose = await importOriginal();
  return { ...jose, createRemoteJWKSet: () => mocks.jwks };
});

const { getSsoType, isSsoTypeEnabled } = await import("../../src/lib/auth/authMode.js");
const { isTunnelDashboardBlocked } = await import("../../src/lib/auth/tunnelAccess.js");
const { checkOidcAllowedIdentity, getOidcRuntimeConfig, verifyOidcIdToken } = await import("../../src/lib/auth/oidc.js");
const { GET: oidcStart } = await import("../../src/app/api/auth/oidc/start/route.js");
const { GET: oidcCallback } = await import("../../src/app/api/auth/oidc/callback/route.js");
const { isOidcLoginUsable } = await import("../../src/lib/auth/oidc.js");
const { POST: passwordLogin } = await import("../../src/app/api/auth/login/route.js");
const bcrypt = (await import("bcryptjs")).default;

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

  it("sends Google the browser's origin, not the internal BASE_URL", async () => {
    vi.stubEnv("BASE_URL", "http://localhost:20128");
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "http://localhost:20128");
    mocks.getSettings.mockResolvedValue({ ...OIDC_SETTINGS, authMode: "sso" });
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ authorization_endpoint: "https://accounts.google.com/o/oauth2/v2/auth" }))
    );

    const res = await oidcStart(request("http://localhost:20127/api/auth/oidc/start", {
      host: "router.example.com",
      "x-forwarded-proto": "https",
    }));

    const redirectUri = new URL(res.url).searchParams.get("redirect_uri");
    expect(redirectUri).toBe("https://router.example.com/api/auth/oidc/callback");
    fetchSpy.mockRestore();
  });

  it("redirects with a fixed code, not the exception text, when sign-in cannot start", async () => {
    mocks.getSettings.mockResolvedValue({ ...OIDC_SETTINGS, authMode: "sso" });
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("getaddrinfo ENOTFOUND idp.internal"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await oidcStart(request("http://localhost:20128/api/auth/oidc/start"));

    expect(res.url).toBe("http://localhost:20128/login?error=oidc_start_failed");
    expect(errorSpy).toHaveBeenCalled();
    fetchSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("passes a code-shaped IdP error through but replaces free text", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const denied = await oidcCallback(request("http://localhost:20128/api/auth/oidc/callback?error=access_denied"));
    const spoofed = await oidcCallback(request(
      `http://localhost:20128/api/auth/oidc/callback?error=${encodeURIComponent("Server moved. Sign in at https://evil.example")}`
    ));

    expect(denied.url).toBe("http://localhost:20128/login?error=access_denied");
    expect(spoofed.url).toBe("http://localhost:20128/login?error=oidc_callback_failed");
    errorSpy.mockRestore();
  });

  it("keeps a newer attempt's cookies when a stale callback has the wrong state", async () => {
    const res = await oidcCallback(request("http://localhost:20128/api/auth/oidc/callback?code=c&state=stale"));

    expect(res.url).toContain("/login?error=oidc_invalid_state");
    expect(mocks.deleteCookie).not.toHaveBeenCalled();
  });
});

describe("OIDC allowlist", () => {
  const google = { issuer: "https://accounts.google.com" };
  const corp = { issuer: "https://idp.example.com" };
  const verified = (email) => ({ email, email_verified: true });

  it("requires a list for Google", () => {
    expect(checkOidcAllowedIdentity(verified("you@gmail.com"), { ...google, allowedEmails: "" })).toBe("oidc_allowlist_required");
    expect(checkOidcAllowedIdentity(verified("you@gmail.com"), { issuer: "accounts.google.com", allowedEmails: " " }))
      .toBe("oidc_allowlist_required");
  });

  it("lets other issuers through with an empty list", () => {
    expect(checkOidcAllowedIdentity({ email: "a@example.com" }, { ...corp, allowedEmails: "" })).toBeNull();
  });

  it("matches exact emails and @domain entries, case-insensitively", () => {
    const allowedEmails = "You@Gmail.com,\n @Example.com  other@corp.io";
    expect(checkOidcAllowedIdentity(verified("you@gmail.com"), { ...google, allowedEmails })).toBeNull();
    expect(checkOidcAllowedIdentity(verified("Alice@EXAMPLE.com"), { ...google, allowedEmails })).toBeNull();
    expect(checkOidcAllowedIdentity(verified("stranger@gmail.com"), { ...google, allowedEmails })).toBe("oidc_email_not_allowed");
    // A domain entry must match the whole domain, not a suffix.
    expect(checkOidcAllowedIdentity(verified("eve@evil-example.com"), { ...google, allowedEmails })).toBe("oidc_email_not_allowed");
    expect(checkOidcAllowedIdentity(verified("eve@sub.example.com"), { ...google, allowedEmails })).toBe("oidc_email_not_allowed");
  });

  it("requires a verified email", () => {
    const allowedEmails = "you@gmail.com";
    // Google must assert email_verified: true.
    expect(checkOidcAllowedIdentity({ email: "you@gmail.com" }, { ...google, allowedEmails })).toBe("oidc_email_not_allowed");
    expect(checkOidcAllowedIdentity({ email: "you@gmail.com", email_verified: false }, { ...google, allowedEmails }))
      .toBe("oidc_email_not_allowed");
    // Other issuers are rejected only when they say the email is unverified.
    expect(checkOidcAllowedIdentity({ email: "you@gmail.com" }, { ...corp, allowedEmails })).toBeNull();
    expect(checkOidcAllowedIdentity({ email: "you@gmail.com", email_verified: false }, { ...corp, allowedEmails }))
      .toBe("oidc_email_not_allowed");
    expect(checkOidcAllowedIdentity({ email_verified: true }, { ...corp, allowedEmails })).toBe("oidc_email_not_allowed");
  });
});

describe("OIDC callback allowlist", () => {
  let privateKey;
  let fetchSpy;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.stubEnv("BASE_URL", "");
    mocks.cookieValues = { oidc_state: "state-1", oidc_nonce: "nonce-1", oidc_code_verifier: "verifier-1" };
    const pair = await generateKeyPair("RS256");
    privateKey = pair.privateKey;
    const jwk = { ...(await exportJWK(pair.publicKey)), kid: "k1", alg: "RS256" };
    mocks.jwks = createLocalJWKSet({ keys: [jwk] });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    fetchSpy?.mockRestore();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  async function signIn(claims, allowedEmails) {
    mocks.getSettings.mockResolvedValue({ ...OIDC_SETTINGS, authMode: "sso", oidcAllowedEmails: allowedEmails });
    const idToken = await new SignJWT({ iss: "https://accounts.google.com", nonce: "nonce-1", sub: "1", ...claims })
      .setProtectedHeader({ alg: "RS256", kid: "k1" })
      .setIssuedAt()
      .setExpirationTime("5m")
      .setAudience("client-id")
      .sign(privateKey);
    fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      if (String(url).endsWith("/.well-known/openid-configuration")) {
        return new Response(JSON.stringify({
          issuer: "https://accounts.google.com",
          token_endpoint: "https://oauth2.googleapis.com/token",
          jwks_uri: "https://www.googleapis.com/oauth2/v3/certs",
        }));
      }
      return new Response(JSON.stringify({ id_token: idToken }));
    });
    return oidcCallback(request("http://localhost:20128/api/auth/oidc/callback?code=c&state=state-1"));
  }

  it("signs in a listed, verified Google account", async () => {
    const res = await signIn({ email: "you@gmail.com", email_verified: true }, "you@gmail.com");

    expect(res.url).toBe("http://localhost:20128/dashboard");
    expect(mocks.setDashboardAuthCookie).toHaveBeenCalledOnce();
  });

  it("refuses any Google account while the list is empty", async () => {
    const res = await signIn({ email: "you@gmail.com", email_verified: true }, "");

    expect(res.url).toBe("http://localhost:20128/login?error=oidc_allowlist_required");
    expect(mocks.setDashboardAuthCookie).not.toHaveBeenCalled();
  });

  it("refuses a Google account that is not on the list", async () => {
    const res = await signIn({ email: "stranger@gmail.com", email_verified: true }, "you@gmail.com");

    expect(res.url).toBe("http://localhost:20128/login?error=oidc_email_not_allowed");
    expect(mocks.setDashboardAuthCookie).not.toHaveBeenCalled();
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

describe("Google OIDC-only install without an allowlist (upgrade path)", () => {
  it("does not count Google OIDC as usable until allowed emails are set", () => {
    expect(isOidcLoginUsable({ ...OIDC_SETTINGS })).toBe(false);
    expect(isOidcLoginUsable({ ...OIDC_SETTINGS, oidcAllowedEmails: "me@gmail.com" })).toBe(true);
    expect(isOidcLoginUsable({ ...OIDC_SETTINGS, oidcIssuerUrl: "https://auth.example.com" })).toBe(true);
  });

  it("keeps password login open so the admin is not locked out", async () => {
    // Before allowlists existed, "OIDC only" + Google was a valid setup; after upgrading
    // every Google sign-in is refused, so password login must still work.
    mocks.getSettings.mockResolvedValue({
      ...OIDC_SETTINGS,
      authMode: "sso",
      password: bcrypt.hashSync("admin-pw", 4),
    });

    const res = await passwordLogin({
      url: "http://localhost:20128/api/auth/login",
      headers: new Headers({ host: "localhost:20128" }),
      json: async () => ({ password: "admin-pw" }),
    });

    expect(res.status).toBe(200);
    expect(mocks.setDashboardAuthCookie).toHaveBeenCalled();
  });

  it("still blocks password login once the allowlist makes Google sign-in usable", async () => {
    mocks.getSettings.mockResolvedValue({
      ...OIDC_SETTINGS,
      authMode: "sso",
      oidcAllowedEmails: "me@gmail.com",
      password: bcrypt.hashSync("admin-pw", 4),
    });

    const res = await passwordLogin({
      url: "http://localhost:20128/api/auth/login",
      headers: new Headers({ host: "localhost:20128" }),
      json: async () => ({ password: "admin-pw" }),
    });

    expect(res.status).toBe(403);
  });
});
