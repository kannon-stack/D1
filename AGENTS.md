# AGENTS.md

Repo-wide guidance for AI agents. The authoritative development reference is `CLAUDE.md` (commands, architecture, conventions); read it first. `docs/ARCHITECTURE.md` and `open-sse/AGENTS.md` cover the routing engine in depth.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

This is 9Router — a Next.js 16 AI routing gateway + dashboard (single service). Standard commands live in `CLAUDE.md`; only the non-obvious, environment-specific notes are captured here.

- Dependencies are installed by `.cursor/environment.json` `install`: `npm install` at the repo root, plus `npm --prefix tests install` for the separate vitest package. `package-lock.json` is gitignored, so use `npm install` (not `npm ci`). No `better-sqlite3` build tools are required — it is an optional dep with a `sql.js` pure-JS fallback, and `node:sqlite` (Node ≥22.5) is also available.
- A `dev-server` terminal already runs `npm run dev` on port **20127** (Next's `--port 20127` wins over docs that mention 20128). Dashboard is at `/dashboard`, the OpenAI-compatible gateway at `/v1`. Reuse that server; do not start a second `next dev` unless it is down.
- No `.env` is required to run locally. `.env*` is gitignored. Do not copy `.env.example` here — its `DATA_DIR=/var/lib/9router` is not writable. Defaults: dashboard login password `123456` (`INITIAL_PASSWORD`), and `JWT_SECRET` auto-generated to `<DATA_DIR>/jwt-secret` on first boot. `DATA_DIR` defaults to `~/.9router`. If you create a `.env` for dev, set `PORT=20127` and a writable `DATA_DIR` outside the repo tree.
- Log in with password `123456` at `/login`; the dashboard then gates on a `auth_token` cookie.
- Lint: `npx eslint .` (a benign "Pages directory cannot be found" warning against `tests/` is expected and does not fail the run).
- Tests: run from `tests/` with `npx vitest run` (ignore the hardcoded Unix paths in `tests/package.json`'s `test` script). The suite is intentionally NOT all-green on a plain checkout — expect a large passing majority plus pre-existing failures. Judge regressions with `tests/__baseline__/verify-no-regression.mjs`, not a raw run. Notable expected red: `unit/embeddings.cloud.test.js` (imports the out-of-repo `cloud/` dir), `*.live.test.js` / `real/*.real.test.js` (need live provider credentials), and entries in `tests/__baseline__/known-fails.txt` (that list is stale relative to the current larger suite).
- Gotcha: `next dev` upserts the managed `<!-- BEGIN:nextjs-agent-rules -->` block in this file — keep that block committed so the tree stays clean. Running some translator tests can rewrite golden snapshots under `tests/translator/__snapshots__/`. Those are auto-generated side effects — do not commit them unless the snapshot change is the point of your work; `git checkout -- <file>` to discard.
