// Origin the browser uses to reach this server, for every browser-facing auth URL
// (OIDC redirect_uri, SAML ACS/metadata, post-login and error redirects).
// BASE_URL / NEXT_PUBLIC_BASE_URL are deliberately ignored: they are the internal
// sync URL (usually http://localhost:20128), not the address the browser is on.

function trimTrailingSlashes(value) {
  return (value || "").trim().replace(/\/+$/, "");
}

// Chained proxies append to forwarded headers ("https,http"); the first hop is the client's.
function firstHeaderValue(request, name) {
  return (request?.headers?.get?.(name) || "").split(",")[0].trim();
}

export function getPublicOrigin(request) {
  const configured = trimTrailingSlashes(process.env.AUTH_PUBLIC_URL);
  if (configured) {
    try {
      const { protocol, origin } = new URL(configured);
      if (protocol === "http:" || protocol === "https:") return origin;
    } catch {
      // Not an absolute URL (e.g. "router.example.com"): fall back to the request.
    }
    console.warn("[auth] AUTH_PUBLIC_URL is not a valid http(s) URL; ignoring it");
  }

  const requestUrl = new URL(request.url);
  const host = firstHeaderValue(request, "x-forwarded-host") || firstHeaderValue(request, "host");
  if (host) {
    const protocol = (firstHeaderValue(request, "x-forwarded-proto") || requestUrl.protocol).replace(/:$/, "");
    try {
      return new URL(`${protocol}://${host}`).origin;
    } catch {
      // Malformed forwarded values: fall back to the URL the server saw.
    }
  }

  return requestUrl.origin;
}
