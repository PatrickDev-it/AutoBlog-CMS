# Handoff

## Current state

- Branch `feat/rfc-editorial-cms` starts at current `origin/main` (`485f037`).
- Pre-existing untracked RFC/Sinapsi/assistant files and the `.gitignore` edit are preserved.
- RFC 001 and ADR 001 accept Next.js 16, Drizzle/libSQL and Better Auth for one modular monolith.
- Baseline and the P-01–P-18 ledger are in `docs/engineering`.
- No application boundary has been changed yet.

## Measured baseline

- Frozen install fails; typecheck has 42 errors; source lint has 93 errors and 39 warnings.
- Build passes only because validation is skipped.
- Runtime audit: 48 findings, including 2 critical and 22 high.
- No tests or CI workflow exist.
- Historical commit `8f83cec` contains non-empty MongoDB, Cloudinary and Gemini environment values.
  Values must never be printed; provider owners must rotate/revoke them before release.

## Decisions and constraints

- One Drizzle repository runs against local `file:` and remote libSQL URLs.
- Better Auth database sessions authenticate bounded seeded demo accounts.
- Workspace membership is database-derived; URL/payload workspace identity is never trusted.
- Revisions are immutable, writes are version-conditional, and durable jobs are idempotent.
- Preserve the dark editorial identity while replacing unreachable legacy architecture.
- Do not touch Privacy, Ignoryx or unrelated repositories; do not rewrite history.

## Next coherent patch

Phase 0: remove tracked `.env.local`, add `.env.example`, upgrade/pin dependencies and lockfile,
replace bypassed config, establish strict scripts and independent CI/security jobs, and remove or
isolate legacy code until frozen install, audit, typecheck, lint and build pass. Finish every patch
with session, handoff and summary updates in that order.
