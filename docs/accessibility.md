# Accessibility evidence

AutoBlog makes targeted, tested accessibility claims; this is not a blanket WCAG certification.

## Automated and keyboard evidence

- axe-core serious/critical checks: marketing, sign-in, authenticated workspace and public preview.
- Keyboard E2E: role activation, draft creation, title/body entry, autosave and submit for review.
- Focus management: draft creation and post selection move focus to the editable title; skip link and
  visible `:focus-visible` outline remain available.
- Form/error semantics: every editor, media, schedule and AI field has a programmatic label; blocking
  save errors use `role=alert`, progress messages use `role=status`.
- Contrast: axe color-contrast rules execute on all four primary surfaces; neon accent uses dark ink.
- Reduced motion: the browser test emulates `prefers-reduced-motion: reduce` and verifies smooth
  scrolling/animation duration are disabled.
- Responsive review: versioned Chromium baselines cover desktop marketing/sign-in/workspace/preview
  and 390×844 marketing/workspace surfaces.

Commands: `bun run test:a11y` and `bun run test:visual`. Visual baselines are reviewed on the pinned
Windows/Chromium CI job to avoid cross-platform font rasterization noise.

## Manual review scope

The flagship focus order follows sidebar navigation → editor controls → evidence rail on desktop and
the same DOM order on mobile. No primary command depends only on hover, drag or pointer gestures.
Screen-reader combinations beyond axe semantic inspection remain a known manual-audit limitation.
