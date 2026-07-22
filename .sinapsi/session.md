# Session log

Operational changelog, append-only, chronological order — never delete previous entries.

Every entry must include: timestamp, patch goal, changes made + files touched, breaking changes, regressions introduced/removed, validation performed, final status.

Append this first — before rewriting `handoff.md`, and before updating `summary.md` from both.

Sinapsi archives this file on its own once it passes 150 lines (or its token budget): it moves to `archive/`, a fresh log starts, and the fresh log's header names the latest archive. Read that one if you need history — not the whole folder.

<!-- The agent writes the first entry on the first patch. -->

## 2026-07-22T01:34:41+02:00 — Establish measured RFC foundation

- Goal: reproduce containment evidence and accept the architecture before moving public,
  persistence, authentication or dependency boundaries (P-01–P-09, P-16, P-18).
- Changed: added RFC 001, immutable ADR 001, the measured engineering baseline and the P-01–P-18
  closure ledger under `.sinapsi/{rfc,adr}` and `docs/engineering`.
- Decisions: Next.js 16 modular monolith; Drizzle over libSQL for local/remote parity; Better Auth
  database sessions; relational jobs and stable application errors.
- Security: identified non-empty historical MongoDB, Cloudinary and Gemini environment values in
  commit `8f83cec` without printing them. Rotation is required before release; no current source
  secret was added.
- Validation: fetched `origin`; branched from `origin/main`; frozen install failure, 42 type errors,
  93 lint errors/39 warnings, bypassed build and 48 audit findings were reproduced.
- Breaking changes: none; documentation-only decision patch.
- Regressions: none introduced. Final status: complete.

## 2026-07-22T01:47:42+02:00 — Close Phase 0 containment

- Goal: close P-02, P-03 and current-tree secret containment for P-18.
- Changed: removed tracked `.env.local`; added `.env.example`, SECURITY and MIT license; upgraded
  to Next 16.2.11/React 19.2.8; replaced vulnerable dependencies; rebuilt `bun.lock`; enabled
  strict TypeScript and zero-warning ESLint; removed all build validation bypasses and permissive
  image/cache/body configuration.
- Changed: deleted 141 unreachable simulator, MongoDB, Cloudinary, Gemini, Firebase, duplicate UI
  and parallel-route files (12,201 deleted lines). Added the recruiter marketing entry, bounded
  constants, unit/E2E/axe smoke tests, current-tree secret scanner, Dependabot and eight independent
  pinned-action CI gates.
- API/schema: all unsafe legacy APIs were removed; the durable authenticated API arrives in the
  accepted Phase 1 schema patch. `/` and `/sign-in` are the only current product routes.
- Security: runtime audit moved from 48 findings (2 critical/22 high) to zero; current-tree secret
  scan passes. Historical provider rotation remains required before release.
- Validation: frozen install, strict typecheck, lint with zero warnings, unit test, integration
  harness, production build, runtime audit, recruiter E2E and marketing axe test all pass locally.
- Visual/accessibility: responsive dark editorial landing page retains the established identity;
  skip link, visible focus, semantic headings and reduced-motion behavior were added.
- Breaking changes: legacy routes and dependency APIs are intentionally deleted. Rollback is the
  preceding `83c6689` commit; no data migration exists yet.
- Regressions: sign-in is intentionally a Phase 0 placeholder until the Phase 1 session slice.
  Final status: complete.

## 2026-07-22T02:13:25+02:00 — Deliver authenticated durable application core

- Goal: close the Phase 1 exit gate for P-01, P-04, P-05, P-06 and P-16.
- Changed: added two checksum-verified libSQL migrations and Drizzle schemas for Better Auth,
  workspaces, memberships, posts, immutable revisions, publications, media, audit events, AI usage,
  durable jobs and database-backed rate limits. Added validated idempotent five-role seed/setup.
- Changed: connected Better Auth database sessions, 12-hour HTTP-only cookies, disabled sign-up,
  persistent login throttling, origin checks, audited login/logout and membership-derived workspace
  context. Added a complete policy matrix including Author ownership constraints.
- Changed: implemented one editorial repository/service for list, get, create and conditional save;
  every save appends a revision and a stale version maps to HTTP 409. Added stable public errors,
  correlation IDs, structured logs and readiness.
- Product: replaced the sign-in placeholder with five bounded demo identities and added the
  responsive workspace/editor, active role/AI mode, seeded selection, create flow, debounced
  autosave states, conflict controls and recruiter checklist.
- API/schema: added protected workspace post GET/POST/PATCH routes and Better Auth adapter. JSON
  payloads never carry trusted workspace/user identity. API, architecture, schema and RBAC docs
  were added with executable contract references.
- Security: arbitrary credentials, revoked sessions, cross-workspace reads, Reviewer creation,
  Author cross-owner edits and anonymous mutations are negatively tested. No provider value is
  stored or returned.
- Validation: frozen install, strict typecheck, zero-warning lint, 9 unit tests, 5 integration
  tests, production build, zero-vulnerability audit and 5 Chromium E2E/axe tests pass.
- Breaking changes: schema `0000`/`0001` are the new persistence boundary. Rollback requires
  restoring the prior application commit and removing a new local/remote database; migrations are
  forward-only and checksum protected.
- Remaining risk: workflow transitions, history UI, jobs, media and AI adapters are Phase 2/3.
  Final status: complete.

## 2026-07-22T02:39:02+02:00 — Deliver reliable editorial workflow and publication

- Goal: close P-07, P-08 and P-09 with an executable author-reviewer-publication path.
- Decision: accepted RFC 002/ADR 002 for a versioned domain state machine, revision-pinned
  publications and database-leased jobs with three bounded attempts.
- Changed: implemented six state commands across seven lifecycle states, action-specific RBAC,
  version preconditions, timestamps, append-only audits and locked review/approval content.
- Changed: added workspace-scoped revision history, comparison and restore-as-new. Editing or
  restoring a Published post opens a new Draft while retaining its immutable published pointer.
- Reliability: scheduling writes a pinned publication and unique job atomically. Claims use a
  conditional 30-second lease; retry, recovery and repeated execution cannot duplicate the public
  mutation or audit. Archival cancels only its matching scheduled work.
- Product/API: added workflow controls, scheduling input, history/compare/restore panels, resilient
  serialized autosave, public preview and protected transition/revision/job adapters.
- Testing: added pure transition falsification, restore immutability, stale transition/restore,
  permission denial, pinned scheduling, malformed-job retry and duplicate-execution coverage.
- Validation: frozen install, strict typecheck, zero-warning lint, 11 unit tests, 10 integration
  tests, production build, zero-vulnerability audit and 7 deterministic Chromium E2E/axe tests pass.
- E2E evidence: Author creates/saves/restores/submits; Reviewer approves; Editor publishes; public
  preview renders the pinned revision. A second browser writer receives and compares HTTP 409.
- Breaking changes: post version is explicitly a concurrency token and may have revision gaps after
  transitions. Deployment scheduling must invoke `jobs:run`; no new migration is required.
- Remaining risk: media and AI provider boundaries are Phase 3. Final status: complete.

## 2026-07-22T03:07:40+02:00 — Harden media and AI provider boundaries

- Goal: close P-10, P-11 and P-12 without provider credentials or a parallel demo path.
- Decision: accepted RFC 003/ADR 003 for decoded bounded multipart media, durable libSQL object
  storage, transactional replacement/compensation and explicit governed AI suggestions.
- Schema: migration `0002_media_ai_governance.sql` replaces the coupled blob table, constrains one
  active asset per post and adds durable monthly AI quota reservations.
- Media: PNG/JPEG/WebP are stream-capped, decoded with pixel/dimension limits, MIME-matched,
  checksummed and filename-sanitized before storage. Workspace ownership is policy-enforced.
- Reliability: verified new media is stored before metadata activation. Replacement is atomic;
  provider/finalization failure preserves the active asset, while leased cleanup jobs retry three
  times and never delete an active replacement.
- AI: added one validated adapter contract, deterministic mock and structured Gemini adapter with
  bounded prompt/output, eight-second abort, persisted rate/quota controls and real usage metadata.
- Privacy/product: prompts and suggestions are not retained in usage/audit rows. Mock/live mode is
  labeled; preview is non-mutating and Apply creates a user-authored autosave revision.
- Scheduler security: a distinct secret with constant-time comparison authorizes machine execution;
  session-based Owner/Admin operation retains origin and RBAC checks.
- Tests: forged MIME, size/dimension abuse, cross-workspace access, provider failure, metadata
  compensation, cleanup recovery, malformed AI output, timeout, quota, rate and anonymous access pass.
- Validation: frozen install, strict typecheck, zero-warning lint, 17 unit tests, 21 integration
  tests, production build, current-tree secret scan, zero-vulnerability audit and 10 E2E/axe tests.
- Breaking changes: forward-only migration `0002` drops unused `media_blobs`; rollback requires
  restoring the prior commit/database snapshot. Configured Gemini remains opt-in and billable.
- Remaining risk: demo reset, accessibility depth, performance/visual evidence and release delivery
  are Phase 4/5. Final status: complete.
