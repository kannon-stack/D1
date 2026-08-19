# AGENTS.md

Repo-wide guidance for AI agents. The authoritative development reference is `CLAUDE.md` (commands, architecture, conventions); read it first. `docs/ARCHITECTURE.md` and `open-sse/AGENTS.md` cover the routing engine in depth.

## Cursor Cloud specific instructions

This is 9Router — a Next.js 16 AI routing gateway + dashboard (single service). Standard commands live in `CLAUDE.md`; only the non-obvious, environment-specific notes are captured here.

- Dependencies are already installed by the environment update script (`npm install` at the repo root, plus `npm --prefix tests install` for the separate vitest package). No `better-sqlite3` build tools are required — it is an optional dep with a `sql.js` pure-JS fallback, and `node:sqlite` (Node ≥22.5) is also available.
- Running the dev server: `npm run dev` (Next serves on port **20127** in dev, not 20128). Dashboard is at `/dashboard`, the OpenAI-compatible gateway at `/v1`. Prefer running it in a persistent/tmux terminal so logs stay visible.
- No `.env` is required to run locally. `.env*` is gitignored. Sensible defaults apply: the dashboard login password defaults to `123456` (`INITIAL_PASSWORD`), and `JWT_SECRET` is auto-generated and persisted to `<DATA_DIR>/jwt-secret` on first boot. `DATA_DIR` defaults to `~/.9router`. If you create a `.env` for dev, set `PORT=20127` and a writable `DATA_DIR` (the `.env.example` default `/var/lib/9router` is not writable here). Keep `DATA_DIR` outside the repo tree to avoid polluting `git status`.
- Log in with password `123456` at `/login`; the dashboard then gates on a `auth_token` cookie.
- Lint: `npx eslint .` (a benign "Pages directory cannot be found" warning against `tests/` is expected and does not fail the run).
- Tests: run from `tests/` with `npx vitest run` (ignore the hardcoded Unix paths in `tests/package.json`'s `test` script). The suite is intentionally NOT all-green on a plain checkout — expect a large passing majority plus pre-existing failures. Notable non-environment failures include tests whose expected source exports don't exist yet (e.g. `unit/cursor-agent-proto.test.js` → `encodeAgentValue is not a function`), `unit/embeddings.cloud.test.js` (imports the out-of-repo `cloud/` dir), and `*.live.test.js`/`real/*.real.test.js` (need live provider credentials/network). Treat these as expected red, not regressions you introduced. The `tests/__baseline__/known-fails.txt` baseline is stale relative to the current (larger) suite.
- Gotcha: starting the dev server (or building) regenerates an auto-managed block in `CLAUDE.md` and `AGENTS.md` (Next `agentRules` in `next.config.mjs`, via `node_modules/next/dist/server/lib/generate-agent-files.js`), and running some translator tests can rewrite golden snapshots under `tests/translator/__snapshots__/`. These are auto-generated side effects — do not commit them; `git checkout -- <file>` to discard.
