import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = vi.hoisted(() => ({
  getSettings: vi.fn(),
  setDashboardAuthCookie: vi.fn(),
  validateSamlResponse: vi.fn(),
  checkLock: vi.fn(),
  cookieStore: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
}));

vi.mock("@/lib/localDb", () => ({ getSettings: mocks.getSettings }));
vi.mock("@/lib/auth/dashboardSession", () => ({
  setDashboardAuthCookie: mocks.setDashboardAuthCookie,
  shouldUseSecureCookie: () => false,
}));
vi.mock("@/lib/auth/loginLimiter", () => ({
  checkLock: mocks.checkLock,
  recordFail: vi.fn(() => ({ remainingBeforeLock: 4 })),
  recordSuccess: vi.fn(),
  getClientIp: () => "203.0.113.7",
}));
vi.mock("@/lib/auth/saml.js", async (importOriginal) => ({
  ...(await importOriginal()),
  validateSamlResponse: mocks.validateSamlResponse,
}));
vi.mock("next/server", () => ({
  NextResponse: { redirect: vi.fn((url, status = 307) => ({ status, url: String(url) })) },
}));
vi.mock("next/headers", () => ({ cookies: async () => mocks.cookieStore }));

const { POST: acs } = await import("../../src/app/api/auth/saml/acs/route.js");
const { GET: start } = await import("../../src/app/api/auth/saml/start/route.js");
const { GET: metadata } = await import("../../src/app/api/auth/saml/metadata/route.js");

const SAML_SETTINGS = {
  authMode: "sso",
  ssoType: "saml",
  samlEntryPoint: "https://idp.example.com/sso",
  samlCert: "MIIC123456789012345678901234567890123456789012345678901234567890",
};

function acsRequest(form = { SAMLResponse: "PHNhbWw+" }) {
  const body = new FormData();
  for (const [k, v] of Object.entries(form)) body.set(k, v);
  return {
    url: "http://localhost:20127/api/auth/saml/acs",
    headers: new Headers({ host: "router.example.com", "x-forwarded-proto": "https" }),
    formData: async () => body,
  };
}

describe("SAML ACS", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("AUTH_PUBLIC_URL", "");
    vi.stubEnv("BASE_URL", "http://localhost:20128");
    mocks.getSettings.mockResolvedValue(SAML_SETTINGS);
    mocks.checkLock.mockReturnValue({ locked: false });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("redirects to the dashboard with 303 on the browser's origin after a valid assertion", async () => {
    mocks.validateSamlResponse.mockResolvedValue({ email: "you@example.com" });

    const res = await acs(acsRequest());

    expect(res).toEqual({ status: 303, url: "https://router.example.com/dashboard" });
    expect(mocks.setDashboardAuthCookie).toHaveBeenCalledOnce();
    expect(mocks.cookieStore.get).not.toHaveBeenCalledWith("saml_state");
  });

  it("uses 303 and fixed error codes for every failure", async () => {
    mocks.validateSamlResponse.mockRejectedValue(new Error("Invalid document signature"));
    expect(await acs(acsRequest())).toEqual({ status: 303, url: "https://router.example.com/login?error=saml_acs_failed" });

    expect(await acs(acsRequest({}))).toEqual({
      status: 303,
      url: "https://router.example.com/login?error=saml_missing_response",
    });

    mocks.getSettings.mockResolvedValue({ ...SAML_SETTINGS, authMode: "password" });
    expect(await acs(acsRequest())).toEqual({ status: 303, url: "https://router.example.com/login?error=saml_not_configured" });

    mocks.checkLock.mockReturnValue({ locked: true, retryAfter: 30 });
    expect(await acs(acsRequest())).toEqual({ status: 303, url: "https://router.example.com/login?error=saml_rate_limited" });
    expect(mocks.setDashboardAuthCookie).not.toHaveBeenCalled();
  });
});

describe("SAML start and metadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("AUTH_PUBLIC_URL", "");
    vi.stubEnv("BASE_URL", "http://localhost:20128");
    mocks.getSettings.mockResolvedValue(SAML_SETTINGS);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const browserRequest = (path) => ({
    url: `http://0.0.0.0:20128${path}`,
    headers: new Headers({ host: "router.example.com", "x-forwarded-proto": "https" }),
  });

  it("starts sign-in without a saml_state cookie", async () => {
    const res = await start(browserRequest("/api/auth/saml/start"));

    expect(res.url).toMatch(/^https:\/\/idp\.example\.com\/sso\?SAMLRequest=/);
    expect(mocks.cookieStore.set).not.toHaveBeenCalled();
  });

  it("publishes the ACS URL on the browser's origin, not the bind address", async () => {
    const res = await metadata(browserRequest("/api/auth/saml/metadata"));

    expect(await res.text()).toContain('Location="https://router.example.com/api/auth/saml/acs"');
  });
});
