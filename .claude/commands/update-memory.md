---
description: Update PROJECT_MEMORY.md for a change, without rewriting the whole file
argument-hint: [description of the change — e.g. "added guest checkout cart drawer"]
---

Update `PROJECT_MEMORY.md` based on this change:

$ARGUMENTS

Rules:
- Identify which section(s) this affects using the mapping table in `CLAUDE.md`
  (Database Schema / API & Supabase Interactions / Payment Flow / UX Principles / RBAC / Core
  Modules / Key Decisions).
- Update **only** those sections. Leave every other section byte-for-byte as it is.
- Edit existing bullets in place rather than appending near-duplicates.
- Keep entries as tight as the existing ones — this file is read by AI tools before every task,
  not a changelog for humans.
- Bump the header: increment `Version` (patch for a small update, minor for a new module/table),
  set `Last Updated` to today's date, replace `Last Change` with a one-line description of this
  change.
- If you can't tell which section the change belongs in, or it seems to contradict something
  under "Key Decisions", stop and ask instead of guessing.

Show a short diff-style summary of what changed after editing.
