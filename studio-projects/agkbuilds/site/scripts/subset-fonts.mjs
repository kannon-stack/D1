#!/usr/bin/env node
// Regenerates the subset fonts (type.md "Delivery", decisions #15). Run from the site folder:
//
//   node scripts/subset-fonts.mjs
//
// Each face is one STATIC instance requested on its own from the Google Fonts CSS2 API with
// `text=` (asking for several instances in one call returns the whole variable font):
//   src/app/fonts/archivo-wide-800.woff2   Archivo wdth 125 / wght 800  (display)
//   src/app/fonts/archivo-400.woff2        Archivo wdth 100 / wght 400  (text)
//   src/app/fonts/archivo-600.woff2        Archivo wdth 100 / wght 600  (buttons, values)
//   src/app/fonts/jetbrains-mono-500.woff2 JetBrains Mono 500           (drafting hand)
//   src/app/og/archivo-wide-800.ttf        same instances as TrueType for next/og (Satori
//   src/app/og/jetbrains-mono-500.ttf      can't read woff2; the API returns TTF without a browser UA)
//
// Character set = printable ASCII (U+0020–U+007E, so any typed address renders) + every non-ASCII
// character found in src/ (literal characters and \uXXXX escapes, in copy, components and CSS;
// comments are included, which only over-covers). The exact list is rewritten into
// src/app/fonts/README.md. Re-run whenever copy or a component adds a character, or that
// character silently falls back to a system font. Needs `curl` (honours HTTPS_PROXY).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const src = path.join(root, "src");
const fontsDir = path.join(src, "app/fonts");
const ogDir = path.join(src, "app/og");
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|css|json|svg)$/.test(e.name)) files.push(p);
  }
})(src);

const extra = new Set();
const add = (ch) => {
  const cp = ch.codePointAt(0);
  if (cp > 0x7e && !/\s/.test(ch)) extra.add(ch);
  if (cp === 0xa0) extra.add(ch); // keep the no-break space
};
for (const f of files) {
  const text = fs.readFileSync(f, "utf8");
  for (const ch of text) add(ch);
  for (const [, hex] of text.matchAll(/\\u([0-9a-fA-F]{4})/g)) add(String.fromCodePoint(parseInt(hex, 16)));
  // HTML entities in JSX (&nbsp; &#8594; &#x2192;)
  const named = { nbsp: " ", copy: "©", middot: "·", rarr: "→", uarr: "↑", darr: "↓", mdash: "—", ndash: "–", rsquo: "’" };
  for (const [, n] of text.matchAll(/&([a-z]+);/g)) if (named[n]) add(named[n]);
  for (const [, x, num] of text.matchAll(/&#(x?)([0-9a-fA-F]+);/g)) add(String.fromCodePoint(parseInt(num, x ? 16 : 10)));
}
const nonAscii = [...extra].sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
let ascii = "";
for (let c = 0x20; c <= 0x7e; c++) ascii += String.fromCharCode(c);
const text = encodeURIComponent(ascii + nonAscii.join(""));

const faces = [
  { family: "Archivo:wdth,wght@125,800", file: "archivo-wide-800" },
  { family: "Archivo:wdth,wght@100,400", file: "archivo-400" },
  { family: "Archivo:wdth,wght@100,600", file: "archivo-600" },
  { family: "JetBrains+Mono:wght@500", file: "jetbrains-mono-500" },
];
const ogFaces = ["archivo-wide-800", "jetbrains-mono-500"];

function fetchFace(family, ua, dest) {
  const args = ["-sSf"];
  if (ua) args.push("-A", ua);
  const css = execFileSync("curl", [...args, `https://fonts.googleapis.com/css2?family=${family}&text=${text}`], {
    encoding: "utf8",
  });
  const urls = [...css.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1]);
  if (urls.length !== 1) throw new Error(`${family}: expected one face, got ${urls.length}`);
  execFileSync("curl", [...args, "-o", dest, urls[0]]);
  console.log(path.relative(root, dest), fs.statSync(dest).size, "bytes");
}

for (const f of faces) {
  fetchFace(f.family, UA, path.join(fontsDir, `${f.file}.woff2`));
  if (ogFaces.includes(f.file)) fetchFace(f.family, null, path.join(ogDir, `${f.file}.ttf`));
}

const name = (ch) => (ch === " " ? "(no-break space)" : ch);
const list = nonAscii.map((ch) => `- U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")} ${name(ch)}`);
const block = `<!-- chars:start -->\nPrintable ASCII U+0020–U+007E, plus these ${nonAscii.length} characters found in \`src/\`:\n\n${list.join("\n")}\n<!-- chars:end -->`;
const readme = path.join(fontsDir, "README.md");
const md = fs.readFileSync(readme, "utf8");
fs.writeFileSync(readme, md.replace(/<!-- chars:start -->[\s\S]*<!-- chars:end -->/, block));
console.log(`${nonAscii.length} non-ASCII characters recorded in src/app/fonts/README.md`);
