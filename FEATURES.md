# AutoBlog CMS feature evidence

Status is explicit: **Implemented** means a reachable persisted path exists; **Tested** names its
automated proof; **Demo-only** is bounded and labeled; **Planned** is not represented as available.

| Product capability | Implementation | Automated evidence | Status |
| --- | --- | --- | --- |
| Workspace-isolated persistence | one Drizzle repository over local or remote libSQL | empty migration, restart, cross-tenant integration | Implemented, Tested |
| Database-backed login/logout | Better Auth HTTP-only SameSite sessions, revocation and rate limit | identity integration and anonymous E2E | Implemented, Tested |
| Owner/Admin/Editor/Author/Reviewer | server permission matrix plus Author ownership | complete role/command unit matrix and denial E2E | Implemented, Tested |
| Draft autosave | 850 ms debounce, serialized conditional writes | revision integration and reload E2E | Implemented, Tested |
| Concurrent editing safety | post version precondition and stable `VERSION_CONFLICT` | concurrent writers and stale browser E2E | Implemented, Tested |
| Immutable revisions | insert-only rows, compare and restore-as-new | trigger, compare/restore integration and E2E | Implemented, Tested |
| Editorial workflow | Draft, In Review, Changes Requested, Approved, Scheduled, Published, Archived | transition/permission unit tests and flagship E2E | Implemented, Tested |
| Scheduled publication | transactional job/publication, lease, retry and idempotency | duplicate execution and lease-recovery integration | Implemented, Tested |
| Immutable public preview | publication pins a reviewed revision | later-draft and publication E2E | Implemented, Tested |
| Media upload | bounded multipart, decoded PNG/JPEG/WebP verification | MIME, size, dimension, pixel and isolation tests | Implemented, Tested |
| Safe media replacement | new object verification before atomic activation and cleanup | injected provider/finalization failure tests | Implemented, Tested |
| AI suggestion preview | authenticated bounded command with explicit Apply | adapter contracts, abuse tests and E2E | Implemented, Tested |
| Gemini adapter | structured `@google/genai` response with abort and real metadata | stubbed provider contract/malformed/timeout tests | Implemented, Tested; live provider not asserted |
| Guided recruiter checklist | progress derived from durable version/workflow/publication state | recruiter and role-flow E2E | Demo-only, Tested |
| Demo reset | Owner-only, origin-checked, idempotent, three operations/hour | isolation/retry/rate integration and E2E | Demo-only, Tested |
| Responsive product surfaces | desktop and 390×844 layouts | six Chromium visual baselines | Implemented, Tested target |
| Accessibility targets | labels, focus, keyboard flow, reduced motion | axe on four surfaces plus keyboard/focus tests | Implemented, Tested target |
| Performance budgets | route-semantic caching, direct budgets and local Lighthouse reports | executable LCP/CLS/interaction/JS plus six Lighthouse runs | Implemented, Tested target |
| Analytics | no fake metrics or dashboard | absence is deliberate | Planned |
| Live co-author merging | conflicts are surfaced; automatic merge is not implemented | no claim | Planned |
| External object store/CDN | current bounded adapter uses durable libSQL objects | no claim | Planned |
| Hosted v2 demo | repository side is complete; remote persistence/scheduler are external | release verification pending | Planned external gate |

## Primary paths

- Author: create → autosave → history/restore → submit.
- Reviewer: request changes or approve; cannot mutate or publish.
- Editor: schedule/publish a pinned revision and manage media.
- Public reader: view only the immutable published revision.
- AI: preview a labeled mock or configured suggestion; Apply follows normal autosave rules.
- Owner: reset only the seeded `ws-demo` workspace without deleting identities or sessions.

## Deliberate non-claims

AutoBlog does not claim blanket WCAG compliance, universal browser support, field performance,
real-time co-authoring, analytics, live-provider output quality, automatic image conversion or
high-volume media delivery. Evidence and residual limits are linked from [README.md](./README.md).
