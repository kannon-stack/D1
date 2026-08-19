import { NextResponse } from "next/server";
import { createProxyPool } from "@/models";
import {
  buildRelayWorkerSource,
  buildVercelRelayUrl,
  generateRelaySecret,
  normalizeRelayAppName,
  publicProxyPool,
} from "@/lib/network/edgeRelay";

const VERCEL_API = "https://api.vercel.com";

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function pollDeployment(deploymentId, token, maxMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const res = await fetch(`${VERCEL_API}/v13/deployments/${encodeURIComponent(deploymentId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Deployment failed");
    const data = await res.json();
    if (data.readyState === "READY") return data;
    if (data.readyState === "ERROR" || data.readyState === "CANCELED") {
      throw new Error("Deployment failed");
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("Deployment timed out");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const vercelToken = typeof body.vercelToken === "string" ? body.vercelToken.trim() : "";
    const projectName = normalizeRelayAppName(body.projectName);

    if (!vercelToken) return jsonError("Vercel API token is required");
    if (!projectName) return jsonError("App name must be lowercase letters, numbers, and hyphens");

    const existsRes = await fetch(`${VERCEL_API}/v9/projects/${encodeURIComponent(projectName)}`, {
      headers: { Authorization: `Bearer ${vercelToken}` },
    });
    if (existsRes.ok) {
      return jsonError(`Project "${projectName}" already exists. Choose a different name.`, 409);
    }

    const relaySecret = generateRelaySecret();
    const relayCode = buildRelayWorkerSource({ runtime: "vercel", secret: relaySecret });

    const deployRes = await fetch(`${VERCEL_API}/v13/deployments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName,
        files: [
          { file: "api/relay.js", data: relayCode },
          { file: "package.json", data: JSON.stringify({ name: projectName, version: "1.0.0" }) },
          {
            file: "vercel.json",
            data: JSON.stringify({
              rewrites: [{ source: "/(.*)", destination: "/api/relay" }],
            }),
          },
        ],
        projectSettings: { framework: null },
        target: "production",
      }),
    });

    if (!deployRes.ok) {
      return jsonError("Failed to create Vercel deployment", deployRes.status >= 400 ? deployRes.status : 502);
    }

    const deployment = await deployRes.json();
    const deploymentId = deployment.id || deployment.uid;
    const projectId = deployment.projectId || projectName;

    await fetch(`${VERCEL_API}/v9/projects/${encodeURIComponent(projectId)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ssoProtection: null }),
    });

    const ready = await pollDeployment(deploymentId, vercelToken);
    const deployUrl = buildVercelRelayUrl(ready.url);
    if (!deployUrl) return jsonError("Deployment succeeded but the Vercel URL was invalid");

    const proxyPool = await createProxyPool({
      name: projectName,
      proxyUrl: deployUrl,
      type: "vercel",
      noProxy: "",
      isActive: true,
      strictProxy: false,
      relaySecret,
    });

    return NextResponse.json({ proxyPool: publicProxyPool(proxyPool), deployUrl }, { status: 201 });
  } catch (error) {
    console.log("Error deploying Vercel relay:", error);
    return jsonError("Deploy failed", 500);
  }
}
