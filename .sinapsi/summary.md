# Summary

<!-- Sinapsi keeps the directory tree below current on its own — on every build, and live
     from the watcher whenever a file or folder is created, moved or deleted. There is no
     command to run and nothing to ask an agent to do. Do not edit between its markers;
     your edits are replaced. Everything else in this file is yours. -->

<!-- sinapsi:start v0.2.6 — kept current automatically by Sinapsi — refreshed on every build and by the watcher whenever files or folders are created, moved or deleted. No command to run; edits between these markers are replaced -->
```
_client/
  @inset/
  @sidebar/
actions/
  check-user.ts
  firebase.ts
  indexed-db.ts
  send-message.ts
app/
  @inset/
  @sidebar/
  api/
  default.tsx
  favicon.ico
  globals.css
  icon.png
  layout.tsx
  template.tsx
components/
  chat/
  groups/
  webapp/
  BreadCrumbNav.tsx
  Copy.tsx
  add-member-dialog.tsx
  check-progress.tsx
  copy-popup.tsx
  data-picker.tsx
  env-switcher.tsx
  formats.tsx
  imageLoader.tsx
  loader.tsx
  members-page.tsx
  nav-main.tsx
  nav-projects.tsx
  nav-secondary.tsx
  nav-user.tsx
  shareable-card.tsx
  theme-switcher.tsx
  typewriter.tsx
config/
  css/
  _export.ts
constants/
  post-init-template.ts
  sections.ts
docs/
  engineering/
hooks/
  use-longPress.ts
  use-mobile.tsx
  use-tablet.tsx
  use-theme.tsx
  use-toast.ts
  use-typewriter.ts
lib/
  cloudinary.ts
  db.ts
  gemini.ts
plugins/
  dynamic-size.ts
public/
  auth/
  demo/
  ai.png
  ai.svg
  file.svg
  globe.svg
  iphone.png
  logo.png
  logo.svg
  window.svg
types/
  group.d.ts
  post.d.ts
  sidebar.d.ts
  user.d.ts
ui/
  alert-dialog.tsx
  avatar.tsx
  breadcrumb.tsx
  button.tsx
  calendar.tsx
  card.tsx
  checkbox.tsx
  collapsible.tsx
  command.tsx
  context-menu.tsx
  dialog.tsx
  drawer.tsx
  dropdown-menu.tsx
  input.tsx
  label.tsx
  popover.tsx
  radio-group.tsx
  scroll-area.tsx
  select.tsx
  separator.tsx
  sheet.tsx
  sidebar.tsx
  skeleton.tsx
  switch.tsx
  … 6 more
utils/
  _try.ts
  api-fetch.ts
  objectId_check.ts
  revalidate.ts
  shadcn.ts
  switch-theme.ts
.env.local
.gitignore
.mcp.json
AGENTS.md
CMS blog.code-workspace
FEATURES.md
README.md
RFC.md
auto_cleaner_restore.bat
bun.lock
… 10 more
```
<!-- sinapsi:end -->

**Read this first, and usually only this.** It is the cardinal read at the start of every
patch: the project's shape (above), the last sessions at a glance, and a short recap. Open
`session.md` or `handoff.md` only when this file leaves your actual question unanswered.

## Recent sessions

<!-- The last 10 patches, newest first: `- <timestamp> — <one line>`. Appended by the
     agent at the end of every patch, at the same time it appends session.md. Drop the
     11th; the full history is in session.md and, once archived, in archive/. -->

- 2026-07-22T01:34:41+02:00 — Reproduced the baseline and accepted the libSQL/Better Auth modular-monolith foundation.

## Where things stand

<!-- 5–10 lines, no more. What the project is doing right now, what is in flight, what is
     fragile, what the next action is. Rewritten (not appended) from session.md + handoff.md
     at the end of every patch. If it grows past 10 lines it has stopped being a summary. -->

- `feat/rfc-editorial-cms` is based on current `origin/main`; pre-existing user work is preserved.
- RFC 001/ADR 001 select Next.js 16, Drizzle/libSQL and Better Auth for one modular monolith.
- Baseline: frozen install fails; 42 type errors; 93 lint errors/39 warnings; bypassed build.
- Runtime audit has 48 findings (2 critical, 22 high); no tests or CI exist.
- Historical provider values exist in commit `8f83cec`; never print them and require rotation.
- P-01–P-18 closure evidence is tracked in `docs/engineering/rfc-closure-ledger.md`.
- Next: complete Phase 0 dependency, secret, strict-quality and CI containment gates.
