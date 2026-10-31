#!/usr/bin/env node
// Minimal static file server for a Next.js `output: "export"` folder (`out/`).
// Behaves like a typical static host: clean URLs (`/about` -> about.html), 404.html with a
// 404 status, gzip for text, immutable caching for /_next/static/, revalidation for the rest.
// serve.mjs starts this for exported sites; run it directly only to debug.
//
//   node .claude/studio-tools/scripts/static-server.mjs --dir <site>/out [--port 3100]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { parseArgs } from "../lib/common.mjs";

const args = parseArgs();
if (!args.dir) {
  console.error("Usage: static-server.mjs --dir <out dir> [--port 3100]");
  process.exit(1);
}
const root = path.resolve(String(args.dir));
const port = Number(args.port ?? 3100);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".map": "application/json",
};
const compressible = /^(text\/|application\/(json|xml)|image\/svg)/;

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function resolveFile(urlPath) {
  const rel = decodeURIComponent(urlPath.split("?")[0].split("#")[0]).replace(/^\/+/, "");
  if (rel === "") return isFile(path.join(root, "index.html")) ? path.join(root, "index.html") : null;
  const abs = path.resolve(root, rel);
  if (!abs.startsWith(root + path.sep)) return null; // no path traversal
  return [abs, `${abs}.html`, path.join(abs, "index.html")].find(isFile) ?? null;
}

http
  .createServer((req, res) => {
    let file = null;
    try {
      file = resolveFile(req.url ?? "/");
    } catch {}
    let status = 200;
    if (!file) {
      file = path.join(root, "404.html");
      status = 404;
      if (!isFile(file)) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("Not found");
      }
    }
    const type = types[path.extname(file)] ?? "application/octet-stream";
    const urlPath = (req.url ?? "/").split("?")[0];
    const headers = {
      "Content-Type": type,
      "Cache-Control": urlPath.startsWith("/_next/static/")
        ? "public, max-age=31536000, immutable"
        : "public, max-age=0, must-revalidate",
    };
    let body = fs.readFileSync(file);
    if (compressible.test(type) && /\bgzip\b/.test(String(req.headers["accept-encoding"] ?? ""))) {
      body = zlib.gzipSync(body);
      headers["Content-Encoding"] = "gzip";
      headers.Vary = "Accept-Encoding";
    }
    headers["Content-Length"] = body.length;
    res.writeHead(status, headers);
    res.end(req.method === "HEAD" ? undefined : body);
  })
  .listen(port, () => console.log(`Serving ${root} at http://localhost:${port}`));
