# CLAUDE.md

Read [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md) at the start of every session before exploring the
codebase. It is the single source of truth for current architecture, schema, and status — treat a
full codebase scan as a fallback, not the default.

## Keeping PROJECT_MEMORY.md and WALKTHROUGH.md current

After completing any phase, implementation, or feature change:
1. Update [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md) (bump version, set `Last Change`, update affected sections).
2. Update [`WALKTHROUGH.md`](./WALKTHROUGH.md) (add a new section/subsection for the completed phase, what was built, code highlights, and verification results).
3. Do both updates **in the same turn** before ending your response.

| Change type | Section to update in PROJECT_MEMORY.md |
|---|---|
| New table / column / migration | Database Schema |
| New or changed API route / RPC | API / Supabase Interactions |
| Payment logic change | Payment Flow |
| UI flow / checkout / navigation change | UX Principles |
| Role or permission change | RBAC |
| New feature or module | Core Modules |
| Architecture-level call (library swap, integration decision) | Key Decisions |

Rules:
- **Edit, don't rewrite.** Change only the affected section(s); leave headings, ordering, and
  untouched sections exactly as they are.
- **No duplication.** If a bullet already covers the topic, update it in place instead of adding a
  new one.
- **Stay concise.** This file is read by AI tools before every task — verbose entries defeat its
  purpose. Prefer one tight bullet over a paragraph.
- **Bump the header every time:** increment `Version` (patch for a small update, minor for a new
  module/table), set `Last Updated` to today's date, and replace `Last Change` with a short
  description of what just happened.
- **If the change's scope is ambiguous** — you can't tell which section it belongs in, or whether
  it contradicts an existing "Key Decision" — ask before editing rather than guessing.

The `/update-memory` command (`.claude/commands/update-memory.md`) runs this same protocol on
demand for a change described after the fact (e.g. work done outside this tool).
