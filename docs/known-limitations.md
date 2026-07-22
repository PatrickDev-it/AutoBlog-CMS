# Known limitations

- AutoBlog surfaces concurrent-write conflicts but does not merge text or provide real-time co-editing.
- The default media provider stores bounded objects in libSQL; it is not a high-volume CDN/object-store
  design and does not perform malware scanning or image conversion.
- Gemini behavior is contract-tested with a controlled provider boundary; no live output quality,
  token, cost or cancellation guarantee is claimed.
- Scheduled publication requires an external one-minute trigger. No paid scheduler is provisioned.
- Accessibility evidence covers automated axe, keyboard/focus/reduced-motion and scoped visual review;
  it is not a blanket WCAG certification or full screen-reader/browser matrix.
- Performance values are Chromium lab measurements on the recorded machine, not field telemetry.
- Visual regression is pinned to Windows Chromium to control font rasterization variance.
- Demo authentication uses bounded seeded identities selected by role; production user invitation,
  password recovery, MFA and identity-provider federation are not implemented.
- Membership management is policy-defined but has no recruiter-demo UI.
- Analytics and engagement metrics are intentionally absent rather than simulated.
- Public v2 deployment remains blocked until historical provider credentials are rotated, the
  deployment owner configures durable remote libSQL plus the scheduler, and Vercel deployment
  protection is removed from the intended recruiter-facing URL.
