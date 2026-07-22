# ADR 004 — Bounded reset and measured product quality

## Status

Accepted on 2026-07-22. Immutable; supersede with a new ADR.

## Context

RFC 004 requires a first-time evaluator to repeat the complete demo without weakening tenant safety,
and requires accessibility/performance claims to be backed by executable production evidence.

## Decision

Persist demo-reset idempotency outside the reset workspace foreign-key cascade while retaining an
explicit workspace identifier. Enforce Owner policy, demo flag and database rate limit before reset.
Delete only the demo workspace's object bytes and relational graph, then invoke the canonical seed.
Measure direct Web Vitals/transfer budgets under `next start`; use axe, keyboard assertions and
Chromium screenshots as targeted quality gates. Cache by route semantics rather than globally.

## Consequences

- Repeated requests are safe and auditable; unrelated workspaces and user sessions survive.
- Reset execution remains bounded to one known demo workspace and cannot become a general delete API.
- Performance and accessibility language must remain “tested targets,” not universal compliance.
