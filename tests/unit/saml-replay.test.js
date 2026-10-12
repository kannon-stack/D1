import { describe, it, expect, vi, afterEach } from "vitest";
import { SAML } from "@node-saml/node-saml";
import { createBoundedSamlCache, validateSamlResponse } from "../../src/lib/auth/saml.js";

const SETTINGS = { samlEntryPoint: "https://idp.example.com/sso", samlCert: "MIIBdummy" };
const REQUEST = { url: "http://localhost:20128/api/auth/saml/acs", headers: new Headers({ host: "localhost:20128" }) };

describe("SAML replay protection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts a validated response once and rejects the same InResponseTo again", async () => {
    // node-saml keeps the request ID when SubjectConfirmationData omits InResponseTo,
    // so validateSamlResponse itself must make each ID single-use.
    vi.spyOn(SAML.prototype, "validatePostResponseAsync")
      .mockResolvedValue({ profile: { inResponseTo: "_replay-test-id", email: "a@example.com" } });

    await expect(validateSamlResponse(REQUEST, { SAMLResponse: "x" }, SETTINGS)).resolves.toMatchObject({ email: "a@example.com" });
    await expect(validateSamlResponse(REQUEST, { SAMLResponse: "x" }, SETTINGS)).rejects.toThrow(/already used/);
  });

  it("rejects a validated response that answers no sign-in request", async () => {
    vi.spyOn(SAML.prototype, "validatePostResponseAsync").mockResolvedValue({ profile: { email: "a@example.com" } });

    await expect(validateSamlResponse(REQUEST, { SAMLResponse: "x" }, SETTINGS)).rejects.toThrow(/sign-in request/);
  });
});

describe("createBoundedSamlCache", () => {
  it("evicts the oldest pending ID once the cap is reached", async () => {
    const cache = createBoundedSamlCache(60_000, 3);
    for (const id of ["a", "b", "c", "d"]) await cache.saveAsync(id, "t");

    expect(await cache.getAsync("a")).toBeNull();
    expect(await cache.getAsync("d")).toBe("t");
  });

  it("refuses to save an existing key, which makes saveAsync an atomic claim", async () => {
    const cache = createBoundedSamlCache(60_000, 10);

    expect(await cache.saveAsync("id", "t")).not.toBeNull();
    expect(await cache.saveAsync("id", "t")).toBeNull();
  });

  it("expires entries after the TTL", async () => {
    vi.useFakeTimers();
    try {
      const cache = createBoundedSamlCache(1_000, 10);
      await cache.saveAsync("id", "t");
      vi.advanceTimersByTime(1_001);
      expect(await cache.getAsync("id")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
