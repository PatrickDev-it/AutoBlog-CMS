# ADR 003 — Verified durable media and explicit governed AI suggestions

## Status

Accepted on 2026-07-22. Immutable; supersede with a new ADR.

## Context

RFC 003 requires provider failures to preserve active media and requires AI limits to survive process
restart. Demo and CI cannot depend on paid/private providers.

## Decision

Use bounded multipart upload and decode every image before provider storage. Implement a media provider
port with a durable libSQL object adapter; finalize or replace workspace metadata only after provider
success and clean stale objects through durable jobs. Use a partial unique index for one active asset per
post. Use one validated AI port, deterministic mock and structured Gemini adapter. Reserve quota and
consume rate limits in database transactions. Store provider/model/latency/character counts and only
provider-reported token counts; never infer tokens or retain prompt content.

## Consequences

- Local, CI and configured deployments retain one business/repository path.
- Media storage is capped per request and suitable for the bounded demo, not a general asset CDN.
- Gemini is opt-in configuration; mock results are visibly labeled and contain no fabricated usage.
- Provider operations have application timeouts, but upstream Gemini work may continue or be billed
  after abort, as documented by the SDK.
