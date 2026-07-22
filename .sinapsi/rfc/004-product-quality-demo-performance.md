# RFC 004 — Recruiter demo, accessibility and performance evidence

- Status: Accepted
- Date: 2026-07-22
- Root RFC coverage: P-13, P-14, P-15, P-17

## Context and measured evidence

The flagship browser workflow passes, but reset exists only as a local seed option, the checklist is
static, axe covers only marketing and no visual/performance evidence is versioned. The production
build currently exposes a static marketing route, dynamic authenticated editor and a 60-second
revalidated public preview. No global no-cache header exists.

## Proposal

1. Add Owner-only demo reset with a persisted idempotency record, a three-request/hour database rate
   limit and a hard `is_demo` guard. Reset deletes only bounded demo data and its object bytes, then
   runs the same validated seed path.
2. Derive the recruiter checklist from persisted post state and provide concise in-product guidance,
   mode/role disclosure and reset feedback.
3. Add axe scans for marketing, sign-in, workspace and public preview; keyboard/focus-order tests for
   primary navigation and controls; retain explicit form labels and reduced-motion CSS.
4. Add versioned desktop/mobile visual snapshots for marketing, sign-in, workspace and public preview.
5. Measure production-mode Web Vitals and transferred initial JavaScript with budgets set before
   measurement: LCP ≤ 2.5 s, INP/event duration ≤ 200 ms, CLS ≤ 0.10, landing JS ≤ 180 KiB and
   authenticated workspace JS ≤ 320 KiB. Fail the test when a budget regresses.
6. Keep authenticated routes dynamic/no-store by server semantics; retain 60-second public preview
   revalidation and static marketing generation.

## Alternatives considered

- Reset through a public seed endpoint: rejected because it weakens authorization and tenant scope.
- Delete/recreate the entire database: rejected because configured workspaces and sessions would be
  destroyed.
- Claim broad WCAG compliance from axe: rejected because automated checks are targeted evidence, not
  a complete audit.
- Measure development server performance: rejected because HMR and unoptimized bundles invalidate
  release budgets.
- Lighthouse-only scores: rejected as hardware-sensitive aggregates; direct Web Vital/bundle budgets
  are retained as primary evidence. Lighthouse can supplement them in release documentation.
- Global no-cache: rejected because marketing and published preview have different data semantics.

## Falsification tests

- A non-Owner, non-demo workspace or anonymous caller can reset data.
- Repeating an idempotency key performs another reset or audit.
- Reset deletes a configured workspace, identity/session or leaves demo media objects behind.
- Flagship actions cannot be completed with a keyboard or lose visible focus.
- Axe reports serious/critical violations on a primary surface.
- A versioned major surface changes without an reviewed snapshot update.
- A production route exceeds any declared LCP/INP/CLS/JavaScript budget.

## Consequences

Performance measurements run against `next start` and therefore require a completed production
build. Results are local/CI targets rather than universal field guarantees. Visual baselines are
Chromium-specific review artifacts. Idempotency records intentionally survive demo workspace deletion.
