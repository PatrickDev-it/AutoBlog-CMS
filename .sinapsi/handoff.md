# Handoff

## Current state

- Branch `feat/rfc-editorial-cms`; foundation `83c6689`, Phase 0 `c6e8caa`, Phase 1 `c6d515e`.
- Phases 0–2 are implemented. One Drizzle/libSQL repository supports sessions, RBAC, durable posts,
  immutable revisions, review transitions, conflict-safe autosave and public publication.
- RFC 002/ADR 002 define the versioned workflow and database-leased scheduled publisher.
- Product routes include recruiter entry, role sign-in, protected workspace and immutable preview.

## Verified gates

- `bun install --frozen-lockfile`, strict typecheck and zero-warning lint pass.
- Unit: 4 files / 11 tests; integration: 3 files / 10 tests.
- Production build passes on Next.js 16.2.11; runtime audit reports zero vulnerabilities.
- E2E/axe: 7 deterministic Chromium tests pass in one worker, including the full multi-role flow,
  restore and stale autosave conflict.
- Scheduled job retry, lease recovery and duplicate execution are integration-tested.

## Security and external risk

- Current tree contains no provider secrets. Historical MongoDB, Cloudinary and Gemini values in
  `8f83cec` require owner rotation/revocation before release; never print or rewrite them.
- Deployment still requires externally owned remote libSQL/auth configuration and a one-minute
  invocation of `jobs:run`.

## Next coherent patch

Phase 3: implement the RFC 003/ADR 003 media and AI boundaries. Add verified bounded multipart
images, workspace ownership, safe replacement and cleanup compensation. Add one AI suggestion
contract with deterministic mock and configured Gemini adapters, quotas/rate limits/timeouts,
validated output, usage metadata and explicit Apply. Acceptance requires shared adapter contracts,
abuse/failure tests and authenticated UI flows. Finish Sinapsi in mandatory order.
