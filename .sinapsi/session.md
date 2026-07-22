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

## 2026-07-22T03:29:49+02:00 — Deliver bounded demo and measured product quality

- Goal: close P-13, P-14, P-15 and P-17 with repeatable recruiter and quality evidence.
- Decision: accepted RFC 004/ADR 004 for an idempotent bounded reset, route-semantic caching,
  targeted accessibility claims, versioned visuals and production-mode performance budgets.
- Demo: added Owner-only origin-protected reset with durable idempotency and a three/hour database
  limit. It verifies `is_demo`, deletes only demo objects/relations and preserves identities, sessions
  and configured workspaces before running the canonical validated seed.
- Product: checklist progress now derives from persisted version/workflow/publication state; creation
  focuses the title, role/mode/data-path disclosure is visible and reset requires explicit confirmation.
- Accessibility: added serious/critical axe scans on marketing, sign-in, workspace and preview;
  keyboard draft/review flow, focus management and reduced-motion assertions pass.
- Visual: added six reviewed cross-CI-stable Chromium baselines for desktop/mobile major surfaces and
  removed 17 unreachable legacy/canned public assets.
- Performance: accepted LCP ≤2.5 s, CLS ≤0.10, INP/event ≤200 ms and JS 180/320 KiB budgets.
  Production measurements pass at 180/256 ms LCP, 0 CLS, <16 ms event upper bound, 143 ms workflow
  response and 141,959/221,420 transferred JavaScript bytes.
- Caching: marketing remains static; protected JSON is `private, no-store`; authenticated media is
  private five-minute; public preview retains 60-second revalidation; health remains no-store.
- CI: separated E2E, accessibility, Windows visual regression and Linux production performance jobs.
- Validation: frozen install, strict typecheck/lint, 17 unit, 25 integration, 10 E2E, 6 accessibility,
  5 visual and 2 performance tests, build, secrets and zero-vulnerability audit pass.
- Breaking changes: migration `0003` adds immutable reset idempotency. Visual baselines are reviewed
  on Windows Chromium to control font rasterization. Final status: complete.

## 2026-07-22T03:37:58+02:00 — Replace legacy claims with executable release evidence

- Goal: advance P-18 by making every public product claim map to a reachable path and named proof.
- Documentation: replaced the legacy simulator README/FEATURES with a recruiter brief, explicit
  Implemented/Tested/Demo-only/Planned matrix, actual application visuals and guided role workflow.
- Operations: added deployment, migration, rollback/recovery, known-limitations and 2.0 candidate
  release notes with the exact external configuration required for durable public operation.
- Security: added a trust-boundary threat model, control/evidence/residual-risk table and an explicit
  non-suppressible historical credential rotation gate; expanded the operator security policy.
- Integrity: added a documentation contract test for local evidence links, all P-01–P-18 ledger rows
  and superseded claim exclusion.
- GitHub discovery: authenticated owner is `PatrickDev-it`; repository is public. The current public
  production deployment is still commit `485f037` and is not presented as AutoBlog 2.0 evidence.
- Validation: documentation contract 2/2 and zero-warning lint pass; local evidence links resolve.
- Remaining gate: P-18 stays in progress pending full clean gates, remote PR/CI, owner credential
  rotation, durable deployment configuration, merge/tag/release and clean-session public verification.

## 2026-07-22T03:48:11+02:00 — Stabilize and execute the complete local release matrix

- Goal: validate the AutoBlog 2.0 candidate from frozen install through production performance and
  surface any nondeterministic release defect before remote CI.
- Finding: the first E2E run correctly failed because the fixed `data/e2e.db` retained the intentional
  hourly demo-reset window across runs. This made repeat execution dependent on prior local state.
- Fix: Playwright now gives every process an isolated durable libSQL file, optionally overridden by
  `PLAYWRIGHT_DATABASE_URL`; production rate-limit and idempotency behavior are unchanged.
- Strictness: removed the only strict TypeScript defect in the new Markdown-link parser without an
  assertion/cast. The documentation contract remains 2/2 and full unit count is 19.
- Empty database: migrations `0000`–`0003` and validated demo seed pass from a new file.
- Browser evidence: 10 E2E, 6 accessibility and 5 visual tests pass on pinned Chromium.
- Production evidence: build passes; LCP is 156/168 ms, CLS 0, interaction 16 ms, history response
  106 ms and transferred JavaScript 141,959/221,420 bytes, within accepted budgets.
- Security/reproducibility: frozen install, strict typecheck, zero-warning lint, 19 unit, 25 integration,
  zero-vulnerability runtime audit and current-tree secret scan pass.
- Remaining release risk is external: historical credential rotation, remote durable configuration,
  full-history CI, merge/tag/release and clean-session public deployment verification.

## 2026-07-22T03:55:11+02:00 — Publish the candidate and prove the external release boundary

- Goal: complete all authorized GitHub-side release work and distinguish repository failures from
  actions that require provider/account ownership.
- Delivery: pushed `feat/rfc-editorial-cms` and opened draft PR
  `https://github.com/PatrickDev-it/AutoBlog-CMS/pull/3` at candidate commit `3e9bc9a`.
- CI: frozen install, typecheck, lint, unit, integration, E2E, accessibility, visual regression,
  performance and production build all pass remotely. Security audit/current-tree scan pass; the
  required TruffleHog history step fails on the known historical provider finding.
- Governance: updated the official pinned `actions/checkout` dependency from v4.2.2 to v7.0.1
  (`3d3c42e5aac5ba805825da76410c181273ba90b1`) to remove the Node 20 deprecation warning. The
  existing `setup-bun` pin is already the official v2.2.0 release.
- GitHub metadata: verified `PatrickDev-it`, updated the public repository description and focused
  topics, removed obsolete `docker`; homepage remains blank because no public v2 URL is verified.
- Deployment: Vercel built the correct candidate, but anonymous requests redirect to Vercel login.
  Existing production still points to old commit `485f037`; neither is advertised as public v2.
- Ledger: P-18 is `Externally blocked`; P-01 through P-17 remain Verified.
- External actions: account owners must rotate/revoke the named historical credentials, configure
  remote libSQL/auth/cron and one-minute scheduling, and expose an approved public URL.
- Validation: documentation contract 2/2 and diff integrity pass. No merge, tag or release created.

## 2026-07-22T04:00:33+02:00 — Enforce the terminal release block

- Goal: make the RFC release gates technically enforceable and leave a stable terminal handoff.
- Final head `78af05b`: the official `actions/checkout@v7.0.1` pin executes successfully; remote run
  `29884450920` passes frozen install, typecheck, lint, unit, integration, E2E, accessibility, visual,
  performance and production build. Only the known full-history finding fails.
- Protection: `main` now requires all eleven RFC jobs with strict branch freshness, admin enforcement,
  resolved conversations, no force pushes and no branch deletion.
- Public repository: an unauthenticated request returns HTTP 200. Description and focused topics are
  current; homepage remains unset because an accessible v2 deployment does not exist.
- Deployment: Vercel built `78af05b`, but the anonymous candidate request returns HTTP 302 to Vercel
  SSO. The clean-session recruiter and runtime persistence gates therefore remain unverified.
- PR: posted the final evidence and minimum owner actions on draft PR #3. Merge/tag/release are blocked
  both procedurally and by branch protection; no bypass was used.
- Terminal status: `EXTERNALLY BLOCKED`. Repository work is complete; credential rotation, remote
  persistence/scheduler configuration and deployment access require external account ownership.

## 2026-07-22T04:21:56+02:00 — Add reproducible Lighthouse and bundle release evidence

- Goal: close the literal P-15 acceptance gap requiring Lighthouse and bundle reports without
  weakening the existing direct production budgets.
- Decision: accepted RFC 005/ADR 005 for six local Lighthouse 13.4.1 reports, a representative
  public/editor bundle report and seven-day repository-scoped CI artifacts.
- Dependency review: rejected `@lhci/cli` 0.15.1 after its legacy transitive dependencies introduced
  additional high-severity development findings. Current Lighthouse adds no runtime finding; the
  performance job pins its required Node 22.19 and reuses Playwright Chromium.
- Direct evidence: marketing/workspace LCP 188/300 ms, CLS 0, interaction upper bound 16 ms,
  workflow response 146 ms and JavaScript 141,959/221,420 bytes all pass accepted budgets.
- Lighthouse evidence: marketing/sign-in median performance 0.92/0.91, accessibility 1.00,
  best-practices 1.00, SEO 1.00, LCP 1,718/1,709 ms and CLS 0 across six reports.
- CI: the independent performance job now requires build, direct measurements, Lighthouse budgets
  and pinned seven-day report upload. No Lighthouse SaaS, paid service or product data is used.
- Validation: frozen install, strict typecheck, zero-warning lint, 19 unit, production build, two
  direct performance tests, six Lighthouse reports, runtime audit and current-tree scan pass.
- Terminal status remains `EXTERNALLY BLOCKED`: P-01–P-17 are Verified; P-18 still requires provider
  credential rotation, durable public runtime/scheduler configuration and anonymous deployment.

## 2026-07-22T04:27:00+02:00 — Preserve dot-prefixed performance artifacts in CI

- Goal: make the already-green Lighthouse and bundle outputs downloadable from the protected job.
- Evidence: remote run `29885689908` passed build, both direct performance tests and all six
  Lighthouse runs; only artifact upload failed because the action excludes hidden paths by default.
- Fix: enabled the pinned upload action's `include-hidden-files` option for `.lighthouse/` and
  `.performance/`; paths, seven-day retention, missing-file failure and all budgets are unchanged.
- Scope: workflow-only correction. No application, test assertion, dependency or report content
  changed. Terminal status remains `EXTERNALLY BLOCKED` for the documented external release gates.

## 2026-07-22T11:39:38+02:00 — Restore the executable history-scan gate

- Goal: remove a false-red security result before CTO-facing portfolio review without weakening the
  required Git-history scan.
- Evidence: run `29885890517` passed the runtime dependency audit and current-tree secret scan, then
  TruffleHog exited before scanning because `--fail` was supplied by both the pinned action and
  `extra_args`.
- Fix: retained the pinned TruffleHog action and `verified,unknown` result policy while removing only
  duplicate action-owned `--fail` and `--no-update` arguments.
- Governance: marked the implemented root RFC Accepted; no application boundary, dependency, test,
  credential, protection rule or external release gate changed.
- Local verification: runtime audit and current-tree secret scan pass; remote history-scan rerun is
  pending on draft PR #3.
- Terminal status remains `EXTERNALLY BLOCKED`: historical provider rotation, durable public runtime,
  scheduler, anonymous demo, merge and release remain owner-controlled gates.
