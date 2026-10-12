import { getSettings } from "@/lib/localDb";
import { generateSamlMetadata } from "@/lib/auth/saml";
import { getPublicOrigin } from "@/lib/auth/publicOrigin";

export async function GET(request) {
  try {
    const settings = await getSettings();
    // request.url carries the bind host (0.0.0.0 / localhost), not the browser's origin.
    const origin = getPublicOrigin(request);
    const metadataXml = generateSamlMetadata(origin, settings);

    return new Response(metadataXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    return new Response(`<?xml version="1.0"?><Error>${error.message || "Failed to generate metadata"}</Error>`, {
      status: 500,
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }
}
