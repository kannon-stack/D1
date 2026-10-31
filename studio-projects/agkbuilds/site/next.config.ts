import path from "node:path";
import type { NextConfig } from "next";

// The studio lives inside another repo: pin the project root.
const root = path.resolve(__dirname);

const nextConfig: NextConfig = {
  /* config options here */
  // create-next-app generated `cacheComponents: true` and `partialPrefetching: true`. Both are
  // removed (deviation from merge-don't-replace, reported to the Director): with
  // `output: "export"`, Next 16.4.3 requires `dynamic = "force-static"` on the Open Graph image
  // route, and rejects that same export when cacheComponents is on, so the two cannot coexist.
  // partialPrefetching requires cacheComponents. Neither does anything for a fully static page.
  // Static page (brief, decisions #7): `next build` writes plain files to out/. No server code.
  output: "export",
  images: { unoptimized: true },
  // Data, not copy (layout-spec): the © year is computed once, at build time.
  env: { BUILD_YEAR: String(new Date().getFullYear()) },
  turbopack: {
    root,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  outputFileTracingRoot: root,
};

export default nextConfig;
