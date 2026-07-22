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
  e2e-2956.db
  e2e-4868.db
  e2e-8696.db
  e2e.db
  lighthouse.db
  performance.db
  release-empty-20260722.db
docs/
  engineering/
  releases/
  accessibility.md
  ai-data-handling.md
  api.md
  architecture.md
  authentication-rbac.md
  data-model.md
  demo-guide.md
  deployment.md
  editorial-workflow.md
  known-limitations.md
  media-security.md
  migrations.md
  performance.md
  rollback-recovery.md
  security-threat-model.md
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
  lighthouse/
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
… 19 more
```
<!-- sinapsi:end -->

**Read this first, and usually only this.** It is the cardinal read at the start of every
patch: the project's shape (above), the last sessions at a glance, and a short recap. Open
`session.md` or `handoff.md` only when this file leaves your actual question unanswered.

## Recent sessions

<!-- The last 10 patches, newest first: `- <timestamp> — <one line>`. Appended by the
     agent at the end of every patch, at the same time it appends session.md. Drop the
     11th; the full history is in session.md and, once archived, in archive/. -->

- 2026-07-22T04:27:00+02:00 — Preserved dot-prefixed performance artifacts in CI.
- 2026-07-22T04:21:56+02:00 — Added reproducible Lighthouse and bundle release evidence.
- 2026-07-22T04:00:33+02:00 — Enforced all release checks and finalized the external-blocker handoff.
- 2026-07-22T03:55:11+02:00 — Published PR #3, proved CI, metadata and external release blockers.
- 2026-07-22T03:48:11+02:00 — Stabilized isolated Playwright runs and passed the complete local release matrix.
- 2026-07-22T03:37:58+02:00 — Replaced legacy product claims with tested release, security and operations evidence.
- 2026-07-22T03:29:49+02:00 — Delivered isolated demo reset, accessibility, visuals and production performance budgets.
- 2026-07-22T03:07:40+02:00 — Delivered verified compensating media and governed explicit AI suggestions.
- 2026-07-22T02:39:02+02:00 — Delivered versioned review, restore, durable scheduling and immutable public publication.
- 2026-07-22T02:13:25+02:00 — Delivered database-backed sessions, RBAC, durable posts and conflict-safe autosave.

## Where things stand

<!-- 5–10 lines, no more. What the project is doing right now, what is in flight, what is
     fragile, what the next action is. Rewritten (not appended) from session.md + handoff.md
     at the end of every patch. If it grows past 10 lines it has stopped being a summary. -->

- Terminal status is EXTERNALLY BLOCKED; P-01–P-17 Verified, P-18 repository work complete.
- Draft PR #3; run `29885689908` passes all source/test/build/Lighthouse steps.
- Local P-15 now includes two direct budgets, six Lighthouse reports and bundle JSON evidence.
- Hidden report artifacts are explicitly included with seven-day CI retention.
- Audit/current-tree scan pass; required history scan fails on known values in `8f83cec`.
- `main` requires all eleven checks with admin enforcement and no force-push/deletion.
- Public GitHub is verified; homepage remains blank because no public v2 is verified.
- Vercel candidate returns HTTP 302 to SSO; production remains old commit `485f037`.
- Owner action: rotate credentials, configure durable runtime/scheduler and expose public URL.
