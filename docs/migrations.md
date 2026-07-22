# Migration and seed operations

Numbered SQL files under `drizzle/` are forward-only and checksum verified. Applied SQL must never be
edited; add a new migration instead.

## Empty database validation

```bash
DATABASE_URL=file:./data/empty-verification.db bun run db:migrate
DATABASE_URL=file:./data/empty-verification.db DEMO_ENABLED=true bun run db:seed
```

`bun run db:setup` applies pending migrations and seeds only when `DEMO_ENABLED=true`.
`bun run db:setup -- --reset-demo` is intended for isolated local/E2E setup; product reset uses the
authenticated Owner command.

## Current sequence

| Migration | Change | Compatibility |
| --- | --- | --- |
| `0000_editorial_core.sql` | workspace identity, posts, immutable revisions, publications, jobs and audit | foundational |
| `0001_auth_rate_limit.sql` | durable authentication rate limiting | additive |
| `0002_media_ai_governance.sql` | verified media object boundary, active-asset constraint and AI quota windows | replaces legacy media blob table |
| `0003_demo_reset_idempotency.sql` | immutable reset operation keys outside workspace cascade | additive |

Integration tests create an empty isolated database, apply the complete sequence, verify checksums
and exercise seed/reset behavior. Remote migration uses the same client and SQL path.

## Production discipline

Back up first, migrate once, deploy compatible application code, then start the scheduler. A checksum
mismatch is an incident: restore the expected migration file from source control; do not alter the
database ledger manually.
