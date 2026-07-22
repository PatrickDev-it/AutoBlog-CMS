# Handoff

## Current state

- Branch `feat/rfc-editorial-cms`; foundation `83c6689`, Phase 0 `c6e8caa`.
- Phase 1 is implemented: Drizzle/libSQL persistence, Better Auth sessions, workspace-derived RBAC,
  stable errors, immutable saves and optimistic-concurrency autosave.
- The live product routes are `/`, `/sign-in` and protected `/workspace/[workspaceId]`.
- Migrations `0000_editorial_core.sql` and `0001_auth_rate_limit.sql` are forward-only and
  checksum-verified; validated setup/seed is idempotent.

## Verified gates

- `bun install --frozen-lockfile`: pass on Bun 1.3.12.
- `bun run typecheck`: pass with strict TypeScript 6.0.3.
- `bun run lint`: pass with zero warnings.
- Unit: 3 files / 9 tests pass; integration: 2 files / 5 tests pass.
- `bun run build`: pass with Next.js 16.2.11 and no validation bypass.
- `bun run audit`: zero vulnerabilities.
- E2E/axe: 5 Chromium tests pass, including persistent autosave and authorization denial.

## Security and external risk

- `.env.local` is removed and ignored; `.env.example` contains names/placeholders only.
- Commit `8f83cec` contains non-empty historical MongoDB, Cloudinary and Gemini values. Never print
  them. Account owners must rotate/revoke them before release; history will not be rewritten.
- GitHub security CI may remain red until rotation or a reviewed post-rotation baseline.

## Next coherent patch

Phase 2: add the explicit editorial state machine, revision history/diff/restore-as-new, transition
audits, idempotent leased publication jobs and immutable public preview. Extend APIs and workspace UI
with review, schedule/publish, history, compare, restore and surfaced conflict behavior. Acceptance
requires concurrent-writer integration coverage and a complete author-reviewer-editor-publication E2E
flow. Finish with Sinapsi session, handoff and summary in that order.
