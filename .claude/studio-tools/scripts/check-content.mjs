#!/usr/bin/env node
// Validates a studio project's written content before the Builder uses it.
// The Copywriter has no shell, so nobody else parses its output.
//
//   node .claude/studio-tools/scripts/check-content.mjs studio-projects/<slug>
//
// Checks (exit 1 on any error):
//   1. every ```yaml block in content/copy.md and content/metadata.md parses,
//      and every ```json block (JSON-LD) parses
//   2. slot coverage: each `section.slot` the layout spec references has a key in
//      copy.md, and each copy key is referenced by the spec (the latter is a warning)
//   3. the `# used/budget` comments in copy.md are honest: the counted text really
//      has `used` characters, and `used` does not exceed `budget`
//   4. metadata limits: title ≤ 60, description ≤ 155 characters
//   5. banned words, lorem ipsum, unresolved [NEEDS FACT], "!" in headlines
// Budgets stated in design/layout-spec.md are NOT machine-checked (their notation
// varies); the Copywriter reconciles them and the Critic checks the rendered wrap.
import fs from "node:fs";
import path from "node:path";
import { tryRequire } from "../lib/common.mjs";

const YAML = tryRequire("yaml");
if (!YAML) {
  console.error("The `yaml` package is missing. Run: node .claude/studio-tools/scripts/doctor.mjs --install");
  process.exit(1);
}

const project = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!project) {
  console.error("Usage: check-content.mjs <project dir, e.g. studio-projects/northbound>");
  process.exit(1);
}
const read = (rel) => {
  const file = path.join(project, rel);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
};

const errors = [];
const warnings = [];
const error = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

// ---- markdown → sections with fenced blocks -------------------------------
function sectionsOf(md) {
  const sections = [{ name: "(top)", blocks: [] }];
  const lines = md.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const heading = lines[i].match(/^##\s+`?([^`\n]+?)`?\s*(?:\(.*\))?\s*$/);
    if (heading) {
      sections.push({ name: heading[1].trim(), blocks: [] });
      continue;
    }
    const fence = lines[i].match(/^```(\w+)\s*$/);
    if (fence) {
      const body = [];
      let j = i + 1;
      while (j < lines.length && !/^```\s*$/.test(lines[j])) body.push(lines[j++]);
      sections[sections.length - 1].blocks.push({ lang: fence[1], text: body.join("\n"), line: i + 2 });
      i = j;
    }
  }
  return sections;
}

const BANNED = [
  "revolutionary", "seamless", "unlock", "elevate", "leverage", "cutting-edge", "game-changer", "next-level",
  "world-class", "best-in-class", "innovative", "empower", "synergy", "robust", "in today's fast-paced world",
  "look no further", "we're passionate about",
];
const bannedRe = new RegExp(`\\b(${BANNED.map((w) => w.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|")})`, "i");

function walk(value, trail, visit) {
  if (typeof value === "string") visit(trail, value);
  else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${trail}[${i}]`, visit));
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) walk(v, trail ? `${trail}.${k}` : k, visit);
}

// ---- copy.md ---------------------------------------------------------------
const copyMd = read("studio/content/copy.md");
const copyKeys = new Map(); // section -> Set of top-level keys
if (!copyMd) {
  error("studio/content/copy.md not found");
} else {
  for (const section of sectionsOf(copyMd)) {
    for (const block of section.blocks) {
      if (block.lang !== "yaml") continue;
      let data;
      try {
        data = YAML.parse(block.text);
      } catch (err) {
        error(`copy.md · ${section.name} (line ${block.line}): YAML does not parse: ${String(err.message).split("\n")[0]}`);
        continue;
      }
      if (data && typeof data === "object" && !Array.isArray(data)) {
        const keys = copyKeys.get(section.name) || new Set();
        for (const k of Object.keys(data)) keys.add(k);
        copyKeys.set(section.name, keys);
        walk(data, "", (trail, text) => {
          const hit = text.match(bannedRe);
          if (hit) error(`copy.md · ${section.name}.${trail}: banned word "${hit[1]}"`);
          if (/lorem ipsum/i.test(text)) error(`copy.md · ${section.name}.${trail}: lorem ipsum`);
          if (/\[NEEDS FACT/i.test(text)) warn(`copy.md · ${section.name}.${trail}: unresolved [NEEDS FACT]`);
          if (/headline/i.test(trail) && text.includes("!")) error(`copy.md · ${section.name}.${trail}: exclamation mark in a headline`);
        });
      }
    }
  }

  // `# used/budget` comments on single-line quoted values: check they are honest.
  const lineRe = /^\s*(?:-\s+)?(?:text:|[\w-]+:)\s*("(?:[^"\\]|\\.)*"|'(?:[^']|'')*')\s+#\s*(\d+)\s*\/\s*(\d+)(.*)$/;
  copyMd.split("\n").forEach((line, i) => {
    const m = line.match(lineRe);
    if (!m) return;
    let text;
    try {
      text = YAML.parse(m[1]);
    } catch {
      return;
    }
    const used = Number(m[2]);
    const budget = Number(m[3]);
    const perLine = /per line/i.test(m[4]);
    const parts = String(text).split("\n");
    const actual = perLine ? Math.max(...parts.map((p) => p.length)) : String(text).length;
    if (actual !== used) warn(`copy.md line ${i + 1}: comment says ${used}, the text is ${actual} characters`);
    if (used > budget) error(`copy.md line ${i + 1}: ${used} characters is over its own budget of ${budget}`);
  });
}

// ---- metadata.md -------------------------------------------------------------
const metaMd = read("studio/content/metadata.md");
if (!metaMd) {
  error("studio/content/metadata.md not found");
} else {
  for (const section of sectionsOf(metaMd)) {
    for (const block of section.blocks) {
      if (block.lang === "json") {
        try {
          const ld = JSON.parse(block.text);
          // A single typed object, or a top-level @context with an @graph of typed objects.
          const nodes = Array.isArray(ld["@graph"]) ? ld["@graph"] : [ld];
          if (!ld["@context"]) warn(`metadata.md (line ${block.line}): JSON-LD has no @context`);
          if (nodes.some((n) => !n["@type"])) warn(`metadata.md (line ${block.line}): a JSON-LD node has no @type`);
        } catch (err) {
          error(`metadata.md (line ${block.line}): JSON does not parse: ${err.message}`);
        }
      } else if (block.lang === "yaml") {
        try {
          const data = YAML.parse(block.text);
          if (data?.title && String(data.title).length > 60) error(`metadata.md: title is ${String(data.title).length} characters (max 60)`);
          if (data?.description && String(data.description).length > 155) error(`metadata.md: description is ${String(data.description).length} characters (max 155)`);
        } catch (err) {
          error(`metadata.md (line ${block.line}): YAML does not parse: ${String(err.message).split("\n")[0]}`);
        }
      }
    }
  }
}

// ---- slot coverage against the layout spec -----------------------------------
const spec = read("studio/design/layout-spec.md");
if (!spec) {
  warn("studio/design/layout-spec.md not found: slot coverage not checked");
} else if (copyKeys.size) {
  const referenced = new Map(); // "section.key" -> true
  for (const m of spec.matchAll(/`([a-z][a-z0-9-]*)\.([a-z_][a-z0-9_]*)(?:[.[][^`]*)?`/g)) {
    if (copyKeys.has(m[1])) referenced.set(`${m[1]}.${m[2]}`, true);
  }
  const missing = [...referenced.keys()].filter((slot) => {
    const [section, key] = slot.split(".");
    return !copyKeys.get(section).has(key);
  });
  for (const slot of missing) {
    error(`layout-spec.md references \`${slot}\` but copy.md has no such key (a slot with no copy, or a data overlay that is not a slot)`);
  }
  // The spec often names slots relatively inside a section's own part (`.plans[].name`,
  // `.styles[].label`), so a key counts as referenced if it appears in either form there.
  const regions = new Map();
  const parts = spec.split(/^## /m).slice(1);
  for (const part of parts) {
    const head = part.split("\n")[0];
    for (const section of copyKeys.keys()) {
      if (new RegExp(`\`${section}\``).test(head)) regions.set(section, part);
    }
  }
  for (const [section, keys] of copyKeys) {
    if (section === "(top)") continue;
    const region = regions.get(section) ?? spec;
    for (const key of keys) {
      const relative = new RegExp(`[\`.]${key}(?![a-z0-9_-])`);
      if (!referenced.has(`${section}.${key}`) && !relative.test(region)) {
        warn(`copy.md has \`${section}.${key}\` but layout-spec.md never references it (dead copy, or an option such as headline_options)`);
      }
    }
  }
}

// ---- report ------------------------------------------------------------------
const sectionCount = copyKeys.size;
console.log(`Checked ${project}: ${sectionCount} copy sections.`);
for (const w of warnings) console.log(`warning: ${w}`);
for (const e of errors) console.log(`ERROR:   ${e}`);
console.log(
  errors.length
    ? `\n${errors.length} error(s), ${warnings.length} warning(s). Route each error to the bot that owns the file.`
    : `\nNo errors (${warnings.length} warning(s)). Note: budgets in layout-spec.md are not machine-checked.`
);
process.exit(errors.length ? 1 : 0);
