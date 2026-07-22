# ADR 005 — Supplement direct budgets with local Lighthouse reports

## Status

Accepted on 2026-07-22. Immutable; supersede with a new ADR.

## Context

Direct production measurements pass at LCP 188/300 ms, CLS 0, interaction 16 ms and JavaScript
141,959/221,420 bytes, but root RFC P-15 separately names Lighthouse reports as acceptance evidence.
Official `lighthouse` 13.4.1 is the current audited engine; the release job pins its required Node
22.19 runtime and reuses the already-installed Playwright Chromium.

## Decision

Run three local-only desktop Lighthouse passes for marketing and sign-in from the existing production
performance job. Enforce category, LCP and CLS thresholds while retaining the direct interaction and
JavaScript assertions as primary exact budgets. The direct suite writes a public/editor bundle report.
GitHub Actions retains both report sets for seven days inside the authorized repository; no
Lighthouse hosting account is used.

## Consequences

- P-15 evidence now includes both explicit metrics and a standard audited report.
- Lighthouse variability is bounded with three runs and conservative release thresholds.
- Reports may contain public route output, so artifacts remain ignored locally and limited to a
  seven-day repository-scoped CI retention.
- Lighthouse CI was rejected because its current CLI adds audited legacy transitive risk without
  providing necessary capability for this local gate.
- Any dependency audit regression falsifies this decision and blocks release.
