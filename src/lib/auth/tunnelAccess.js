function hostnameOf(url) {
  if (!url) return "";
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function isTunnelRequest(request, settings) {
  const host = (request?.headers?.get?.("host") || "").split(":")[0].toLowerCase();
  if (!host) return false;
  const tunnelHost = hostnameOf(settings?.tunnelUrl);
  const tailscaleHost = hostnameOf(settings?.tailscaleUrl);
  return (!!tunnelHost && host === tunnelHost) || (!!tailscaleHost && host === tailscaleHost);
}

// Dashboard access through a tunnel/tailscale URL is off unless explicitly enabled.
// Every login method must honor this, or the dashboard guard bounces the new
// session back to /login and the login page sends it straight back.
export function isTunnelDashboardBlocked(request, settings) {
  return settings?.tunnelDashboardAccess !== true && isTunnelRequest(request, settings);
}
