# Summary

<!-- Sinapsi keeps the directory tree below current on its own — on every build, and live
     from the watcher whenever a file or folder is created, moved or deleted. There is no
     command to run and nothing to ask an agent to do. Do not edit between its markers;
     your edits are replaced. Everything else in this file is yours. -->

<!-- sinapsi:start v0.2.6 — kept current automatically by Sinapsi — refreshed on every build and by the watcher whenever files or folders are created, moved or deleted. No command to run; edits between these markers are replaced -->
```
_client/
  @inset/
  @sidebar/
actions/
app/
  (workspace)/
  @inset/
  @sidebar/
  api/
  sign-in/
  favicon.ico
  globals.css
  icon.png
  layout.tsx
  page.tsx
components/
  chat/
  groups/
  webapp/
config/
  css/
constants/
data/
  tests/
  autoblog.db
  e2e.db
docs/
  engineering/
  api.md
  architecture.md
  authentication-rbac.md
  data-model.md
drizzle/
  0000_editorial_core.sql
  0001_auth_rate_limit.sql
hooks/
lib/
plugins/
public/
  auth/
  demo/
  ai.png
  ai.svg
  file.svg
  globe.svg
  iphone.png
  logo.png
  logo.svg
  window.svg
scripts/
  db/
  security/
src/
  modules/
  platform/
  ui/
test-results/
  .last-run.json
tests/
  accessibility/
  e2e/
  integration/
  unit/
types/
ui/
utils/
.env.example
.gitignore
.mcp.json
AGENTS.md
… 17 more
```
<!-- sinapsi:end -->

**Read this first, and usually only this.** It is the cardinal read at the start of every
patch: the project's shape (above), the last sessions at a glance, and a short recap. Open
`session.md` or `handoff.md` only when this file leaves your actual question unanswered.

## Recent sessions

<!-- The last 10 patches, newest first: `- <timestamp> — <one line>`. Appended by the
     agent at the end of every patch, at the same time it appends session.md. Drop the
     11th; the full history is in session.md and, once archived, in archive/. -->

- 2026-07-22T01:34:41+02:00 — Reproduced the baseline and accepted the libSQL/Better Auth modular-monolith foundation.
- 2026-07-22T01:47:42+02:00 — Closed Phase 0 with strict green gates, zero audit findings and legacy-path deletion.
- 2026-07-22T02:13:25+02:00 — Delivered database-backed sessions, RBAC, durable posts and conflict-safe autosave.

## Where things stand

<!-- 5–10 lines, no more. What the project is doing right now, what is in flight, what is
     fragile, what the next action is. Rewritten (not appended) from session.md + handoff.md
     at the end of every patch. If it grows past 10 lines it has stopped being a summary. -->

- Phase 1 is complete on `feat/rfc-editorial-cms`: one Drizzle/libSQL persistence boundary serves demo and configured modes.
- Better Auth database sessions derive workspace identity; the complete five-role policy matrix is enforced server-side.
- Protected list/create/edit, immutable revisions and expected-version conflict handling are live in the workspace UI.
- Frozen install, strict typecheck/lint, 9 unit, 5 integration, build, zero audit findings and 5 E2E/axe tests pass.
- Two checksum-verified migrations and validated idempotent seed/setup reproduce the database from empty.
- Historical provider values in `8f83cec` still require owner rotation; never print them or rewrite history.
- Next: editorial transitions, history/diff/restore, durable publication jobs and immutable public preview.
