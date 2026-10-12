import { describe, it, expect } from "vitest";
import zlib from "node:zlib";
import {
  buildSamlAuthorizeUrl,
  formatX509Certificate,
  isSamlConfigured,
  generateSamlMetadata,
  pickSamlEmail,
  pickSamlDisplayName,
  validateSamlResponse,
} from "../../src/lib/auth/saml.js";
import { mergeWithDefaults } from "../../src/lib/db/repos/settingsRepo.js";

describe("SAML 2.0 Auth Engine Utilities", () => {
  describe("formatX509Certificate", () => {
    it("formats raw Base64 string into standard 64-column PEM block", () => {
      const rawBase64 = "MIIC1234567890123456789012345678901234567890123456789012345678901234567890";
      const formatted = formatX509Certificate(rawBase64);
      expect(formatted).toContain("-----BEGIN CERTIFICATE-----");
      expect(formatted).toContain("-----END CERTIFICATE-----");
      expect(formatted).toContain("MIIC123456789012345678901234567890123456789012345678901234567890");
      expect(formatted).toContain("\n1234567890\n");
    });

    it("cleans existing PEM header/footer and extra whitespace", () => {
      const rawPem = `
        -----BEGIN CERTIFICATE-----
        MIIC123456789012345678901234567890123456789012345678901234567890
        1234567890
        -----END CERTIFICATE-----
      `;
      const formatted = formatX509Certificate(rawPem);
      expect(formatted).toContain("-----BEGIN CERTIFICATE-----");
      expect(formatted.match(/BEGIN CERTIFICATE/g)?.length).toBe(1);
    });

    it("returns empty string for null, undefined, or invalid inputs", () => {
      expect(formatX509Certificate(null)).toBe("");
      expect(formatX509Certificate(undefined)).toBe("");
      expect(formatX509Certificate("   ")).toBe("");
    });
  });

  describe("isSamlConfigured", () => {
    it("returns true when entryPoint and cert are non-empty", () => {
      expect(
        isSamlConfigured({
          samlEntryPoint: "https://idp.example.com/sso",
          samlCert: "dummy-cert",
        })
      ).toBe(true);
    });

    it("returns false if entryPoint or cert is missing", () => {
      expect(isSamlConfigured({ samlEntryPoint: "https://idp.example.com/sso" })).toBe(false);
      expect(isSamlConfigured({ samlCert: "dummy-cert" })).toBe(false);
      expect(isSamlConfigured({})).toBe(false);
    });
  });

  describe("generateSamlMetadata", () => {
    it("generates valid SP XML metadata with Entity ID and ACS binding", () => {
      const settings = {
        samlEntryPoint: "https://idp.example.com/sso",
        samlIssuer: "urn:9router:sp",
        samlCert: "MIIC123456789012345678901234567890123456789012345678901234567890",
      };
      const xml = generateSamlMetadata("https://localhost:20127", settings);
      expect(xml).toContain('entityID="urn:9router:sp"');
      expect(xml).toContain('Location="https://localhost:20127/api/auth/saml/acs"');
      expect(xml).toContain('WantAssertionsSigned="true"');
    });
  });

  describe("InResponseTo Replay Validation", () => {
    const settings = {
      samlEntryPoint: "https://idp.example.com/sso",
      samlCert: "MIIC123456789012345678901234567890123456789012345678901234567890",
    };
    const req = { url: "http://localhost:20128/api/auth/saml/acs", headers: new Headers({ host: "localhost:20128" }) };
    const response = (attrs) => Buffer.from(`<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ID="r1"${attrs}></samlp:Response>`).toString("base64");

    async function issueRequestId() {
      const { authorizeUrl } = await buildSamlAuthorizeUrl(req, settings);
      const deflated = Buffer.from(new URL(authorizeUrl).searchParams.get("SAMLRequest"), "base64");
      return zlib.inflateRawSync(deflated).toString("utf8").match(/ID="([^"]+)"/)[1];
    }

    it("rejects an unsolicited response without InResponseTo", async () => {
      await expect(
        validateSamlResponse(req, { SAMLResponse: response("") }, settings)
      ).rejects.toThrow(/InResponseTo is missing/);
    });

    it("rejects an InResponseTo this server never issued", async () => {
      await expect(
        validateSamlResponse(req, { SAMLResponse: response(' InResponseTo="_unknown"') }, settings)
      ).rejects.toThrow(/InResponseTo is not valid/);
    });

    it("accepts an issued request ID once, so a captured response cannot be replayed", async () => {
      const id = await issueRequestId();
      const samlResponse = response(` InResponseTo="${id}"`);

      // Gets past the InResponseTo check, then fails on the (missing) signature.
      const first = await validateSamlResponse(req, { SAMLResponse: samlResponse }, settings).catch((e) => e);
      expect(first.message).toMatch(/signature/i);

      await expect(
        validateSamlResponse(req, { SAMLResponse: samlResponse }, settings)
      ).rejects.toThrow(/InResponseTo is not valid/);
    });

    it("throws error if samlCert is not configured", async () => {
      await expect(
        validateSamlResponse(req, { SAMLResponse: response("") }, {})
      ).rejects.toThrow(/Certificate/);
    });
  });

  describe("Claims Extraction", () => {
    const mockProfile = {
      email: "user@example.com",
      displayName: "Jane Doe",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": ["custom@example.com"],
      customEmail: "custom-email@example.com",
      customName: "Custom User",
    };

    it("pickSamlEmail extracts custom attribute or common claims", () => {
      expect(pickSamlEmail(mockProfile, {})).toBe("user@example.com");
      expect(
        pickSamlEmail(mockProfile, { samlAttributeEmail: "customEmail" })
      ).toBe("custom-email@example.com");
      expect(
        pickSamlEmail(
          { "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": ["custom@example.com"] },
          {}
        )
      ).toBe("custom@example.com");
    });

    it("pickSamlDisplayName extracts custom attribute, common names, or falls back to email", () => {
      expect(pickSamlDisplayName(mockProfile, {})).toBe("Jane Doe");
      expect(
        pickSamlDisplayName(mockProfile, { samlAttributeName: "customName" })
      ).toBe("Custom User");
      expect(
        pickSamlDisplayName({ email: "user@example.com" }, {})
      ).toBe("user@example.com");
      expect(
        pickSamlDisplayName({ givenName: "Alice", surname: "Smith" }, {})
      ).toBe("Alice Smith");
    });
  });

  describe("Settings Repository Defaults", () => {
    it("mergeWithDefaults safely populates SAML defaults for existing installations", () => {
      const merged = mergeWithDefaults({ authMode: "password" });
      expect(merged.ssoType).toBe("oidc");
      expect(merged.samlIssuer).toBe("urn:9router:sp");
      expect(merged.samlLoginLabel).toBe("Sign in with SAML SSO");
      expect(merged.samlAttributeEmail).toBe("email");
      expect(merged.samlAttributeName).toBe("name");
    });

    it("defaults the OIDC allowlist to empty", () => {
      expect(mergeWithDefaults({}).oidcAllowedEmails).toBe("");
    });
  });
});
