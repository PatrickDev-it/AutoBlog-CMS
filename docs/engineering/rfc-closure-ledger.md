# RFC closure ledger

Status values are `Open`, `In progress`, `Verified`, or `Externally blocked`. A row becomes
`Verified` only when its user path and named automated evidence both pass.

| ID | Required implementation | Primary evidence | Status |
| --- | --- | --- | --- |
| P-01 | One durable application/repository path | integration persistence + restart tests | In progress |
| P-02 | Strict type/lint/build gates | independent CI jobs | Verified |
| P-03 | Reproducible, patched dependencies | frozen install + runtime audit | Verified |
| P-04 | Real revocable sessions on every protected adapter | anonymous/session route tests | Verified |
| P-05 | Five-role application policy | complete positive/negative matrix tests | In progress |
| P-06 | Canonical validated workspace domain schemas | schema/validation tests | Verified |
| P-07 | Explicit workflow and durable publisher | state machine + duplicate job tests | Open |
| P-08 | Immutable revisions, compare and restore | integration + E2E revision tests | Open |
| P-09 | Debounced conditional autosave and conflict UI | concurrent integration + E2E conflict | Open |
| P-10 | Bounded verified media with safe replacement | abuse + failure compensation tests | Open |
| P-11 | Authorized, metered, bounded AI command | abuse/timeout/malformed tests | Open |
| P-12 | Explicit mock/configured adapter contract | shared adapter contract tests | Open |
| P-13 | Domain ownership; obsolete paths removed | type/lint/dead-route inspection | In progress |
| P-14 | Tested accessibility targets | axe + keyboard/focus evidence | Open |
| P-15 | Semantic caching and measured budgets | Lighthouse + bundle evidence | Open |
| P-16 | Stable non-leaking public errors | API contract tests | Verified |
| P-17 | Guided bounded recruiter demo | flagship E2E + reset test | Open |
| P-18 | CI, truthful docs, screenshots and release | CI/release/public verification | In progress |

## Release-only external dependencies

- Rotate/revoke the historical MongoDB, Cloudinary and Gemini credentials named in the baseline.
- Configure the existing deployment with a remote libSQL URL/token and a unique Better Auth secret.
- GitHub and deployment mutations proceed only after local gates pass and authenticated ownership
  is verified as `PatrickDev-it`.
