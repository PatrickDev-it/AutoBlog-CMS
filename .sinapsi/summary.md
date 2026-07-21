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
docs/
  engineering/
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
  security/
src/
  platform/
test-results/
  .last-run.json
tests/
  accessibility/
  e2e/
  unit/
types/
ui/
utils/
.env.example
.gitignore
.mcp.json
AGENTS.md
CMS blog.code-workspace
FEATURES.md
… 14 more
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

## Where things stand

<!-- 5–10 lines, no more. What the project is doing right now, what is in flight, what is
     fragile, what the next action is. Rewritten (not appended) from session.md + handoff.md
     at the end of every patch. If it grows past 10 lines it has stopped being a summary. -->

- Phase 0 is complete on `feat/rfc-editorial-cms`; all unsafe legacy routes/simulators are deleted.
- Frozen install, strict typecheck, zero-warning lint, unit, build, audit, E2E and axe pass locally.
- Next.js 16.2.11/React 19.2.8 are pinned; runtime audit reports zero vulnerabilities.
- `.env.local` is removed; current-tree secret scanning passes and pinned independent CI jobs exist.
- Historical provider values in `8f83cec` still require rotation; never print them or rewrite history.
- `/` is the recruiter landing page; `/sign-in` is explicitly a Phase 1 placeholder.
- Next: Drizzle schema/migrations, Better Auth, workspace RBAC and durable create/edit persistence.
