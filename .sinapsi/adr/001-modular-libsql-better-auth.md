# ADR 001 — Modular monolith on libSQL with Better Auth

## Status

Accepted on 2026-07-22. Immutable; supersede with a new ADR.

## Context

AutoBlog needs one durable, workspace-isolated behavior in local development, CI and a serverless
public demo. It also requires revocable server-side sessions, relational revision history,
optimistic writes and idempotent scheduled jobs. RFC 001 contains baseline measurements,
alternatives and falsification criteria.

## Decision

Use a Next.js 16 modular monolith. Use Drizzle ORM over `@libsql/client` for both local `file:` and
remote libSQL databases. Use Better Auth database sessions and secure HTTP-only cookies. Keep
authorization, workflow and concurrency rules in application modules; route handlers and React
components are adapters only. Use the same relational database for durable jobs and outbox-style
compensation.

## Consequences

- Schema and migrations become the persistence authority; Mongoose and the in-memory simulator
  are removed.
- Local and CI execution remain free and deterministic; deployment needs externally owned libSQL
  and auth configuration.
- The bounded write rate is compatible with SQLite/libSQL. Higher sustained write concurrency
  would trigger a measured PostgreSQL migration RFC.
- Better Auth owns identity/session tables while workspace roles remain an application concern.
