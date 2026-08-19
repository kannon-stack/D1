import { NextResponse } from "next/server";
import { createProxyPool } from "@/models";
import {
  buildCloudflareWorkersUrl,
  buildRelayWorkerSource,
  generateRelaySecret,
  isValidCloudflareAccountId,
  normalizeRelayAppName,
  publicProxyPool,
} from "@/lib/network/edgeRelay";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const accountId = typeof body.accountId === "string" ? body.accountId.trim() : "";
    const apiToken = typeof body.apiToken === "string" ? body.apiToken.trim() : "";
    const projectName = normalizeRelayAppName(body.projectName);

    if (!accountId || !apiToken) {
      return jsonError("Cloudflare Account ID and API Token are required");
    }
    if (!isValidCloudflareAccountId(accountId)) {
      return jsonError("Cloudflare Account ID must be 32 hex characters");
    }
    if (!projectName) {
      return jsonError("Worker name must be lowercase letters, numbers, and hyphens");
    }

    const workerScriptUrl = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/workers/scripts/${encodeURIComponent(projectName)}`;
    const authHeaders = { Authorization: `Bearer ${apiToken}` };

    const existsRes = await fetch(workerScriptUrl, { headers: authHeaders });
    if (existsRes.ok) {
      return jsonError(`Worker "${projectName}" already exists. Choose a different name.`, 409);
    }

    const relaySecret = generateRelaySecret();
    const relayCode = buildRelayWorkerSource({ runtime: "cloudflare", secret: relaySecret });

    const formData = new FormData();
    formData.append("index.js", new Blob([relayCode], { type: "application/javascript+module" }), "index.js");
    formData.append("metadata", new Blob([JSON.stringify({
      main_module: "index.js",
      compatibility_date: "2024-03-20",
      observability: { enabled: false },
    })], { type: "application/json" }), "metadata.json");

    const uploadRes = await fetch(workerScriptUrl, {
      method: "PUT",
      headers: authHeaders,
      body: formData,
    });

    if (!uploadRes.ok) {
      console.error("Cloudflare upload error:", uploadRes.status);
      return jsonError("Failed to upload Worker to Cloudflare", uploadRes.status >= 400 ? uploadRes.status : 502);
    }

    await fetch(`${workerScriptUrl}/subdomain`, {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ enabled: true }),
    });

    const subdomainRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/workers/subdomain`,
      { headers: { ...authHeaders, "Content-Type": "application/json" } }
    );

    let deployUrl = "";
    if (subdomainRes.ok) {
      const subdomainData = await subdomainRes.json().catch(() => ({}));
      deployUrl = buildCloudflareWorkersUrl(projectName, subdomainData?.result?.subdomain) || "";
    }

    if (!deployUrl) {
      await fetch(workerScriptUrl, { method: "DELETE", headers: authHeaders }).catch(() => {});
      return jsonError("Worker deployed but the workers.dev subdomain could not be verified");
    }

    const proxyPool = await createProxyPool({
      name: projectName,
      proxyUrl: deployUrl,
      type: "cloudflare",
      noProxy: "",
      isActive: true,
      strictProxy: false,
      relaySecret,
    });

    return NextResponse.json({ proxyPool: publicProxyPool(proxyPool), deployUrl }, { status: 201 });
  } catch (error) {
    console.log("Error deploying Cloudflare relay:", error);
    return jsonError("Deploy failed", 500);
  }
}
