# Handoff

## Current state

- Branch `feat/rfc-editorial-cms`; foundation commit is `83c6689`.
- Phase 0 containment is implemented and awaiting its atomic commit.
- The active routes are a responsive recruiter landing page and a clearly labeled sign-in
  placeholder. All legacy simulator/provider/parallel-route code is deleted.
- RFC 001/ADR 001 require Next.js 16, Drizzle/libSQL, Better Auth and one modular monolith.

## Verified gates

- `bun install --frozen-lockfile`: pass on Bun 1.3.12.
- `bun run typecheck`: pass with strict TypeScript 6.0.3.
- `bun run lint`: pass with zero warnings.
- `bun run test` and integration harness: pass.
- `bun run build`: pass with Next.js 16.2.11 and no validation bypass.
- `bun run audit`: zero vulnerabilities after constrained transitive resolutions.
- `bun run security:secrets`: current tree passes.
- `bun run test:e2e`: recruiter entry and marketing axe test pass in Chromium.

## Security and external risk

- `.env.local` is removed and ignored; `.env.example` contains names/placeholders only.
- Commit `8f83cec` contains non-empty historical MongoDB, Cloudinary and Gemini values. Never print
  them. Account owners must rotate/revoke them before release; history will not be rewritten.
- GitHub security CI deliberately scans full history and may remain red until that rotation is
  completed or a reviewed post-rotation baseline is accepted.

## Next coherent patch

Phase 1: define Drizzle schema/migration for Better Auth, workspaces, memberships, posts, revisions,
publications, media, jobs, audit and AI usage. Add validated env/errors, database bootstrap/seed,
Better Auth sessions, the full role permission matrix and protected list/create/edit adapters.
Acceptance requires persistence across restart plus anonymous, denied-role and cross-workspace
integration tests. Finish with Sinapsi session, handoff and summary in that order.
