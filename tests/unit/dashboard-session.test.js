import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { SignJWT } from "jose";

const state = vi.hoisted(() => ({ dataDir: "" }));

vi.mock("@/lib/dataDir", () => ({
  get DATA_DIR() {
    return state.dataDir;
  },
}));
vi.mock("@/lib/localDb", () => ({ getSettings: vi.fn() }));

// dashboardSession reads JWT_SECRET once at import, so each case imports a fresh copy.
async function loadSession() {
  vi.resetModules();
  return import("../../src/lib/auth/dashboardSession.js");
}

function forge(secret) {
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(secret));
}

describe("dashboard session secret", () => {
  beforeEach(() => {
    state.dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "9r-session-"));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    fs.rmSync(state.dataDir, { recursive: true, force: true });
  });

  it("ignores the published .env.example JWT_SECRET and uses the generated file", async () => {
    vi.stubEnv("JWT_SECRET", "change-me-to-a-long-random-secret");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { verifyDashboardAuthToken } = await loadSession();

    expect(warn).toHaveBeenCalledOnce();
    expect(fs.existsSync(path.join(state.dataDir, "jwt-secret"))).toBe(true);
    await expect(verifyDashboardAuthToken(await forge("change-me-to-a-long-random-secret"))).resolves.toBe(false);
  });

  it("uses a custom JWT_SECRET as-is", async () => {
    vi.stubEnv("JWT_SECRET", "a-real-secret-0123456789abcdef0123456789");

    const { verifyDashboardAuthToken } = await loadSession();

    await expect(verifyDashboardAuthToken(await forge("a-real-secret-0123456789abcdef0123456789"))).resolves.toBe(true);
    expect(fs.existsSync(path.join(state.dataDir, "jwt-secret"))).toBe(false);
  });

  it("sets the auth cookie for the same 24h the token lasts", async () => {
    vi.stubEnv("JWT_SECRET", "a-real-secret-0123456789abcdef0123456789");
    const { setDashboardAuthCookie } = await loadSession();
    const cookieStore = { set: vi.fn() };

    await setDashboardAuthCookie(cookieStore, { headers: new Headers() });

    expect(cookieStore.set).toHaveBeenCalledWith("auth_token", expect.any(String), expect.objectContaining({ maxAge: 86400 }));
  });

  it("reads the first value of a comma-joined x-forwarded-proto for the Secure flag", async () => {
    vi.stubEnv("JWT_SECRET", "a-real-secret-0123456789abcdef0123456789");
    vi.stubEnv("AUTH_COOKIE_SECURE", "");
    const { shouldUseSecureCookie } = await loadSession();

    expect(shouldUseSecureCookie({ headers: new Headers({ "x-forwarded-proto": "https,http" }) })).toBe(true);
    expect(shouldUseSecureCookie({ headers: new Headers({ "x-forwarded-proto": "http, https" }) })).toBe(false);
  });
});
