# RFC 005 — Reproducible Lighthouse release evidence

- Status: Accepted
- Date: 2026-07-22
- Root RFC coverage: P-15, P-18

## Context and measured evidence

The production Playwright gate measures LCP 188/300 ms, CLS 0, a 16 ms interaction proxy and exact
initial JavaScript transfer 141,959/221,420 bytes. These direct assertions are stronger than an
aggregate score, but root RFC P-15 also explicitly requires a Lighthouse report. No reproducible
Lighthouse artifact or CI assertion currently exists. Official npm metadata reports `lighthouse`
13.4.1 as current on 2026-07-22; it requires Node 22.19 or newer.

## Proposal

1. Add exact dev dependency `lighthouse@13.4.1` and retain it in the frozen Bun lockfile.
2. Run three desktop Lighthouse passes against marketing and sign-in under `next start`.
3. Use the installed Playwright Chromium and pin Node 22.19 in the performance job.
4. Persist reports as ignored local output and a seven-day GitHub CI artifact; do not upload route
   output to a Lighthouse SaaS or any provider outside the authorized repository.
5. Require performance ≥0.80, accessibility ≥0.95, best-practices ≥0.90, SEO ≥0.90, LCP ≤2.5 s
   and CLS ≤0.10. Direct interaction and JavaScript budgets remain separately mandatory.
6. Execute Lighthouse inside the existing independent performance CI job after the direct budgets.
7. Emit representative marketing/workspace JavaScript measurements as a separate bundle report.

## Alternatives considered

- Keep only the custom PerformanceObserver gate: rejected because it leaves the exact P-15
  Lighthouse acceptance criterion unmet.
- Manual DevTools export: rejected because it is not reproducible or mandatory in CI.
- `@lhci/cli` 0.15.1: rejected after `bun audit` exposed high-severity legacy transitive findings
  absent from current Lighthouse; the hosted/collection features are unnecessary for this gate.
- Replace direct metrics with Lighthouse scores: rejected because aggregate scores are noisier and do
  not enforce the explicit transferred-JavaScript or interaction budgets.
- Upload to LHCI server or paid monitoring: rejected because no approved external service exists.

## Falsification tests

- Frozen install changes the manifest or lockfile.
- Lighthouse cannot audit the production server or produces fewer than six local reports.
- The public/editor bundle report or seven-day CI evidence artifact is absent.
- Either tested URL falls below a category threshold or exceeds LCP/CLS budgets.
- The performance CI job omits either direct budgets or Lighthouse assertions.
- Runtime audit gains an unreviewed high/critical vulnerability.

## Consequences

CI time increases by three Lighthouse runs per route. Scores remain lab evidence and do not become
field-performance or WCAG claims. P-15 requires both the direct budget suite and Lighthouse to pass.
