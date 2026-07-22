# Performance budgets and measurements

Budgets were accepted before measurement in RFC 004 and execute against `next start`, not the HMR
development server.

| Route / metric | Budget | 2026-07-22 local Chromium | Status |
| --- | ---: | ---: | --- |
| Marketing LCP | ≤ 2,500 ms | 180 ms | Pass |
| Marketing CLS | ≤ 0.10 | 0.000 | Pass |
| Marketing initial JS transfer | ≤ 180 KiB | 138.6 KiB (141,959 B) | Pass |
| Workspace LCP | ≤ 2,500 ms | 256 ms | Pass |
| Workspace CLS | ≤ 0.10 | 0.000 | Pass |
| Workspace INP event-duration upper bound | ≤ 200 ms | < 16 ms | Pass |
| Workspace history response/paint proxy | ≤ 500 ms | 143 ms | Pass |
| Workspace cold initial JS transfer | ≤ 320 KiB | 216.2 KiB (221,420 B) | Pass |

Chromium emitted no Event Timing entry at the 16 ms reporting threshold for the measured workspace
interaction; the recorded INP event-duration upper bound is therefore `<16 ms`, not a fabricated zero.
The 143 ms workflow measurement includes fetch, rendering and visibility of revision history.

Run `bun run build` followed by `bun run test:performance`. CI fails on any declared regression.
Results are lab targets and do not claim universal field performance across devices/networks.

## Cache semantics

- Marketing is statically generated.
- Authenticated workspace/API data is dynamic; JSON application responses send `private, no-store`.
- Media bytes are authenticated and privately cached for five minutes with `nosniff`.
- Public preview pins an immutable revision and declares 60-second revalidation.
- Health/readiness is `no-store`.

No global cache disablement is configured.
