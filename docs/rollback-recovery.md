# Rollback and recovery

## Application rollback

1. Stop scheduler invocations to prevent new state transitions during triage.
2. Preserve diagnostic logs by request ID and take a database snapshot.
3. Roll back to the previous immutable deployment only if it supports every applied migration.
4. Run `GET /api/health`, authenticate and verify workspace isolation before resuming jobs.

Migrations are forward-only. Do not delete migration ledger rows or rewrite applied SQL. If the prior
application cannot read the new schema, restore the pre-migration database snapshot together with the
prior application commit.

## Data recovery

- Editorial recovery uses revision history: restore creates a new revision and preserves evidence.
- Published content remains pinned while later drafts are repaired.
- Failed scheduled jobs retain attempt/error state and resume after the lease expires.
- Media cleanup is idempotent; the active asset is never a cleanup candidate.
- Demo reset affects only the workspace with `is_demo=true`; it is not a production recovery tool.

## Provider incidents

Set `AI_MODE=mock` to stop Gemini calls without disabling editing. A media-provider failure rejects the
new upload and retains the active object. Rotate compromised `CRON_SECRET` and provider/database
tokens in their owner consoles, then redeploy all consumers atomically.

## Recovery verification

Run integration tests against a restored copy, then exercise login, stale-write conflict, publication,
public preview and one no-op duplicate job. Record recovery point, recovery time and any permanently
lost data; the project does not publish unmeasured RPO/RTO claims.
