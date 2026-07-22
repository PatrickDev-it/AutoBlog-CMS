# Engineering baseline — 2026-07-22

Measurements were taken on commit `485f037` using Bun 1.3.12 on the dedicated
`feat/rfc-editorial-cms` branch. Counts below are command output, not estimates.

| Gate | Command | Baseline result |
| --- | --- | --- |
| Frozen install | `bun install --frozen-lockfile` | Failed: lockfile would change |
| Typecheck | `bunx tsc --noEmit --pretty false` | Failed: 42 errors |
| Source lint | `bunx eslint . --ignore-pattern .next` | Failed: 93 errors, 39 warnings |
| Production build | `bun run build` | Passed only while skipping type and lint validation |
| Runtime audit | `bun audit --production` | Failed: 48 findings; 2 critical, 22 high |
| Tests | package scripts and repository search | No automated test command or test suite |
| CI | `.github/workflows` search | No workflow |

## Security containment finding

`.env.local` is tracked. Its current values are empty, but commit `8f83cec` contains non-empty
values for MongoDB, Cloudinary and Gemini variables. Values were not printed or copied. Because
shared history will not be rewritten, the affected provider credentials must be rotated or
revoked by their account owner before release. Current-tree removal and automated secret scanning
are Phase 0 gates.

## Product-path evidence

- Visible post flows call `utils/api-fetch.ts`, a process-local simulator.
- Separate Mongoose, Cloudinary and Gemini routes are directly reachable without a real session.
- `actions/check-user.ts` accepts any two non-empty strings.
- `next.config.ts` permits every HTTPS image host, accepts 20 MB server-action bodies, applies
  global no-cache headers, and suppresses type and lint build validation.
- README and FEATURES claim versioning, conflict resolution, WCAG conformance and durable autosave
  without corresponding executable paths or tests.

## Reproduction integrity

The baseline intentionally records the current toolchain result, which differs from older RFC
counts after advisory and lint-rule updates. Improved metrics will only be added after the named
commands pass in a clean worktree.
