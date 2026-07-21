# RFC 001 — Application foundation

- Status: Accepted
- Date: 2026-07-22
- Root RFC coverage: P-01, P-03, P-04, P-06, P-07, P-08, P-09, P-16, P-18

## Context and measured evidence

The baseline has two incompatible data paths: a 500+ line process-local simulator and
unprotected Mongoose route handlers. `bun install --frozen-lockfile` fails, TypeScript reports
42 errors, source lint reports 93 errors and 39 warnings with the current toolchain, and the
runtime audit reports 48 findings (2 critical, 22 high). The production build succeeds only
while explicitly skipping type and lint validation. No test or CI workflow exists.

The product needs relational workspace boundaries, immutable revisions, conditional writes,
durable idempotency records and database-backed sessions. Local development and CI must not
require a paid service, while the public serverless deployment must use the same repository
implementation.

## Proposal

1. Upgrade to the current supported Next.js 16 and React 19 line and use strict TypeScript.
2. Use Drizzle ORM with the libSQL driver. Local/CI use a durable `file:` database; deployment
   uses the same driver and schema with a remote libSQL URL.
3. Use Better Auth with database-backed, revocable email/password sessions. Demo role entry
   authenticates bounded seeded accounts; it does not bypass the session or policy layer.
4. Organize one modular monolith into identity, editorial, media and AI modules behind server
   adapters. React code never imports the database or provider clients.
5. Represent scheduled work and compensation in the relational `jobs` table with unique
   idempotency keys, leases and bounded retries.
6. Use stable application errors with correlation IDs at every public adapter.

## Alternatives considered

- Keep MongoDB: rejected because the existing models do not enforce tenant joins, revision
  relations or transactional job invariants, and would preserve the contradictory data path.
- Local-only SQLite: rejected because a serverless deployment cannot durably write its local
  filesystem.
- PostgreSQL plus a test fake: rejected because it introduces a second persistence behavior or
  requires external infrastructure for deterministic CI.
- Prisma: rejected because Drizzle/libSQL has a smaller runtime boundary and direct SQL migration
  artifacts while retaining explicit constraints.
- Auth.js credentials sessions: rejected because the current credentials-provider path is less
  direct for database-backed password accounts; Better Auth documents native Next.js 16,
  database sessions, secure cookies and Drizzle integration.
- Custom signed cookies: rejected because the RFC requires a maintained authentication solution
  and revocation semantics.
- Microservices or an external queue: rejected as operationally disproportionate to this modular
  monolith and incompatible with the no-billing constraint.

## Boundary and invariants

- All mutable records contain `workspace_id`; membership is reloaded from the database.
- Route workspace IDs are locators only and must match an authenticated membership.
- Revision rows are append-only. A published pointer identifies one immutable revision.
- Post mutations condition on `expectedVersion`; a zero-row update is `VERSION_CONFLICT`.
- Job idempotency keys are unique and claims use a lease before execution.
- AI output is persisted as usage metadata and returned as a suggestion only.
- Media replacement activates the new asset only after verified storage succeeds.

## Falsification tests

The decision is invalid if any of the following remains true:

- local and remote database URLs require different application repositories;
- a cross-workspace ID can be read or mutated through an authenticated route;
- a stale writer changes the current revision;
- a repeated scheduled job publishes or audits twice;
- session revocation still authorizes a mutation;
- a failed media replacement removes the active asset;
- a mock AI response is presented as a configured provider result.

## Consequences

The public deployment requires a remote libSQL URL/token and an authentication secret. Local and
CI remain provider-free. SQLite serializes writes, which is acceptable for this bounded portfolio
CMS; optimistic version checks remain mandatory. A future PostgreSQL move would require a new RFC
and migration rather than an alternate live adapter.
