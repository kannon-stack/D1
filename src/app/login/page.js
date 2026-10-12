"use client";

import { useState, useEffect } from "react";
import { Card, Button, Input } from "@/shared/components";
import { isSsoEnabled as isSsoAuthMode } from "@/lib/auth/authMode";

// SSO/OIDC/SAML routes redirect back here with ?error=<code>.
const LOGIN_ERROR_MESSAGES = {
  oidc_not_configured: "OIDC sign-in is not enabled or its configuration is incomplete.",
  oidc_invalid_state: "The sign-in attempt expired or was started from a different address. Please try again.",
  oidc_missing_code: "The identity provider did not return an authorization code. Please try again.",
  oidc_start_failed: "Could not start OIDC sign-in. Check the server log for details.",
  oidc_callback_failed: "OIDC sign-in failed. Check the server log for details.",
  oidc_email_not_allowed: "This account is not allowed to sign in to this dashboard.",
  oidc_allowlist_required: "Google sign-in is turned off until allowed emails are set in Profile → OIDC.",
  saml_not_configured: "SAML sign-in is not enabled or its configuration is incomplete.",
  saml_missing_response: "The identity provider did not return a SAML response. Please try again.",
  saml_start_failed: "Could not start SAML sign-in. Check the server log for details.",
  saml_acs_failed: "SAML sign-in failed. Check the server log for details.",
  saml_rate_limited: "Too many failed sign-in attempts. Please wait and try again.",
  access_denied: "Sign-in was cancelled or denied by the identity provider.",
  tunnel_dashboard_disabled: "Dashboard access via tunnel is disabled.",
};

// Never echo free text from the URL: unknown values are shown only when they
// look like an error code, so a crafted link cannot put a sentence on this page.
function loginErrorMessage(code) {
  if (LOGIN_ERROR_MESSAGES[code]) return LOGIN_ERROR_MESSAGES[code];
  if (/^[a-z0-9_.-]{1,64}$/i.test(code)) return `Sign-in failed (${code}).`;
  return "Sign-in failed. Check the server log for details.";
}

const STATUS_TIMEOUT_MS = 10000;

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ssoError, setSsoError] = useState("");
  const [resetHint, setResetHint] = useState("");
  const [retryAfter, setRetryAfter] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState(null);
  const [tunnelBlocked, setTunnelBlocked] = useState(false);
  const [statusError, setStatusError] = useState(false);
  const [retrying, setRetrying] = useState(false);
  // Bumped by the Retry button to re-run the status check.
  const [statusAttempt, setStatusAttempt] = useState(0);
  const [authMode, setAuthMode] = useState("password");
  const [ssoType, setSsoType] = useState("oidc");
  const [oidcConfigured, setOidcConfigured] = useState(false);
  const [oidcLoginLabel, setOidcLoginLabel] = useState("Sign in with OIDC");
  const [samlConfigured, setSamlConfigured] = useState(false);
  const [samlLoginLabel, setSamlLoginLabel] = useState("Sign in with SAML SSO");

  // Countdown for rate-limit
  useEffect(() => {
    if (retryAfter <= 0) return;
    const id = setInterval(() => setRetryAfter((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [retryAfter]);

  useEffect(() => {
    let urlError = null;
    if (statusAttempt === 0) {
      urlError = new URLSearchParams(window.location.search).get("error");
      // Drop the error from the URL so a refresh starts clean.
      if (urlError) window.history.replaceState(null, "", window.location.pathname);
    }

    async function checkAuth() {
      const controller = new AbortController();
      // The timeout also covers reading the body.
      const timeoutId = setTimeout(() => controller.abort(), STATUS_TIMEOUT_MS);

      try {
        const res = await fetch("/api/auth/status", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = res.ok ? await res.json() : null;

        // Non-OK (503) or a degraded fallback payload: the sign-in options are
        // unknown, so don't silently assume password mode.
        if (!data || data.degraded === true) {
          setStatusError(true);
          setHasPassword(true);
          return;
        }
        setStatusError(false);
        // The dashboard guard sends tunnel-blocked requests back here, so
        // redirecting to /dashboard would loop forever on the spinner.
        if (data.tunnelBlocked === true) {
          setTunnelBlocked(true);
          setHasPassword(!!data.hasPassword);
          return;
        }
        if (data.authenticated === true || data.requireLogin === false) {
          // replace() keeps this bounce page out of history.
          window.location.replace("/dashboard");
          return;
        }
        setHasPassword(!!data.hasPassword);
        setAuthMode(data.authMode || "password");
        setSsoType(data.ssoType || "oidc");
        setOidcConfigured(data.oidcConfigured === true);
        setOidcLoginLabel(data.oidcLoginLabel || "Sign in with OIDC");
        setSamlConfigured(data.samlConfigured === true);
        setSamlLoginLabel(data.samlLoginLabel || "Sign in with SAML SSO");
      } catch (err) {
        // Timeout, network error or unreadable body.
        setStatusError(true);
        setHasPassword(true);
      } finally {
        clearTimeout(timeoutId);
        setRetrying(false);
        if (urlError) setSsoError(loginErrorMessage(urlError));
      }
    }
    checkAuth();
  }, [statusAttempt]);

  // A page restored from the back/forward cache keeps its old state (e.g. the
  // spinner before a redirect), so load it again.
  useEffect(() => {
    const onPageShow = (e) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const handleRetryStatus = () => {
    setRetrying(true);
    setStatusAttempt((n) => n + 1);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResetHint("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        window.location.assign("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Invalid password");
        if (data.resetHint) setResetHint(data.resetHint);
        if (data.retryAfter) setRetryAfter(Number(data.retryAfter));
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOidcLogin = () => {
    window.location.href = "/api/auth/oidc/start";
  };

  const handleSamlLogin = () => {
    window.location.href = "/api/auth/saml/start";
  };

  // The status route already resolves ssoType from authMode + ssoType.
  const isSsoEnabled = isSsoAuthMode(authMode);
  const ssoLabel = ssoType === "saml" ? "SAML SSO" : "OIDC";

  const samlAvailable = !tunnelBlocked && isSsoEnabled && ssoType === "saml" && samlConfigured;
  const oidcAvailable = !tunnelBlocked && isSsoEnabled && ssoType === "oidc" && oidcConfigured;
  const ssoAvailable = samlAvailable || oidcAvailable;

  // When the status check failed, keep the password form for recovery.
  const passwordAvailable = !tunnelBlocked && (statusError || authMode === "password" || authMode === "both" || !ssoAvailable);

  // Show loading state while checking password
  if (hasPassword === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-text-muted mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4 relative overflow-hidden">
      {/* Faint grid background */}
      <div className="landing-grid absolute inset-0 pointer-events-none" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">9Router</h1>
          <p className="text-text-muted">
            {tunnelBlocked
              ? "Dashboard access via tunnel is disabled"
              : samlAvailable
              ? "Sign in with SAML 2.0 Single Sign-On"
              : oidcAvailable
              ? "Sign in with your OIDC provider to access the dashboard"
              : "Enter your password to access the dashboard"}
          </p>
        </div>

        <Card>
          <div className="flex flex-col gap-4">
            {ssoError && <p className="text-xs text-red-500 text-center">{ssoError}</p>}

            {statusError && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-red-500 text-center">Could not load sign-in options.</p>
                <Button type="button" variant="secondary" size="sm" loading={retrying} onClick={handleRetryStatus}>
                  Retry
                </Button>
              </div>
            )}

            {tunnelBlocked && (
              <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                Open the dashboard on the host machine, or enable dashboard access via tunnel in settings.
              </p>
            )}

            {samlAvailable && (
              <Button type="button" variant="primary" className="w-full" onClick={handleSamlLogin}>
                {samlLoginLabel}
              </Button>
            )}

            {oidcAvailable && (
              <Button type="button" variant="primary" className="w-full" onClick={handleOidcLogin}>
                {oidcLoginLabel}
              </Button>
            )}

            {(ssoAvailable || statusError) && passwordAvailable && <div className="h-px bg-border/60" />}

            {passwordAvailable && (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                {isSsoEnabled && !ssoAvailable && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                    {ssoLabel} login is enabled, but configuration is incomplete{ssoType === "oidc" ? " (Google sign-in also needs allowed emails in Profile → OIDC)" : ""}. Password login is still available for recovery.
                  </p>
                )}

                {authMode === "both" && ssoAvailable && (
                  <p className="text-xs text-text-muted text-center">
                    Password and {ssoLabel} login are both enabled.
                  </p>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus={!oidcAvailable}
                  />
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  {retryAfter > 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Locked. Retry in <span className="font-mono">{retryAfter}s</span>.
                    </p>
                  )}
                  {resetHint && (
                    <p className="text-xs text-text-muted">
                      Forgot password? Open <code className="bg-sidebar px-1 rounded">9router</code> CLI on the host → <b>Settings</b> → <b>Reset Password to Default</b>.
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={loading}
                  disabled={retryAfter > 0}
                >
                  {retryAfter > 0 ? `Wait ${retryAfter}s` : "Login"}
                </Button>

                {hasPassword === false && (
                  <>
                    <p className="text-xs text-center text-text-muted mt-2">
                      Default password is <code className="bg-sidebar px-1 rounded">123456</code>
                    </p>
                    <p className="text-xs text-center text-amber-600 dark:text-amber-400">
                      Security risk: no password set. Remote logins with the default password are refused until you change it from the host machine.
                    </p>
                  </>
                )}
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
