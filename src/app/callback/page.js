"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/shared/components";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";

// How long to wait for the dashboard to acknowledge the relayed callback
// before keeping this window open with the URL for manual paste.
const ACK_TIMEOUT_MS = 2000;

/**
 * OAuth Callback Page Content
 */
function CallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("processing"); // processing | success | done | manual | error
  const { copied, copy } = useCopyToClipboard();
  const errorParam = searchParams.get("error");
  // Only show a provider error code, never free text from the URL.
  const errorCode = errorParam && /^[a-z0-9_.-]{1,64}$/i.test(errorParam) ? errorParam : null;

  useEffect(() => {
    const code = searchParams.get("code");
    const token = searchParams.get("token");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    const callbackData = {
      code,
      token,
      state,
      error,
      errorDescription,
      fullUrl: window.location.href,
    };

    // Trusted origins that may receive this callback. The OAuth code/state
    // must only be relayed to the dashboard window we expect to be the opener
    // (this server under any loopback alias of the same port) or the Codex
    // helper that listens on a fixed loopback port. Any other origin is
    // treated as hostile (drive-by attacker that opened the popup against
    // the well-known redirect_uri to phish the code).
    const { protocol, port } = window.location;
    const p = port ? `:${port}` : "";
    const expectedOrigins = [...new Set([
      window.location.origin, // Same origin (for most providers)
      `${protocol}//localhost${p}`, // Dashboard opened via another loopback alias
      `${protocol}//127.0.0.1${p}`,
      `${protocol}//[::1]${p}`,
      "http://localhost:1455", // Codex specific port
    ])];

    if (!(code || token || error)) {
      const t = setTimeout(() => setStatus("manual"), 0);
      return () => clearTimeout(t);
    }

    const timers = [];
    let acked = false;
    let channel = null;

    // Close only once the dashboard confirms it received the callback.
    const handleAck = (data) => {
      if (acked || data?.type !== "oauth_callback_ack" || (data.state ?? null) !== state) return;
      acked = true;
      try {
        localStorage.removeItem("oauth_callback");
      } catch { /* storage unavailable */ }
      if (error) return; // keep the error panel up
      setStatus("success");
      timers.push(setTimeout(() => {
        window.close();
        timers.push(setTimeout(() => setStatus("done"), 500));
      }, 1000));
    };
    const handleMessage = (event) => {
      if (expectedOrigins.includes(event.origin)) handleAck(event.data);
    };
    window.addEventListener("message", handleMessage);

    // Method 1: postMessage to opener (popup mode)
    // Send once per expected origin. The browser delivers the message only
    // when the opener's origin matches the targetOrigin we pass — using "*"
    // here would leak the code/state to any opener (e.g. an attacker page
    // that opened this URL in a popup), so iterate over the allowlist.
    if (window.opener) {
      for (const origin of expectedOrigins) {
        try {
          window.opener.postMessage({ type: "oauth_callback", data: callbackData }, origin);
        } catch (e) {
          console.log("postMessage failed:", e);
        }
      }
    }

    // Method 2: BroadcastChannel (same origin tabs); also carries the ack back
    try {
      channel = new BroadcastChannel("oauth_callback");
      channel.onmessage = (event) => handleAck(event.data);
      channel.postMessage(callbackData);
    } catch (e) {
      console.log("BroadcastChannel failed:", e);
    }

    if (error) timers.push(setTimeout(() => setStatus("error"), 0));

    // No ack: leave a localStorage fallback for a dashboard tab that missed
    // both channels, and keep this window open with the URL to paste.
    timers.push(setTimeout(() => {
      if (acked) return;
      try {
        localStorage.setItem("oauth_callback", JSON.stringify({ ...callbackData, timestamp: Date.now() }));
      } catch (e) {
        console.log("localStorage failed:", e);
      }
      if (!error) setStatus("manual");
    }, ACK_TIMEOUT_MS));

    return () => {
      window.removeEventListener("message", handleMessage);
      if (channel) channel.close();
      timers.forEach(clearTimeout);
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center p-8 max-w-md">
        {status === "processing" && (
          <>
            <div className="size-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-primary animate-spin">progress_activity</span>
            </div>
            <h1 className="text-xl font-semibold mb-2">Processing...</h1>
            <p className="text-text-muted">Please wait while we complete the authorization.</p>
          </>
        )}

        {(status === "success" || status === "done") && (
          <>
            <div className="size-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
            </div>
            <h1 className="text-xl font-semibold mb-2">Authorization Successful!</h1>
            <p className="text-text-muted">
              {status === "success" ? "This window will close automatically..." : "You can close this tab now."}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="size-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-red-600">error</span>
            </div>
            <h1 className="text-xl font-semibold mb-2">Authorization Failed</h1>
            <p className="text-text-muted mb-2">
              The provider did not authorize the connection. Close this window and try again from the dashboard.
            </p>
            {errorCode && <code className="text-xs text-red-600">{errorCode}</code>}
          </>
        )}

        {status === "manual" && (
          <>
            <div className="size-16 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-yellow-600">info</span>
            </div>
            <h1 className="text-xl font-semibold mb-2">Copy This URL</h1>
            <p className="text-text-muted mb-4">
              Copy this URL and paste it into the dashboard&apos;s &quot;paste callback URL manually&quot; field.
            </p>
            <div className="bg-surface border border-border rounded-lg p-3 text-left mb-3">
              <code className="text-xs break-all">{typeof window !== "undefined" ? window.location.href : ""}</code>
            </div>
            <Button
              variant="secondary"
              icon={copied === "callback_url" ? "check" : "content_copy"}
              onClick={() => copy(window.location.href, "callback_url")}
              fullWidth
            >
              {copied === "callback_url" ? "Copied" : "Copy URL"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * OAuth Callback Page
 * Receives callback from OAuth providers and sends data back via multiple methods
 */
export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center p-8">
          <div className="size-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-primary animate-spin">progress_activity</span>
          </div>
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
