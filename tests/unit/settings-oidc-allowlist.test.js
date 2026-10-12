import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  stored: {},
  json: vi.fn((body, init) => ({ status: init?.status || 200, body })),
}));

vi.mock("next/server", () => ({ NextResponse: { json: mocks.json } }));
vi.mock("@/lib/localDb", async () => {
  const { mergeWithDefaults } = await import("../../src/lib/db/repos/settingsRepo.js");
  return {
    getSettings: vi.fn(async () => mergeWithDefaults(mocks.stored)),
    updateSettings: vi.fn(async (updates) => {
      mocks.stored = { ...mocks.stored, ...updates };
      return mergeWithDefaults(mocks.stored);
    }),
  };
});
vi.mock("@/lib/network/outboundProxy", () => ({ applyOutboundProxyEnv: vi.fn() }));
vi.mock("open-sse/services/combo.js", () => ({ resetComboRotation: vi.fn() }));

const { GET, PATCH } = await import("../../src/app/api/settings/route.js");

const patch = (body) => PATCH({ json: async () => body });

describe("/api/settings oidcAllowedEmails", () => {
  beforeEach(() => {
    mocks.stored = {};
  });

  it("defaults to an empty list", async () => {
    expect((await GET()).body.oidcAllowedEmails).toBe("");
  });

  it("persists the list via PATCH and returns it from GET", async () => {
    const res = await patch({ oidcAllowedEmails: "  you@gmail.com, @example.com\n" });

    expect(res.body.oidcAllowedEmails).toBe("you@gmail.com, @example.com");
    expect((await GET()).body.oidcAllowedEmails).toBe("you@gmail.com, @example.com");
  });

  it("stores an array as one string", async () => {
    await patch({ oidcAllowedEmails: ["you@gmail.com", "@example.com"] });

    expect(mocks.stored.oidcAllowedEmails).toBe("you@gmail.com, @example.com");
  });
});

describe("/api/settings authPublicOrigin", () => {
  it("reports the origin the auth routes will use, so the profile page shows the real redirect URI", async () => {
    vi.stubEnv("AUTH_PUBLIC_URL", "");
    const res = await GET({ url: "http://0.0.0.0:20128/api/settings", headers: new Headers({ host: "192.168.1.5:20128" }) });
    vi.unstubAllEnvs();

    expect(res.body.authPublicOrigin).toBe("http://192.168.1.5:20128");
  });
});
