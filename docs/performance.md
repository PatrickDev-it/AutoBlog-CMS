# Performance budgets and measurements

Budgets were accepted before measurement in RFC 004 and execute against `next start`, not the HMR
development server.

| Route / metric | Budget | 2026-07-22 local Chromium | Status |
| --- | ---: | ---: | --- |
| Marketing LCP | ≤ 2,500 ms | 188 ms | Pass |
| Marketing CLS | ≤ 0.10 | 0.000 | Pass |
| Marketing initial JS transfer | ≤ 180 KiB | 138.6 KiB (141,959 B) | Pass |
| Workspace LCP | ≤ 2,500 ms | 300 ms | Pass |
| Workspace CLS | ≤ 0.10 | 0.000 | Pass |
| Workspace INP event-duration upper bound | ≤ 200 ms | 16 ms | Pass |
| Workspace history response/paint proxy | ≤ 500 ms | 146 ms | Pass |
| Workspace cold initial JS transfer | ≤ 320 KiB | 216.2 KiB (221,420 B) | Pass |

Chromium recorded a 16 ms Event Timing duration for the measured workspace interaction. This is a
bounded lab proxy rather than a field INP claim. The 146 ms workflow measurement includes fetch,
rendering and visibility of revision history.

Run `bun run build` followed by `bun run test:performance`. CI fails on any declared regression.
Results are lab targets and do not claim universal field performance across devices/networks.
The command writes the representative public/editor bundle and Web Vital measurements to
`.performance/bundle-report.json`; CI retains it with the Lighthouse output for seven days.

## Lighthouse reports

`bun run test:lighthouse` performs three desktop Lighthouse runs on marketing and sign-in under the
same production server. Median-run assertions require performance ≥0.80, accessibility ≥0.95,
best-practices ≥0.90, SEO ≥0.90, LCP ≤2,500 ms and CLS ≤0.10. Reports remain local in the ignored
`.lighthouse/` directory; no hosted report service receives route output. Direct interaction and
JavaScript budgets above remain mandatory because Lighthouse does not replace them.

Measured medians on 2026-07-22:

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Marketing | 0.92 | 1.00 | 1.00 | 1.00 | 1,718 ms | 0 |
| Sign-in | 0.91 | 1.00 | 1.00 | 1.00 | 1,709 ms | 0 |

## Cache semantics

- Marketing is statically generated.
- Authenticated workspace/API data is dynamic; JSON application responses send `private, no-store`.
- Media bytes are authenticated and privately cached for five minutes with `nosniff`.
- Public preview pins an immutable revision and declares 60-second revalidation.
- Health/readiness is `no-store`.

No global cache disablement is configured.
