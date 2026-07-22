# RFC 002 — Editorial reliability and durable publication

- Status: Accepted
- Date: 2026-07-22
- Root RFC coverage: P-07, P-08, P-09

## Context and measured evidence

Phase 1 persists every content save as an immutable revision and rejects stale versions, but the
seven declared states have no transition implementation. The database already contains publication
and job records, while the application exposes zero workflow, history, restore, scheduling or public
preview commands. Nine unit, five integration and five browser tests pass before this change; none
can prove the author-reviewer-publication path.

## Proposal

1. Implement one pure transition table for Draft, InReview, ChangesRequested, Approved, Scheduled,
   Published and Archived. Each command declares its permission, source states and destination.
2. Condition every transition and restore on `expectedVersion`; transition versions may create gaps
   in revision numbering because only content mutations append revisions.
3. Lock content during review, approval and scheduling. Editing a published post creates a new Draft
   revision while retaining the immutable published pointer.
4. Pin scheduled and direct publications to the selected immutable draft revision. Scheduled work is
   recorded with a unique idempotency key and executed by a database-leased, three-attempt worker.
5. Expose revision history, restore-as-new, transition commands and a public preview read model through
   server adapters. All private commands retain session, membership, origin and policy enforcement.

## Alternatives considered

- Encode transitions in React: rejected because server authorization and non-UI clients could bypass it.
- Mutable article snapshots: rejected because they cannot prove what was reviewed or published.
- Platform-specific cron plus in-memory queue: rejected because retries and duplicate executions would
  disappear on restart and diverge between local, CI and deployment.
- External queue: rejected because the bounded portfolio workload does not justify billing or another
  operational system.
- Publish the current draft when a delayed job runs: rejected because edits after scheduling would
  silently change the approved artifact.

## Falsification tests

- An Author or Reviewer can directly publish or schedule.
- A transition from an undeclared source state succeeds.
- A stale transition, save or restore changes the post.
- Restore mutates an old revision instead of appending a new one.
- A scheduled job publishes a revision other than the one pinned at scheduling time.
- Reclaiming or rerunning a job creates a second publication or audit event.
- Editing after publication changes the public response before another explicit publication.

## Consequences

The post version is a concurrency token, not a count of revision rows. Scheduled execution requires a
recurring invocation of the repository-provided worker command; local and CI use the same command as a
deployment scheduler. Provider-specific scheduling remains deployment configuration, not business logic.
