# ADR 002 — Versioned workflow with database-leased publication jobs

## Status

Accepted on 2026-07-22. Immutable; supersede with a new ADR.

## Context

RFC 002 requires review decisions, immutable public artifacts, stale-command protection and scheduled
execution that survives restarts without paid queue infrastructure.

## Decision

Keep the state machine in the editorial domain and authorize each action through the central RBAC
policy. Use the post version as the precondition for state and revision commands. Store the exact
revision in each publication record. Schedule a unique publish job in the same database transaction,
claim work through a conditional lease, retry at most three times and make completion idempotent against
the publication status. Public reads resolve the published revision pointer, never the mutable draft.

## Consequences

- Review and publication invariants are testable without React or provider infrastructure.
- A scheduler only triggers `jobs:run`; it cannot select workspace, post or revision data.
- SQLite/libSQL conditional writes serialize claims for the bounded workload. Sustained multi-worker
  contention or throughput above the measured portfolio load would require a superseding queue ADR.
- Version gaps document non-content transitions and are intentional.
