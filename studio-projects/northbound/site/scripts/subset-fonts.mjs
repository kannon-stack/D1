#!/usr/bin/env node
// Regenerates src/app/fonts/archivo-{normal,italic}.woff2: Google Fonts' own variable Archivo
// (wdth 62–125, wght 100–900, normal + italic), requested through the CSS2 API with `text=` so each
// file carries only the glyphs this site sets. Run from the site folder:
//
//   node scripts/subset-fonts.mjs
//
// Character set = printable ASCII (U+0020–U+007E, so typed email addresses always render)
//               + every non-ASCII character in src/ (literal characters and \uXXXX escapes, in copy,
//                 components and assets alike; comments are included, which only over-covers).
// It rewrites the "Characters" block in src/app/fonts/README.md so the recorded list always
// matches the files. Needs `curl` on PATH (it honours HTTPS_PROXY); no npm dependencies.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const src = path.join(root, "src");
const out = path.join(src, "app/fonts");
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|css|json)$/.test(e.name)) files.push(p);
  }
})(src);

const extra = new Set();
for (const f of files) {
  const text = fs.readFileSync(f, "utf8");
  for (const ch of text) if (ch.codePointAt(0) > 0x7e) extra.add(ch);
  for (const [, hex] of text.matchAll(/\\u([0-9a-fA-F]{4})/g)) {
    const ch = String.fromCodePoint(parseInt(hex, 16));
    if (ch.codePointAt(0) > 0x7e) extra.add(ch);
  }
}
const nonAscii = [...extra].sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
let ascii = "";
for (let c = 0x20; c <= 0x7e; c++) ascii += String.fromCharCode(c);
const text = ascii + nonAscii.join("");

const api =
  "https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&text=" +
  encodeURIComponent(text);
const css = execFileSync("curl", ["-sSf", "-A", UA, api], { encoding: "utf8" });
for (const style of ["normal", "italic"]) {
  const block = css.split("@font-face").find((b) => b.includes(`font-style: ${style};`));
  const url = block?.match(/url\((https:[^)]+)\)/)?.[1];
  if (!url) throw new Error(`No ${style} face in the Google Fonts response`);
  execFileSync("curl", ["-sSf", "-A", UA, "-o", path.join(out, `archivo-${style}.woff2`), url]);
  console.log(`archivo-${style}.woff2`, fs.statSync(path.join(out, `archivo-${style}.woff2`)).size, "bytes");
}

const list = nonAscii.map((ch) => `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")} ${ch === " " ? "(no-break space)" : ch}`);
const readme = path.join(out, "README.md");
const block = `<!-- chars:start -->\nPrintable ASCII U+0020–U+007E, plus these ${nonAscii.length} characters found in \`src/\`:\n\n${list.map((l) => `- ${l}`).join("\n")}\n<!-- chars:end -->`;
const md = fs.readFileSync(readme, "utf8");
fs.writeFileSync(
  readme,
  md.includes("<!-- chars:start -->") ? md.replace(/<!-- chars:start -->[\s\S]*<!-- chars:end -->/, block) : `${md.trimEnd()}\n\n## Characters\n\n${block}\n`,
);
console.log(`${nonAscii.length} non-ASCII characters recorded in fonts/README.md`);
