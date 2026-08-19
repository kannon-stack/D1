import { NextResponse } from "next/server";
import { createProxyPool } from "@/models";
import {
  buildRelayWorkerSource,
  generateRelaySecret,
  normalizeDenoOrgDomain,
  normalizeRelayAppName,
  publicProxyPool,
  resolveDenoRelayUrl,
} from "@/lib/network/edgeRelay";

const DENO_V2_API = "https://api.deno.com/v2";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function deleteDenoApp(appId, denoToken) {
  if (!appId) return;
  await fetch(`${DENO_V2_API}/apps/${encodeURIComponent(appId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${denoToken}` },
  }).catch(() => {});
}

export async function POST(request) {
  try {
    const body = await request.json();
    const denoToken = typeof body.denoToken === "string" ? body.denoToken.trim() : "";
    const orgDomain = normalizeDenoOrgDomain(body.orgDomain);
    const projectName = normalizeRelayAppName(body.projectName);

    if (!orgDomain) {
      return jsonError("Organization domain must look like your-org.deno.net");
    }
    if (!denoToken) {
      return jsonError("Deno Deploy API token is required");
    }
    if (!projectName) {
      return jsonError("App name must be lowercase letters, numbers, and hyphens");
    }

    const headers = {
      Authorization: `Bearer ${denoToken}`,
      "Content-Type": "application/json",
    };

    const createAppRes = await fetch(`${DENO_V2_API}/apps`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        slug: projectName,
        labels: { "custom.kind": "9router-relay" },
        config: {
          install: "deno install",
          runtime: {
            type: "dynamic",
            entrypoint: "main.ts",
          },
        },
      }),
    });

    if (!createAppRes.ok) {
      if (createAppRes.status === 409) {
        return jsonError(`App "${projectName}" already exists. Choose a different name.`, 409);
      }
      return jsonError("Failed to create Deno app", createAppRes.status >= 400 ? createAppRes.status : 502);
    }

    const app = await createAppRes.json().catch(() => ({}));
    const relaySecret = generateRelaySecret();
    const relayCode = buildRelayWorkerSource({ runtime: "deno", secret: relaySecret });

    const deployRes = await fetch(`${DENO_V2_API}/apps/${encodeURIComponent(app.id)}/deploy`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        assets: {
          "main.ts": {
            kind: "file",
            content: relayCode,
            encoding: "utf-8",
          },
        },
      }),
    });

    if (!deployRes.ok) {
      console.error("Deno Deploy error:", deployRes.status);
      await deleteDenoApp(app.id, denoToken);
      return jsonError("Deploy failed", deployRes.status >= 400 ? deployRes.status : 502);
    }

    const revision = await deployRes.json().catch(() => ({}));
    const revisionId = revision.id;

    let status = revision.status;
    let attempts = 0;
    const maxAttempts = 30;
    let latestRevision = revision;
    while (status === "queued" || status === "building") {
      if (attempts >= maxAttempts) {
        await deleteDenoApp(app.id, denoToken);
        return jsonError("Deploy timed out", 500);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const statusRes = await fetch(`${DENO_V2_API}/revisions/${encodeURIComponent(revisionId)}`, {
        headers: { Authorization: `Bearer ${denoToken}` },
      });
      if (!statusRes.ok) break;
      latestRevision = await statusRes.json().catch(() => latestRevision);
      status = latestRevision.status;
      attempts++;
    }

    if (status !== "succeeded") {
      await deleteDenoApp(app.id, denoToken);
      return jsonError("Deploy failed", 500);
    }

    let latestApp = app;
    const appRes = await fetch(`${DENO_V2_API}/apps/${encodeURIComponent(app.id)}`, {
      headers: { Authorization: `Bearer ${denoToken}` },
    });
    if (appRes.ok) {
      latestApp = await appRes.json().catch(() => app);
    }

    const deployUrl = resolveDenoRelayUrl({
      app: latestApp,
      revision: latestRevision,
      projectName,
      orgDomain,
    });
    if (!deployUrl) {
      await deleteDenoApp(app.id, denoToken);
      return jsonError("Deploy succeeded but the Deno URL could not be verified");
    }

    const proxyPool = await createProxyPool({
      name: projectName,
      proxyUrl: deployUrl,
      type: "deno",
      noProxy: "",
      isActive: true,
      strictProxy: false,
      relaySecret,
    });

    return NextResponse.json({ proxyPool: publicProxyPool(proxyPool), deployUrl }, { status: 201 });
  } catch (error) {
    console.log("Error deploying Deno Deploy relay:", error);
    return jsonError("Deploy failed", 500);
  }
}
