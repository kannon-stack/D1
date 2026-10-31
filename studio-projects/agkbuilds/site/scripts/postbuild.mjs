#!/usr/bin/env node
// Runs after `next build` (package.json "build"). Decisions #13: no absolute URL unless the domain
// is known. Next always resolves file-convention social images (opengraph-image.tsx) against a
// metadataBase, falling back to http://localhost:3000 when none is set, so without
// NEXT_PUBLIC_SITE_URL this rewrites those URLs to root-relative paths ("/opengraph-image?…") in
// every exported HTML file and RSC payload, then fails the build if any of these remain:
// "localhost", a canonical link or og:url. With NEXT_PUBLIC_SITE_URL set, it only checks that
// no "localhost" slipped in.
// R1-07: the export writes the OG image as an extensionless file, which static hosts serve as
// application/octet-stream. This also writes out/opengraph-image.png (same bytes) and points
// og:image / twitter:image at it, in both modes, and fails if any meta tag still uses the old path.
import fs from "node:fs";
import path from "node:path";

const out = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../out");
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

const ogSrc = path.join(out, "opengraph-image");
if (!fs.existsSync(ogSrc)) {
  console.error("postbuild: out/opengraph-image is missing");
  process.exit(1);
}
fs.copyFileSync(ogSrc, path.join(out, "opengraph-image.png"));

// GitHub Pages runs Jekyll, which skips underscore folders: without .nojekyll /_next/* would 404.
const nojekyll = path.join(out, ".nojekyll");
fs.writeFileSync(nojekyll, "");
if (!fs.existsSync(nojekyll)) {
  console.error("postbuild: could not write out/.nojekyll");
  process.exit(1);
}

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (p !== path.join(out, "_next")) walk(p);
    } else if (/\.(html|txt)$/.test(e.name)) files.push(p);
  }
})(out);

let rewritten = 0;
const problems = [];
for (const f of files) {
  let s = fs.readFileSync(f, "utf8");
  // og:image / twitter:image → /opengraph-image.png, dropping Next's ?<hash> cache key
  const png = s.replace(/\/opengraph-image(?:\.png)?(?:\?[\w-]+)?(?=["\\])/g, "/opengraph-image.png");
  if (png !== s) {
    s = png;
    fs.writeFileSync(f, s);
  }
  if (/\/opengraph-image(?!\.png)(?=[?"])/.test(s)) problems.push(`${path.relative(out, f)}: extensionless OG image URL`);
  if (/\/opengraph-image\.png\?/.test(s)) problems.push(`${path.relative(out, f)}: query string on the OG image URL`);
  if (!siteUrl) {
    const next = s.replace(/https?:\/\/localhost(?::\d+)?(?=\/)/g, "");
    if (next !== s) {
      rewritten++;
      s = next;
      fs.writeFileSync(f, s);
    }
    if (/rel="canonical"|"rel":"canonical"/.test(s)) problems.push(`${path.relative(out, f)}: canonical link`);
    if (/og:url/.test(s)) problems.push(`${path.relative(out, f)}: og:url`);
  }
  if (/localhost/.test(s)) problems.push(`${path.relative(out, f)}: "localhost"`);
}
if (problems.length) {
  console.error(`postbuild: absolute-URL check failed:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(
  siteUrl
    ? `postbuild: site URL ${siteUrl}; og:image → opengraph-image.png; .nojekyll written; ${files.length} files checked, no localhost`
    : `postbuild: no NEXT_PUBLIC_SITE_URL; og:image → /opengraph-image.png (root-relative) in ${rewritten} files; .nojekyll written; no localhost, canonical or og:url in ${files.length} files`,
);
