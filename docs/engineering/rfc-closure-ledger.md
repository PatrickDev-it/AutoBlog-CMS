# RFC closure ledger

Status values are `Open`, `In progress`, `Verified`, or `Externally blocked`. A row becomes
`Verified` only when its user path and named automated evidence both pass.

| ID | Required implementation | Primary evidence | Status |
| --- | --- | --- | --- |
| P-01 | One durable application/repository path | integration persistence + restart tests | Verified |
| P-02 | Strict type/lint/build gates | independent CI jobs | Verified |
| P-03 | Reproducible, patched dependencies | frozen install + runtime audit | Verified |
| P-04 | Real revocable sessions on every protected adapter | anonymous/session route tests | Verified |
| P-05 | Five-role application policy | complete positive/negative matrix tests | Verified |
| P-06 | Canonical validated workspace domain schemas | schema/validation tests | Verified |
| P-07 | Explicit workflow and durable publisher | state machine + duplicate/retry job tests + flagship E2E | Verified |
| P-08 | Immutable revisions, compare and restore | append-only integration + history/restore E2E | Verified |
| P-09 | Debounced conditional autosave and conflict UI | concurrent integration + stale-writer E2E | Verified |
| P-10 | Bounded verified media with safe replacement | MIME/size/dimension/isolation + compensation/cleanup + E2E | Verified |
| P-11 | Authorized, metered, bounded AI command | quota/rate/timeout/anonymous + explicit-Apply E2E | Verified |
| P-12 | Explicit mock/configured adapter contract | shared mock/Gemini structured-output tests | Verified |
| P-13 | Domain ownership; obsolete paths removed | modular tree + type/lint + legacy asset deletion | Verified |
| P-14 | Tested accessibility targets | four-surface axe + keyboard/focus/reduced-motion + visual baselines | Verified |
| P-15 | Semantic caching and measured budgets | production LCP/INP/CLS/JS executable budgets | Verified |
| P-16 | Stable non-leaking public errors | API contract tests | Verified |
| P-17 | Guided bounded recruiter demo | dynamic checklist + isolated idempotent reset integration/E2E | Verified |
| P-18 | CI, truthful docs, screenshots and release | versioned real-app visuals + docs + CI/release/public verification | In progress |

## Release-only external dependencies

- Rotate/revoke the historical MongoDB, Cloudinary and Gemini credentials named in the baseline.
- Configure the existing deployment with a remote libSQL URL/token and a unique Better Auth secret.
- GitHub and deployment mutations proceed only after local gates pass and authenticated ownership
  is verified as `PatrickDev-it`.
