# Decisions

Semantic memory: one line per decision — the reasoning that must survive, not the diff.
Format: `- YYYY-MM-DD: chose X over Y because Z`. Consult before re-opening a settled choice.
Big, irreversible architectural decisions belong in `adr/` instead.

- 2026-07-22: rely on the pinned TruffleHog action's built-in fail/no-update flags because duplicating them in `extra_args` aborts before scanning.
