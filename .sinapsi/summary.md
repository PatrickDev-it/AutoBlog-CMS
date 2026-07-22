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
  preview/
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
  performance.db
docs/
  engineering/
  accessibility.md
  ai-data-handling.md
  api.md
  architecture.md
  authentication-rbac.md
  data-model.md
  demo-guide.md
  editorial-workflow.md
  media-security.md
  performance.md
drizzle/
  0000_editorial_core.sql
  0001_auth_rate_limit.sql
  0002_media_ai_governance.sql
  0003_demo_reset_idempotency.sql
hooks/
lib/
plugins/
scripts/
  db/
  jobs/
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
  performance/
  unit/
  visual/
types/
ui/
utils/
.env.example
.gitignore
.mcp.json
AGENTS.md
CMS blog.code-workspace
… 18 more
```
<!-- sinapsi:end -->

**Read this first, and usually only this.** It is the cardinal read at the start of every
patch: the project's shape (above), the last sessions at a glance, and a short recap. Open
`session.md` or `handoff.md` only when this file leaves your actual question unanswered.

## Recent sessions

<!-- The last 10 patches, newest first: `- <timestamp> — <one line>`. Appended by the
     agent at the end of every patch, at the same time it appends session.md. Drop the
     11th; the full history is in session.md and, once archived, in archive/. -->

- 2026-07-22T03:29:49+02:00 — Delivered isolated demo reset, accessibility, visuals and production performance budgets.
- 2026-07-22T03:07:40+02:00 — Delivered verified compensating media and governed explicit AI suggestions.
- 2026-07-22T02:39:02+02:00 — Delivered versioned review, restore, durable scheduling and immutable public publication.
- 2026-07-22T02:13:25+02:00 — Delivered database-backed sessions, RBAC, durable posts and conflict-safe autosave.
- 2026-07-22T01:47:42+02:00 — Closed Phase 0 with strict green gates, zero audit findings and legacy-path deletion.
- 2026-07-22T01:34:41+02:00 — Reproduced the baseline and accepted the libSQL/Better Auth modular-monolith foundation.

## Where things stand

<!-- 5–10 lines, no more. What the project is doing right now, what is in flight, what is
     fragile, what the next action is. Rewritten (not appended) from session.md + handoff.md
     at the end of every patch. If it grows past 10 lines it has stopped being a summary. -->

- Phases 0–4 are complete; P-01 through P-17 have executable implementation evidence.
- Owner-only demo reset is workspace-bounded, rate-limited and idempotent; sessions/configured data survive.
- Four-surface axe, keyboard/focus/reduced-motion and six desktop/mobile visual baselines pass.
- Production budgets pass: LCP 180/256 ms, CLS 0, INP upper bound <16 ms and JS 142/221 KB.
- Frozen install, typecheck/lint, 17 unit, 25 integration, 10 E2E, 6 a11y, 5 visual and 2 perf pass.
- Historical provider values in `8f83cec` still require owner rotation; never print or rewrite them.
- Next: truthful release docs/screenshots, final clean gates, GitHub PR/CI/release and live verification.
