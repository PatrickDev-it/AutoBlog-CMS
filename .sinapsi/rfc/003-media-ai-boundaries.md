# RFC 003 — Secure media and governed AI boundaries

- Status: Accepted
- Date: 2026-07-22
- Root RFC coverage: P-10, P-11, P-12

## Context and measured evidence

The accepted foundation contains media/AI metadata tables but exposes no provider ports or user
paths. The current tree has no upload endpoint and no AI endpoint; all previous base64, Cloudinary
and Gemini routes were removed in Phase 0. Runtime audit is zero. The installed `sharp` and
`@google/genai` packages are unused. Official `@google/genai` documentation confirms structured JSON
schemas, bounded output tokens, response usage metadata and an abort signal, while warning that
client cancellation does not necessarily cancel provider billing.

## Proposal

1. Accept only authenticated multipart images up to 5 MiB (configurable downward/up to 10 MiB).
   Verify decoded PNG/JPEG/WebP format, dimensions up to 4096×4096 and 16 megapixels with `sharp`.
2. Use a media provider port. The durable default adapter writes opaque objects to libSQL, preserving
   the same local/CI/deployment repository path. Metadata activates only after object persistence.
3. Replace in one metadata transaction: mark the prior asset replaced and activate the verified new
   asset. Durable cleanup jobs remove old/orphan objects with leases and three retries.
4. Define one AI suggestion contract. The deterministic mock and configured Gemini adapters share
   validated input/output. Gemini uses structured JSON, a fixed output bound and an eight-second
   abort signal; public errors never include provider details.
5. Reserve monthly workspace character quota transactionally before provider invocation and enforce
   a per-user five-request/minute database rate limit. Release reservations on failure and record only
   bounded usage metadata on success.
6. Return suggestions without mutating posts. React provides separate Preview and Apply actions and
   labels mock/configured mode.

## Alternatives considered

- Base64 JSON uploads: rejected because parser allocation occurs before meaningful limits.
- Arbitrary remote URLs: rejected because they create SSRF and host-trust problems; the allowlist is
  intentionally empty.
- Local filesystem objects: rejected because serverless instances are ephemeral.
- Direct Cloudinary dependency: rejected because CI would require private credentials and the old path
  deleted active data before replacement succeeded.
- Store prompts/responses for analytics: rejected as unnecessary sensitive content retention.
- Mutate posts directly from AI: rejected because assistance must remain an explicit user decision.
- In-memory quotas/rate limits: rejected because restart and multi-instance behavior would bypass them.

## Falsification tests

- A forged extension/MIME, oversized image, excessive dimension or non-image reaches storage.
- A provider/finalization failure changes or deletes the active asset.
- Another workspace can list, replace, read or delete an asset by ID.
- Repeated cleanup execution deletes a new active replacement or audits twice.
- Anonymous/forbidden AI invocation reaches an adapter.
- Concurrent quota reservations exceed the configured workspace budget.
- Timeout, malformed provider JSON or excessive output is returned as a suggestion.
- Any suggestion changes a revision before the user chooses Apply.

## Consequences

Database object storage is intentionally bounded and operationally sufficient for this portfolio
deployment; high media volume would trigger a new direct-upload object-store RFC. Configured Gemini
requires an externally owned API key and may incur provider charges, so demo/CI remain deterministic
mock mode. Abort limits local waiting but cannot guarantee provider-side cancellation or avoid charges.
