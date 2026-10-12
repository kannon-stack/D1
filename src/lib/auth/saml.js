import { SAML } from "@node-saml/node-saml";
import { getPublicOrigin } from "./publicOrigin.js";

// How long an AuthnRequest ID stays valid for its response.
const SAML_REQUEST_TTL_MS = 10 * 60 * 1000;
// /api/auth/saml/start is unauthenticated, so a flood of starts must not grow memory
// without limit; past the cap the oldest pending sign-ins are dropped (and can retry).
const SAML_CACHE_MAX_ENTRIES = 10_000;

// Implements the cacheProvider interface node-saml calls (saveAsync/getAsync/removeAsync).
// saveAsync returns null for an existing key with no await in between, so it doubles as
// an atomic "claim".
export function createBoundedSamlCache(ttlMs = SAML_REQUEST_TTL_MS, maxEntries = SAML_CACHE_MAX_ENTRIES) {
  const entries = new Map(); // key -> { createdAt, value }, oldest first
  const prune = (now) => {
    for (const [key, entry] of entries) {
      if (now < entry.createdAt + ttlMs) break;
      entries.delete(key);
    }
  };
  return {
    async saveAsync(key, value) {
      const now = Date.now();
      prune(now);
      if (entries.has(key)) return null;
      while (entries.size >= maxEntries) entries.delete(entries.keys().next().value);
      const entry = { createdAt: now, value };
      entries.set(key, entry);
      return entry;
    },
    async getAsync(key) {
      prune(Date.now());
      return entries.get(key)?.value ?? null;
    },
    async removeAsync(key) {
      if (key == null || !entries.has(key)) return null;
      entries.delete(key);
      return key;
    },
  };
}

// createSamlInstance builds a new SAML object per request, so the AuthnRequest IDs must
// live in one module-level cache for the ACS to find them; validateInResponseTo "always"
// rejects unsolicited (IdP-initiated) responses. node-saml only drops an ID when the
// assertion's SubjectConfirmationData repeats it, so samlConsumedIds makes every
// InResponseTo single-use regardless. Kept on `global` so dev reloads and separate route
// bundles share them; per process, which matches the single-process server.
const samlRequestCache = (global.__samlRequestCache ??= createBoundedSamlCache());
const samlConsumedIds = (global.__samlConsumedIds ??= createBoundedSamlCache());

/**
 * Formats a raw Base64 string or unformatted X.509 certificate into standard PEM format.
 * @param {string} certStr
 * @returns {string}
 */
export function formatX509Certificate(certStr) {
  if (!certStr || typeof certStr !== "string") return "";
  const clean = certStr
    .replace(/-----BEGIN CERTIFICATE-----/gi, "")
    .replace(/-----END CERTIFICATE-----/gi, "")
    .replace(/[^A-Za-z0-9+/=]/g, "");

  if (!clean) return "";

  const lines = clean.match(/.{1,64}/g) || [];
  return `-----BEGIN CERTIFICATE-----\n${lines.join("\n")}\n-----END CERTIFICATE-----`;
}

/**
 * Checks whether SAML configuration has essential parameters (entryPoint & cert).
 * @param {object} settings
 * @returns {boolean}
 */
export function isSamlConfigured(settings) {
  return Boolean(settings?.samlEntryPoint && settings?.samlCert);
}

/**
 * Creates a configured `@node-saml/node-saml` SAML instance with security defaults.
 * @param {object} settings
 * @param {string} origin
 * @returns {SAML}
 */
const DUMMY_FALLBACK_CERT =
  "-----BEGIN CERTIFICATE-----\nMIIC...DUMMY...\n-----END CERTIFICATE-----";

export function createSamlInstance(settings, origin) {
  const cert = formatX509Certificate(settings?.samlCert || "") || DUMMY_FALLBACK_CERT;
  const callbackUrl = `${origin}/api/auth/saml/acs`;
  return new SAML({
    entryPoint: settings?.samlEntryPoint || "https://example.com/sso",
    issuer: settings?.samlIssuer || "urn:9router:sp",
    idpCert: cert,
    cert: cert,
    callbackUrl: callbackUrl,
    acceptedClockSkewMs: 60000,
    wantAssertionsSigned: true,
    validateInResponseTo: "always",
    requestIdExpirationPeriodMs: SAML_REQUEST_TTL_MS,
    cacheProvider: samlRequestCache,
  });
}

/**
 * Builds SAML AuthnRequest redirect URL and returns { authorizeUrl }.
 * The request ID is stored in the shared request cache for the ACS to check.
 * @param {Request} request
 * @param {object} settings
 * @returns {Promise<{ authorizeUrl: string }>}
 */
export async function buildSamlAuthorizeUrl(request, settings) {
  const origin = getPublicOrigin(request);
  const samlInstance = createSamlInstance(settings, origin);

  const xml = await samlInstance.generateAuthorizeRequestAsync(false, false);
  const authorizeUrl = await samlInstance._requestToUrlAsync(xml, null, "authorize", {});

  return { authorizeUrl };
}

/**
 * Validates SAML POST response from IdP ACS callback and returns user profile.
 * InResponseTo must name an unused AuthnRequest from buildSamlAuthorizeUrl.
 * @param {Request} request
 * @param {object} body - Parsed form body or object containing SAMLResponse
 * @param {object} settings
 * @returns {Promise<object>}
 */
export async function validateSamlResponse(request, body, settings) {
  if (!settings?.samlCert) {
    throw new Error("IdP X.509 Certificate (samlCert) is missing or not configured");
  }

  const origin = getPublicOrigin(request);
  const samlInstance = createSamlInstance(settings, origin);

  const container = typeof body === "object" && body !== null ? body : { SAMLResponse: body };
  const rawSamlResponse = container.SAMLResponse;

  if (!rawSamlResponse) {
    throw new Error("Missing SAMLResponse parameter in assertion POST body");
  }

  const result = await samlInstance.validatePostResponseAsync({ SAMLResponse: rawSamlResponse });
  const profile = result?.profile || result;

  const requestId = profile?.inResponseTo;
  if (!requestId || !(await samlConsumedIds.saveAsync(requestId, true))) {
    throw new Error("SAML response was already used or does not answer a sign-in request");
  }
  await samlRequestCache.removeAsync(requestId);

  return profile;
}

/**
 * Generates standard SP XML Metadata.
 * @param {string} origin
 * @param {object} settings
 * @returns {string}
 */
export function generateSamlMetadata(origin, settings) {
  const samlInstance = createSamlInstance(settings, origin);
  return samlInstance.generateServiceProviderMetadata();
}

/**
 * Extracts email claim from SAML profile assertion.
 * @param {object} profile
 * @param {object} settings
 * @returns {string}
 */
export function pickSamlEmail(profile = {}, settings = {}) {
  if (!profile) return "";

  // 1. Configured custom attribute
  const customAttr = settings.samlAttributeEmail;
  if (customAttr && profile[customAttr]) {
    const val = profile[customAttr];
    return Array.isArray(val) ? val[0] : String(val);
  }

  // 2. Common email claims
  const emailKeys = [
    "email",
    "emailAddress",
    "mail",
    "nameID",
    "nameId",
    "upn",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn",
  ];

  for (const key of emailKeys) {
    if (profile[key]) {
      const val = profile[key];
      return Array.isArray(val) ? val[0] : String(val);
    }
  }

  // 3. Fallback: check attributes object if present
  if (profile.attributes) {
    for (const key of emailKeys) {
      if (profile.attributes[key]) {
        const val = profile.attributes[key];
        return Array.isArray(val) ? val[0] : String(val);
      }
    }
  }

  return "";
}

/**
 * Extracts display name claim from SAML profile assertion.
 * @param {object} profile
 * @param {object} settings
 * @returns {string}
 */
export function pickSamlDisplayName(profile = {}, settings = {}) {
  if (!profile) return "";

  // 1. Configured custom attribute
  const customAttr = settings.samlAttributeName;
  if (customAttr && profile[customAttr]) {
    const val = profile[customAttr];
    return Array.isArray(val) ? val[0] : String(val);
  }

  // 2. Common name claims
  const nameKeys = [
    "displayName",
    "name",
    "cn",
    "commonName",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
  ];

  for (const key of nameKeys) {
    if (profile[key]) {
      const val = profile[key];
      return Array.isArray(val) ? val[0] : String(val);
    }
  }

  // 3. Combined givenName + surname
  if (profile.givenName || profile.sn || profile.surname) {
    const given = profile.givenName || "";
    const surname = profile.sn || profile.surname || "";
    const combined = `${given} ${surname}`.trim();
    if (combined) return combined;
  }

  // 4. Fallback to email
  return pickSamlEmail(profile, settings);
}
