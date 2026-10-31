import path from "node:path";
import type { NextConfig } from "next";

// The studio lives inside another repo: pin the project root.
const root = path.resolve(__dirname);

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
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
