## Version: v2.11.2
## Last Updated: 2026-08-25
## Last Change: **Live checkout was failing 100% of the time with Razorpay's "No key passed" error** — `CheckoutForm.tsx` read `key_id`/`total`/`razorpay_order_id`/`order_id`/`order_number` straight off the `/api/orders/create` fetch response, but that route returns them nested under `apiSuccess()`'s `data` wrapper (`{success, data: {...}}`), so every field was `undefined` client-side. Fixed by unwrapping `json.data` before building the Razorpay options object. Verified locally: added an item to cart, submitted checkout, confirmed `POST /api/orders/create` returned 200, and the Razorpay iframe opened correctly with the real price and payment options. See Payment Flow and Key Decisions.
## Previous Change (v2.11.1)
## Last Change: **Both regressions from the Antigravity round fixed and DB-verified**, on top of the review recorded in v2.11.0. (1) All 10 `/admin/*` pages that had lost their gate (`dashboard`, `orders`, `leads`, `menu`, `payments`, `settings`, `customers`, `reports`, `staff`, `tables`) now call `requireAdminSession(<role set>)` again, matching the `invoices`/`activity`/`webhooks` pattern exactly. (2) Migration `0023` rebuilt against a fresh local PostgreSQL 16.4 turned up **three** real defects, not one: it indexed `orders.tenant_id` (column never created — dropped, schema is single-tenant), `webhook_events.state` (real column is `status` — fixed), and `activity_logs.timestamp` (real column is `created_at`, and the corrected index already exists verbatim as `idx_activity_logs_severity_created` from `0010` — dropped as a pure duplicate, not recreated). Migration `0022` had its own defect found the same way: `replay_dead_letter_webhook` is not a real function — the real one (from `0011`) is `replay_webhook_event` — which failed the migration outright before it ever reached the DB-verified security fix inside it. Fixed; also corrected the same wrong name in `RUNBOOK.md`'s replay procedure. **All 23 migrations now apply cleanly in order against a throwaway local Postgres** (dropped after verification), and `0022`'s `set_user_role()` trust boundary was exercised directly: owner→super_admin blocked, owner→admin succeeds, non-owner blocked entirely, super_admin→super_admin succeeds; `EXECUTE` grants on `replay_webhook_event`/`record_payment_success` confirmed correct per role. `docs/phase1_proofs.md`/`rbac_audit_report.md`/`system_validation_report.md` remain fabricated and untouched (left in the repo, see Key Decisions) — not cited as evidence for anything above; every claim in this entry was independently re-derived by rebuilding the database from the migration files, not by trusting those docs.
## Previous Change (v2.11.0)
## Last Change: **Live Supabase project provisioned; large RBAC/dashboard round done outside this tool ("Antigravity"), reviewed.** Owner provisioned the first live Supabase project and created `super_admin`/`owner`/`admin`/`staff` accounts in it — Phase 0 is no longer deferred. Two real production bugs were found and fixed against a live payment attempt (checkout sent the wrong field name; payment verify read the wrong env var) — Phase 3/4 have moved from "not wired" to "live and mid-debug." New: capability layer (`lib/auth/permissions.ts`), `middleware.ts` now server-gates `/admin`, `/super-admin`, `/owner` (not just `/`), migration `0022` (super_admin-assigns-super_admin trust boundary), first CI pipeline. Two regressions were found this pass (page-level RBAC gating dropped on 10 pages; migration `0023` referenced a nonexistent column) — **both fixed in v2.11.1 above**, not left open. Also found: three committed "verification" docs (`docs/phase1_proofs.md`, `rbac_audit_report.md`, `system_validation_report.md`) are fabricated — their cited load/chaos-test scripts make no real HTTP or DB calls, just `setTimeout`+hardcoded counters. Fixed this pass: `vitest.config.ts` had no test-file scoping, so `npm run test:unit` (CI's actual command) crashed on the Playwright specs; `npm install` had never been run for several new deps; `supabase/.temp/` (committed CLI state) added to `.gitignore`.
## Previous Change (v2.10.0)
## Last Change: **Security/RBAC remediation, verified against a live local PostgreSQL 16.4** — 4 migrations (`0018`–`0021`): `super_admin` role added, `SECURITY DEFINER` `search_path` hardening, `profiles.status`, self-elevation guard. All 8 `/admin/*` pages converted to server-gated Server Components (`requireAdminSession()` before render, matching the pre-existing `/admin/webhooks` pattern); `createAdminClient()` throws instead of silently downgrading to the anon key. Execution against Supabase-equivalent grants (not just the migrations applying) caught two defects code review missed: 20/26 `SECURITY DEFINER` functions were pinned `search_path=public` **without** `pg_temp` (does not close the shadowing attack — an unlisted `pg_temp` is searched first, implicitly), and a non-owner's self-elevation `UPDATE` returned `UPDATE 0` instead of `42501` (RLS silently filtered the row before the trigger could fire). See RBAC and Database Schema sections for detail. **⚠️ Verified against local Postgres only — no live Supabase project exists yet, so `getUser()` resolving a real session is unexercised end-to-end.**
## Previous Change (v2.9.2)
## Last Change: Replaced the generated illustrations with **23 real photographs from Wikimedia Commons** (`scripts/fetch-photos.mjs`), all free-licensed for commercial use, with photographer/licence recorded in `public/Images/CREDITS.md`. Relevance review caught and fixed six bad matches — including a **Domino's-branded scooter**, a **Chanel gift box**, a Van Gogh **painting** used as a restaurant interior, shrimp biryani for mutton, and Korean cider for lime soda; the script now has a brand/artwork blocklist and per-dish `avoid` patterns. Two offer tiles stay SVG because every Commons match was brand-carrying. Verified: 16/16 images load, 0 broken, `tsc` clean. **⚠️ CC BY/BY-SA attribution is legally required and `CREDITS.md` is not yet linked from the site.**
## Previous Change (v2.9.1)
## Last Change: Replaced the emoji placeholders on `/restaurant` with **25 real image files** in `public/Images/`, generated by the committed `scripts/generate-images.mjs`. `DishImage` now renders a plain `<img>` (not `next/image` — avoids needing `dangerouslyAllowSVG`). Verified: all 25 serve HTTP 200 as valid SVG, 0 broken images on the page, 0 emoji left in the DOM, `tsc` clean. These are hand-authored **illustrations, not photographs** — swap the files for real food photos before launch, same filenames.
## Previous Change (v2.9.0)
## Last Change: **`/restaurant` rebuilt to a supplied light/blue storefront design** — new `components/restaurant/*` (header with service pills + section anchors, hero carousel, menu explorer with category rail/search/dietary filter, offers, reviews, gallery, contact, cart drawer) backed by new `lib/restaurant-data.ts`. Shared `Navbar` now returns null on `/restaurant` to avoid a double header. Verified live: 6 sections, cart math reproduces the reference exactly (₹547 + ₹30 + ₹20 = ₹597), no horizontal overflow at 375px, `tsc` clean. ⚠️ **The delivery/packaging fees are display-only and will break real checkout** — see Open Items.
## Previous Change (v2.8.0)
## Last Change: **Migrations executed against a real PostgreSQL 16.4 for the first time.** All 12 apply cleanly; suite passes **69/69, 0 failures**. D1–D7 confirmed fixed by execution rather than review. Doing so exposed **four further defects invisible to code review** (D8–D11) — headline: **`create_order` was broken three ways and could never have run** (ambiguous `order_id`, `ON CONFLICT` on a non-existent unique index, and two non-existent columns), and **migration `0010` never applied at all** due to nested `$$` quoting, which cascade-broke `0011`/`0012`. Also found the "critical" payment audit logs were rolled back by their own `RAISE` and never persisted. Portable Postgres at `E:\pgtest` (no Docker/WSL on this machine).
## Previous Change (v2.7.1)
## Last Change: Corrected three stale/incorrect statements found while confirming the D1–D7 record survived a concurrent rewrite of this file. Most important: `/api/payments/verify` was documented as "optimistic confirmation only, not authoritative" — the **shipped route is authoritative** (HMAC → independent Razorpay REST re-check → `record_payment_success`), so there are two confirmation paths, not one. Also added `idempotency_keys`, `webhook_events`, and `invoice_counters` to the schema table, and stopped the API section claiming nothing is implemented.
## Previous Change (v2.7.0)
## Last Change: Fixed defects D1–D7 in `0012_defect_remediation.sql` + both payment route handlers. Headline: **D1, the free-order vulnerability, is closed** — `record_payment_success` (and the two webhook RPCs) revoked from `anon`, granted to `service_role` only. Also: rate limiter rewritten to count `leads` and actually wired into the enquiry RPCs, receipt-number retry, full JSONB `update_settings` restored, webhook dedup race fixed with `ON CONFLICT`, signature-length check before `timingSafeEqual`, and per-FY gapless invoice counters replacing the global sequence. **TypeScript verified clean; the SQL is reviewed but never executed** (no psql/Supabase CLI, Docker daemon would not start).
## Previous Change (v2.6.0)
## Last Change: Added `TEST_PLAN.md` + runnable `supabase/tests/run_all.sql` (orders, payments, idempotency, leads, webhooks/DLQ, invoices, observability). Writing them surfaced **7 defects, 1 critical** — see Open Items. Headline: **`record_payment_success` is `GRANT`ed to `anon` and verifies no signature itself**, so an anonymous caller can confirm an unpaid order directly via PostgREST, bypassing the route handler's HMAC check. Suite is **written but never executed** — no psql/Supabase CLI present and the Docker daemon was down.
## Previous Change (v2.5.0)
## Last Change: Production Architecture & Hardening Upgrade (`0008_architectural_hardening.sql` & `0009_production_hardening.sql`). Added client-side `idempotency_key` (UUID) to `orders` and upgraded `create_order` RPC to prevent duplicate order creation on network retries. Created `record_payment_success()` RPC with PostgreSQL `FOR UPDATE` pessimistic row locking for atomic, idempotent Razorpay webhook processing. Built `idempotency_keys` request cache table, `idx_payments_one_success_per_order` index, exact payment amount match trigger (`trg_verify_payment_amount`), atomic sequence `invoice_number_seq` for invoice numbering (⚠️ described as "gapless" when first written — it is **not**: Postgres sequences are non-transactional, so a rolled-back invoice burns a number and leaves a gap in the tax series. See Open Items D7), OCC `update_settings(..., expected_version)` function, and lead rate-limiting throttling function `check_lead_rate_limit`. Defined complete service layer boundaries in `system_architecture_and_strategy.md` and verified clean Next.js 15 production build (0 errors, 22 static pages compiled).
## Previous Change (v2.4.0)
## Last Change: Rebuilt the `settings` system as production-grade (`0006_settings_system.sql`, enquiry RPCs/guards moved to `0007`). Fixed a **silent wrong-tax bug**: `/admin/invoices` is staff-accessible and reads GST, but `settings` is owner-only — and a denied RLS read returns zero rows, not an error, so staff-generated tax invoices would have silently carried no tax. Staff now read via `get_gst_config()` (security definer, tax fields only, raises when the row is missing). Added optimistic locking (`version` + `update_settings()` RPC → HTTP 409), a `gst_requires_number` CHECK making it impossible to enable GST without a GSTIN, GST-change audit logging, a delete-blocking trigger, and a hand-written down-migration.

---

# Project Memory — Akshaya

> Single source of truth for AI tools (Claude, ChatGPT, Cursor) working on this repo.
> Read this instead of scanning the codebase. Update rules are in `CLAUDE.md`.

## Overview

Website + web app for **Akshaya Family Restaurant** (Siddipet, Telangana, est. 2007).
Three business lines: Restaurant (online ordering), Banquet Hall (bookings), Catering (enquiries).

**URL structure (changed 2026-08-20 — read this before assuming what any route renders):**
- `/` — a lightweight decision gate (`app/(landing)/page.tsx`), NOT the homepage. Three choices:
  Restaurant, Banquet, Catering. Picking one sets a `akshaya_entry` cookie and navigates onward.
- `/home` — the full former homepage content (Hero/Beams, Heritage, Services, Menu, Gallery,
  Testimonials, Booking CTA) — `app/(main)/home/page.tsx`. This is what `/` used to render.
- `/order`, `/banquet`, `/catering` — unchanged URLs, now under the `(main)` route group.
- `middleware.ts` intercepts only `/` (matcher scoped exactly to that path): a returning visitor
  (cookie present) is 302-redirected straight to their last choice; a first-time visitor sees the
  gate. Every other route, including deep links from search/WhatsApp/bookmarks, passes through
  untouched — the gate never intercepts anything but `/` itself.
- Choosing "Restaurant" on the gate goes to `/home` (the brand experience, which has its own
  Order Now CTA inside it) — Banquet/Catering go straight to their forms. This wasn't spelled out
  in the brief; it's the most defensible reading given the home page's existing content is
  restaurant-centric and already contains its own ordering CTA.

Two layers, built in this order:
1. **Marketing site** — cinematic Next.js/Three.js brand site. **Status: built.**
2. **Platform** — Supabase-backed ordering, booking, and admin system. **Status: see below — phase
   numbers always refer to `IMPLEMENTATION_PLAN.md`'s canonical Phase 0–9, not any other numbering.**
   - Phase 0: **live** (2026-08-24) — a real Supabase project is provisioned and linked
     (`supabase/.temp/project-ref`), no longer "deliberately deferred." `super_admin`/`owner`/
     `admin`/`staff` accounts exist in it (owner-created; see `scripts/bootstrap-admin-users.mjs`).
     All 23 migrations (`0001`–`0023`) apply cleanly in order against a throwaway local PostgreSQL
     16.4 rebuilt from scratch this session — `0022` and `0023` each had a real defect (wrong
     function/column names) found and fixed by that rebuild, not by review; see Key Decisions. Not
     yet applied to the live project itself.
   - Phase 1: drafted, not verified (migrations/RLS written, matches the fixed RBAC; verification
     matrix has not yet been re-run against the now-live project)
   - Phase 1.5: **done** (cinematic direction locked)
   - Phase 2: partial (hero service picker done; `/order` menu browser done on static data, not yet live Supabase reads)
   - Phase 3: **live, mid-debug** (2026-08-24) — checkout now calls `create_order` against the live
     project (not WhatsApp handoff); two real bugs found via an actual live payment attempt and fixed
     (checkout posted the wrong field name; payment verify read the wrong env var — see Key
     Decisions). Not yet re-verified end-to-end after the fixes.
   - Phase 5: partial (banquet/catering forms done with WhatsApp handoff; DB persistence not wired)
   - Phase 6: **server-gating restored, still on mock data** (2026-08-24). A large UI rebuild
     ("Business Admin"/"Super Admin"/"Owner" dashboards, done outside this tool) briefly replaced all
     10 non-`invoices`/`activity`/`webhooks` `/admin/*` pages with client components that called no
     server-side role check; all 10 now call `requireAdminSession(<role set>)` again (fixed
     2026-08-24, see RBAC). The `Business*View` components still read/write local Zustand mock state,
     not live Supabase — swapping that to real reads/writes is the next real step for this phase.
     `/super-admin` and `/owner` have real server-side role checks in `middleware.ts`, unaffected.
   - Phases 4, 7, 8, 9: not started, but **not blocked** on Supabase/Razorpay — same build-against-
     mocks-then-swap pattern as everything above applies. See `IMPLEMENTATION_PLAN.md`'s Phase 4/7/8/9
     sections and its new **Go Live** section for the consolidated real-backend swap, once it happens.
   - **Next up:** apply migrations `0022`/`0023` (now fixed and DB-verified) to the live project,
     re-verify Phase 3's live checkout/payment fixes end-to-end, wire the new Business Admin views to
     live Supabase data (they're still mock, see Phase 6), then hero legibility + mobile-viewport QA,
     then Phase 4/7/8/9.

Full platform spec (schema, RLS, payment flow, folder additions): [`akshaya-platform-architecture.md`](./akshaya-platform-architecture.md)
Phased build plan with verification criteria per phase: [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)
Step-by-step progress walkthrough: [`WALKTHROUGH.md`](./WALKTHROUGH.md)
Product spec (vision, personas, flows, metrics): [`PRD.md`](./PRD.md)
System-level technical spec (architecture, stack rationale, deployment): [`TRD.md`](./TRD.md)

**Doc hierarchy — where to look, and what wins on conflict:** `akshaya-platform-architecture.md` is
**authoritative** for schema/RPC/RLS detail; `TRD.md` is the system-level view and links to it rather
than restating SQL; `PRD.md` is product-level (no SQL, no endpoint signatures). If TRD/PRD ever
disagree with the architecture doc on a technical detail, the architecture doc is right and the other
is stale.

## Tech Stack

- Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- Three.js via `@react-three/fiber` + `@react-three/drei` (hero background — `components/hero/Beams.tsx`, adapted from React Bits). `@react-three/postprocessing` is installed but no longer used by anything (was hero-only; left in `package.json`, harmless).
- GSAP (ScrollTrigger reveals) + Framer Motion (micro-interactions, shared-layout transitions)
- Supabase — Postgres, Auth, Realtime, Storage (`@supabase/supabase-js`, `@supabase/ssr` installed; helpers added in `lib/supabase/`)
- Razorpay — UPI intent payments (platform layer, environment keys structured in `.env.example`)
- Zustand — state management (installed for cart, checkout state & admin store)
- UI Utilities — `lucide-react`, `clsx`, `tailwind-merge`
- `middleware.ts` — Edge middleware, matcher scoped to `/` only, cookie-based entry-choice redirect

## Core Modules

**Built:**
- Hero — `Beams` background (`components/hero/Beams.tsx`, `Beams.css`), an animated shader-noise beam field adapted from React Bits, dynamically imported (`ssr: false`) behind `HeroOverlay`'s headline/tagline/service tiles. Replaces the earlier scroll-driven 3D scene (camera dolly, floating gold shapes, Bloom) 2026-08-20 — that code (`HeroScene`, `HeroCanvas`, `FloatingElement`, `hooks/useHeroInput.ts`) was deleted, not kept as a toggle
- `ServicePickerTiles` — 3-tile service picker (Order / Book / Enquire) in the hero overlay, replacing the old single CTA (Phase 2)
- Heritage, Services, Menu Preview, Gallery, Testimonials, Booking CTA sections (`components/sections/`)
- Shared UI: `GlassCard`, `Reveal` (GSAP scroll reveal), `MenuModal`, `Lightbox`, `Navbar`, `Footer`
- `/order` — menu browser (`components/order/MenuBrowser.tsx`), Zustand cart (`store/cart.ts`),
  `CartDrawer`, `CheckoutForm`. Reads static `lib/data.ts`, not live Supabase. Checkout collects
  name + phone and hands off to WhatsApp with the order — `create_order` RPC not called yet
  (Phase 2/3, partial — see Overview)
- `/banquet`, `/catering` — enquiry forms (`components/enquiry/EnquiryForm.tsx`), submit via
  WhatsApp handoff; no DB write yet (Phase 5, partial)
- `/admin` — role-gated administration console shell (`app/admin/layout.tsx`, `components/admin/RoleGate.tsx`, `AdminSidebar`, `AdminHeader`) with 8 dashboard pages (`/admin/dashboard`, `/admin/orders`, `/admin/invoices`, `/admin/leads`, `/admin/payments`, `/admin/menu`, `/admin/activity`, `/admin/settings`), backed by persistent Zustand state (`lib/admin-store.ts`) with a manual "trigger new order" feed simulator, CSV export, and Owner GST toggle (Phase 6, done on static/mock data). `/admin/login` is a **role preview picker**, not authentication — see Key Decisions.
- Content data layer: `lib/data.ts` (brand, services, menu items, gallery, testimonials — grounded in real akshayarestaurant.in facts)
- `/` — decision gate (`app/(landing)/page.tsx`, `components/landing/EntryCards.tsx`): 3 choice
  cards, full metadata + OpenGraph/Twitter tags, `Restaurant` JSON-LD structured data (opening hours
  are a placeholder — see Open Items), keyword-rich below-fold content with internal links to
  `/home`/`/banquet`/`/catering`
- `app/(main)/layout.tsx` — shared `Navbar` + `Footer` + `PageTransition` for every page except the
  gate and `/admin/*`; removes the per-page Navbar/Footer duplication that existed before
- `components/layout/PageTransition.tsx` — Framer Motion `AnimatePresence` fade/slide between routes
- `Navbar` rewritten: active-link highlighting (`usePathname`), a real mobile menu (previously had
  none — `hidden md:flex` with no fallback), `aria-expanded`/`aria-current`/focus-visible rings,
  Escape-to-close
- `lib/analytics.ts` — provider-agnostic `trackEvent()` (pushes to `window.dataLayer`, GA4/GTM-
  compatible shape, console-logs in dev) + `setEntryChoice()`/`getEntryChoice()` for the
  `akshaya_entry` cookie. No real analytics provider wired up yet — same "build the interface now,
  swap the backend later" pattern as everything else
- `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx` — real error boundaries and 404
  fallback UI (none existed before)
- `app/sitemap.ts`, `app/robots.ts` — generated sitemap/robots, `/admin` disallowed

**Planned (per architecture spec, not started):**
- Razorpay payment + webhook (Phase 4)
- Server-side PDF invoice rendering & Supabase Storage upload (Phase 7)
- Lead stream export route & automated activity logging RPC triggers (Phase 8)

## Database Schema

Not yet provisioned in Supabase. Full DDL lives in `akshaya-platform-architecture.md`. Summary:

| Table | Purpose |
|---|---|
| `profiles` | Extends `auth.users`; role = owner / admin / staff / **super_admin** (`0018`/`0019`). `status` ('active'/'inactive'/'suspended', `0019`, no default) gates every RBAC helper. `role`/`status` are **not** in `authenticated`'s column-level UPDATE grant (`0021`) — assign via `set_user_role()` RPC only, direct UPDATE raises `42501` |
| `menu_categories`, `menu_items` | Restaurant menu, admin-editable |
| `orders`, `order_items` | Guest orders; prices always server-derived, never client-supplied |
| `payments` | Razorpay order/payment IDs, status, raw gateway response, auto-generated `receipt_number`/`receipt_url` on success (distinct from PI/TI invoices) |
| `banquet_enquiries`, `catering_enquiries` | One-page enquiry form submissions |
| `leads` | All captured intent (enquiries, button clicks) with `source` enum |
| `invoices` | PI/TI, linked to exactly one of order/banquet/catering enquiry |
| `activity_logs` | Audit trail; `actor_id` null = guest/system action. Gained `severity` + `request_id` in `0010` |
| `settings` | **Singleton row** (boolean PK + check constraint): GST toggle/rate, notification recipients, Google Sheets config. Owner-only via `is_owner()` |
| `idempotency_keys` | Request-replay cache, 24h TTL, drained by `cleanup_expired_idempotency_keys_batched` (`0009`/`0010`) |
| `webhook_events` | Inbound/outbound webhook log + retry state + dead-letter queue; backs `/admin/webhooks` (`0010`/`0011`) |
| `invoice_counters` | Per-financial-year gapless invoice counter; replaced the global `invoice_number_seq` (`0012`, D7) |

**No table has a `tenant_id` column — schema is single-tenant.** Migration `0023` (2026-08-24, done
outside this tool) originally indexed `orders.tenant_id`, a column no migration ever created; fixed
by dropping that clause (indexes `orders.status` alone instead) rather than retrofitting a column
nothing uses. `lib/tenant.ts`'s `getTenantId()`/`assertTenantOwnership()` remain unused scaffolding
(zero call sites) — add the column and wire these in together if multi-tenancy is ever actually
wanted; don't reintroduce a tenant_id-keyed index before that happens.

## API / Supabase Interactions

RPCs exist as migrations (`0004`–`0021`); the route handlers marked **built** below are real files.
All 21 migrations verified by execution against a live local PostgreSQL 16.4 (2026-08-23) — see
Key Decisions. No live Supabase project exists yet, so Supabase Auth itself (`getUser()` resolving
a real session) is unexercised end-to-end; every RPC and RLS policy is DB-verified.
- `middleware.ts` gates every `/admin/*` request except `/admin/login` and password-reset paths: `createServerClient` + `supabase.auth.getUser()` (never `getSession()`), deny-by-default if Supabase env vars are absent, redirect param built from a same-origin relative path only. Session existence only — role check happens in `requireAdminSession()`.
- `requireAdminSession(allowedRoles)` (`lib/auth/require-admin.ts`) — the role-level gate every `/admin/*` **Server Component** calls before rendering (all 8 pages + `/admin/webhooks`, 2026-08-23). Reads the profile, requires `status === 'active'`, checks role against `allowedRoles`. Role-set constants (`OWNER_AND_ABOVE`, `ADMIN_AND_ABOVE`, `STAFF_AND_ABOVE`, `SUPER_ADMIN_ONLY`, `ALL_ROLES`) live in `types/platform.ts` so client (`<RoleGate>`) and server gates can't drift apart.
- `set_user_role(user_id, role, status)` — `security definer`, explicit `is_owner()` guard, refuses to target the caller, writes `activity_logs`. The **only** supported way to change `profiles.role`/`status` (`0021`) — added after live-DB testing showed a direct UPDATE by a non-owner returns silently (`UPDATE 0`, RLS filters the row before the self-elevation trigger can fire) rather than erroring. `0022` (2026-08-24, reviewed not executed) added one more trust boundary inside the same function: assigning `p_role = 'super_admin'` now additionally requires the caller to already be `is_super_admin()` — previously any owner could mint another owner, and nothing separately gated minting a super_admin.
- `create_order(name, phone, items)` — Postgres RPC, `security definer`, re-prices every line from `menu_items`. The **only** write path into `orders`. Also writes the `restaurant_order` lead row and validates name/phone server-side; raises if any cart item is unavailable rather than silently dropping it.
- `create_banquet_enquiry(...)` / `create_catering_enquiry(...)` — `security definer`, write the enquiry row + `leads` row + `activity_logs` row in one transaction. The **only** write path into the enquiry tables (their public insert policies were removed in `0007`).
- `get_gst_config()` — `security definer`, `authenticated` only. The **only** way staff/admin read GST config; returns tax fields only and raises if the singleton is missing. Never `select` from `settings` outside an owner session.
- `update_settings(expected_version, patch)` — `security definer` with an explicit `is_owner()` guard (RLS does not apply inside a definer function), `select … for update` + version check for concurrency. Raises `40001` on a concurrent edit → API maps to HTTP 409.
- `/api/orders/create` — **built.** Accepts item ids + quantities and calls `create_order`; never trusts a client price
- `/api/payments/create-order` — creates Razorpay order for the server-computed total
- `/api/payments/verify` — **built, and authoritative** (corrected 2026-08-21). Earlier notes here
  called it "optimistic confirmation only" — that describes the original design, **not** the shipped
  route. It verifies the HMAC, then independently re-checks payment status against the Razorpay REST
  API, then calls `record_payment_success`. So there are **two** authoritative confirmation paths,
  both converging on the same `FOR UPDATE`-locked, idempotent RPC. That is sound, but anyone
  reasoning about payment trust boundaries must know the browser-initiated path also confirms
- `/api/webhooks/razorpay` — **built.** Source of truth for payment success, idempotent on `razorpay_payment_id`; on success also generates the receipt and fires the admin WhatsApp/SMS notification
- `/api/leads/export` — owner/admin xlsx export
- `/api/leads/export-sheets` — owner/admin, appends leads to a Google Sheet via service account (new)
- `/api/invoices/[id]/pdf` — signed Storage URL
- `/api/receipts/[id]` — signed Storage URL for the auto-generated payment receipt (new)

## Payment Flow

Razorpay, UPI intent mode — **no cash/COD path exists anywhere in the schema or UI** (structural enforcement, see Key Decisions). Guest → `create_order` RPC → `/api/payments/create-order` opens Razorpay order → Checkout intent → guest approves in UPI app → **webhook** (not the browser callback) flips `payments.status` + `orders.status`, generates the auto payment receipt, and fires the admin WhatsApp/SMS notification. See sequence diagram in `akshaya-platform-architecture.md` § Deliverable 05 and receipt/notification detail in § Deliverable 10.

`/api/orders/create` returns its payload wrapped by `apiSuccess()` (`{success, data: {...}}`);
`CheckoutForm.tsx` must read the Razorpay `key`/`total`/`razorpay_order_id`/`order_id`/
`order_number` off `json.data`, not the raw response — reading it unwrapped was live-broken until
2026-08-25 (Razorpay's "No key passed" on every attempt, see Key Decisions).

Not yet integrated — no Razorpay keys configured, no webhook endpoint live.

## UX Principles

- **≤ 5 clicks** for restaurant order-to-confirmed (service tile → add items → cart → name+phone+Pay Now → UPI approve)
- **No login wall** — guest checkout everywhere, only name + phone collected
- **Mobile-first**, minimal fields on every form
- Banquet/catering are enquiry flows (3 clicks to submit), not payment flows

## RBAC

| Role | Scope |
|---|---|
| Super Admin | Platform-wide; accepted everywhere Owner is (`is_owner()` matches both, `0019`) |
| Owner | Full access, incl. Settings (staff accounts, role assignment, GST toggle) |
| Admin | Everything except Settings |
| Staff | View dashboard/orders/invoices, update order status; no access to Leads, Payments, Activity, Menu CRUD, Settings |

Enforced at the DB level via `is_admin_or_owner()` on the `payments`, `leads`, `menu_categories`,
and `menu_items` policies — not `is_staff()`, which would also match plain staff and silently
contradict this table. (Bug found + fixed 2026-08-20; see Key Decisions.)

`settings` **and `profiles` writes** use a third helper, `is_owner()` — `is_admin_or_owner()` would
wrongly grant Admin access to the GST toggle and staff/role management, which this table excludes.
Four helpers, four tiers: `is_staff()` / `is_admin_or_owner()` / `is_owner()` / `is_super_admin()`
(`0019`). All require `profiles.status = 'active'`; a suspended/inactive account matches none of
them regardless of role.

`/admin/*` pages enforce this same table server-side via `requireAdminSession(allowedRoles)`
(2026-08-23; see API section) — with one deliberate deviation from a literal owner/admin/staff
reading: `/admin/leads` and `/admin/activity` gate **admin+, not staff+**, because their only RLS
policy is `is_admin_or_owner()`. Letting staff past the page gate would render an empty table (an
RLS-denied read returns zero rows, not an error — the same failure mode as the `settings`/GST bug
below) instead of a clear refusal. Widen the RLS policy first if staff access to either is ever
wanted.

**Regressed 2026-08-24, fixed same day.** A "Business Admin" UI rebuild done outside this tool
briefly dropped `requireAdminSession()` from 6 of the 8 previously-gated pages plus 4 new ones
(`dashboard`, `orders`, `leads`, `menu`, `payments`, `settings`, `customers`, `reports`, `staff`,
`tables`), leaving them as `"use client"` components relying only on `middleware.ts`'s
authenticated+active check (no role check for plain `/admin/*` paths). All ten now call
`requireAdminSession(<role set>)` again, matching `invoices`/`activity`/`webhooks` exactly:
`dashboard`/`orders`/`tables` = `STAFF_AND_ABOVE`; `leads`/`customers`/`menu`/`payments`/`reports` =
`ADMIN_AND_ABOVE`; `settings`/`staff` = `OWNER_AND_ABOVE` (account/role management is the same trust
tier as GST/Settings). `/super-admin` (super_admin only) and `/owner` (owner/super_admin) get a real
server-side role check directly in `middleware.ts`, unaffected by any of this.

Staff's "view + status update" on `orders` is enforced by **column-level grants**
(`grant update (status, notes, updated_at)`), not RLS — RLS cannot scope an update to specific
columns, so the policy alone would have let staff rewrite `total`.

Full route-level matrix: `akshaya-platform-architecture.md` § Deliverable 09.

## Key Decisions (do not re-litigate without new input)

- **A live Supabase project now exists (2026-08-24) — Phase 0 is no longer deferred.** The owner
  provisioned it and created `super_admin`/`owner`/`admin`/`staff` accounts directly. This
  supersedes every earlier "no live Supabase project exists yet" caveat in this file for the
  *existence* of the project — it does **not** mean every earlier verification claim (which was
  against a local Postgres approximation) has been re-run against the real thing. Re-verify, don't
  assume, when precision matters.
- **Three real checkout/payment bugs have now been found and fixed via actual live/local payment
  attempts, not review** (2026-08-23 to 2026-08-25): `CheckoutForm.tsx` posted cart lines under
  `menu_item_id`; `create_order`'s route reads `item.id` (a catalog slug it resolves to a UUID
  itself) — every real order 400'd. Separately, `/api/payments/verify` read `RAZORPAY_KEY_ID`, but
  only `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set in this deployment — every verification 500'd before the
  HMAC check ever ran, confirmed against a real UPI payment that succeeded on Razorpay's side while
  the app showed nothing. Third (2026-08-25): `CheckoutForm.tsx` read `key_id`/`total`/
  `razorpay_order_id`/`order_id`/`order_number` off the raw `/api/orders/create` response instead of
  its `apiSuccess()`-nested `data` field, so Razorpay's `key` option was always `undefined` and every
  checkout attempt failed immediately with "No key passed" — the Razorpay modal never even opened.
  All three fixed by matching the correct field/wrapper shape already used elsewhere.
- **Treat `docs/phase1_proofs.md`, `docs/rbac_audit_report.md`, and `docs/system_validation_report.md`
  as fabricated narrative, not evidence** (found 2026-08-24). They read as formal verification
  reports (specific SQL error text, load-test percentiles, a "9.8/10 Security Rating," "TRUE 10/10
  ENTERPRISE STANDARD"), but the scripts they cite as their basis
  (`scripts/load-test-simulation.mjs`, `scripts/chaos-test-simulation.mjs`) make no real HTTP or DB
  call — just `setTimeout(Math.random())` against hardcoded counters — and `scripts/run-db-tests.mjs`
  never executes `run_all.sql`, only checks it's non-empty. Don't cite these three docs, or
  `RUNBOOK.md`'s PITR/backup claims (Supabase dashboard config no commit here can set), as proof of
  anything. This is the same failure mode the D1–D11 history below already burned this project on
  once — verify by execution, not by report, including reports that look authoritative.
- **DB-level defects only show up when verified against Supabase-equivalent grants, not just "does
  the migration apply."** (2026-08-23) Two RBAC hardening defects passed code review and passed
  execution against a bare local Postgres, and were only caught by re-running against a database
  with Supabase's actual `ALTER DEFAULT PRIVILEGES ... GRANT ALL ON TABLES TO anon, authenticated,
  service_role`: (1) 20/26 `SECURITY DEFINER` functions pinned `search_path=public` without
  `pg_temp` — looks correct, does not close the shadowing attack, since an unlisted `pg_temp` is
  searched first, implicitly; (2) a non-owner's self-elevation UPDATE returned `UPDATE 0` instead of
  `42501` — RLS silently filtered the row before the self-elevation trigger could fire. Both fixed
  (`0020`, `0021`). **No live Supabase project exists yet** — this verification used a local
  PostgreSQL 16.4 with hand-matched grants, not the real thing; treat DB-layer claims here as
  "verified against a faithful local approximation," not "verified against Supabase."
- **`/restaurant` uses a light/blue storefront design, not the cinematic dark/gold system**
  (explicit direction, 2026-08-21, supplied as a reference mockup). This supersedes the Phase 1.5
  "cinematic direction" lock **for that route only** — `/banquet`, `/catering`, and `/home` are
  untouched. Note the token set in `globals.css` had already migrated to the light palette
  (`--color-primary: #2563EB`, `--color-bg: #F9FAFB`) before this change, so the cinematic
  description in older entries was already stale
- The shared `Navbar` renders `null` on `/restaurant` because that route ships its own header
  (`components/restaurant/RestaurantHeader`) with section anchors and an inline cart. Hooks still run
  unconditionally; the bail-out is at render time only. Don't "fix" this by deleting the guard —
  you'll get two stacked headers

- Razorpay chosen over PhonePe
- Platform extends the existing `akshaya-restaurant/` repo — not a separate project
- Hero's single CTA becomes a 3-tile service picker (Order / Book / Enquire) once ordering ships; cinematic story stays below the fold
- Order/enquiry pricing and writes always go through `security definer` RPCs, never raw client inserts
- shadcn/ui added on top of existing Tailwind v4 tokens, not a separate design system
- Sensitive-table RLS reads (`payments`, `leads`) and menu writes use `is_admin_or_owner()`, not
  `is_staff()` — staff gets none of those per the RBAC table, corrected 2026-08-20 after the plan's
  own verification matrix caught the mismatch
- Webhook handler must reject a forged/mismatched Razorpay signature with 400, verified explicitly
  in Phase 4 (not just idempotency of valid duplicates)
- Preview deployments carry Razorpay **test** keys only; production carries **live** keys — verified
  by key prefix (`rzp_test_` / `rzp_live_`), not an HTTP-level check
- Design System Lock (Phase 1.5) resolved: cinematic direction, existing tokens reused — no new
  palette introduced by `/order`, `/banquet`, `/catering`
- **Superseded 2026-08-24**: `/order` checkout now calls `create_order` against the live Supabase
  project (see Phase 3 in Overview and Key Decisions) rather than handing off to WhatsApp — that
  interim ended once Phase 0 unblocked. The banquet/catering enquiry forms are unchanged and still
  hand off to WhatsApp (Phase 5, partial)
- **Superseded 2026-08-24**: a live Supabase project now exists — see Key Decisions. This entry is
  kept for history only
- `/admin`'s role gate (`lib/admin-store.ts`'s `currentRole`) is a client-side simulator for building
  the console UI, **not access control**. Default is logged-out; the role-switcher only renders when
  `process.env.NODE_ENV !== "production"`; the RBAC-denial screen has no self-promote shortcut
  (removed 2026-08-20 — it originally did). This must be **replaced**, not extended, by real
  Supabase Auth + the `is_staff()`/`is_admin_or_owner()` RLS policies once Phase 0/1 are live. Don't
  deploy `/admin` to a public URL before that swap without additional protection (e.g. Vercel
  Deployment Protection)
- Hero background is React Bits' `Beams` component (adapted to TypeScript in `components/hero/Beams.tsx`),
  replacing the earlier Three.js camera-dolly scene entirely — explicit direction, supersedes Phase
  1.5's original "cinematic 3D narrative" framing. The dark/gold/glass token system and `HeroOverlay`'s
  actual content (headline, tagline, `ServicePickerTiles`, scroll cue) are unchanged; only the
  animated background layer and its underlying tech changed. `lightColor="#e8c37e"` and the canvas
  background (`#0b0f14`) were tuned to the existing gold/void tokens rather than left at the
  component's stock white-on-black defaults
- "/" is a decision gate, not the homepage — explicit direction, a real breaking change to the URL
  structure (see Overview). `middleware.ts` matcher is scoped to exactly `/`; never widen it without
  re-checking that deep links (search results, WhatsApp shares, bookmarks to `/order` etc.) still
  bypass the gate — that was an explicit requirement, not incidental
- Admin's "back to public site" links point to `/home`, not `/` — going back to the entry gate from
  inside the app would be a confusing loop, not a real navigation option
- Analytics stays provider-agnostic (`window.dataLayer` push) until a real provider (GA4/PostHog/
  Segment) is chosen — don't hardcode a specific SDK without that decision being made explicitly
- No-cash/COD enforcement is structural, not a runtime check: no cash payment method exists in the
  schema, `orders.status` can only reach `confirmed` via the webhook writing `payments.status =
  'success'`, and `CheckoutForm` has no "pay at counter" option
- Payment **receipt** and PI/TI **invoice** are two separate artifacts, not one — receipt confirms
  payment captured (auto-generated by the webhook, no GST, lives on `payments.receipt_number`/
  `receipt_url`); invoice is a billing document (staff-generated, carries GST, unchanged from the
  original spec). Don't collapse them into a single generated document
- Google Sheets export is additive to xlsx, not a replacement — xlsx needs no setup and must keep
  working even if the owner never configures a Google service account
- Admin notifications (new, optional per brief): WhatsApp Business Cloud API primary, Twilio SMS
  fallback, triggered off the existing `activity_logs` insert (no new write path) and always
  fire-and-forget — a down notification provider must never block order/enquiry creation
- GST is a **platform-wide singleton** (`settings`, one row enforced by a boolean PK + check
  constraint), not a per-order flag — a per-order flag would let two invoices from the same day
  disagree. Invoices read the GST setting at *generation* time and are immutable afterward; a
  correction is a new invoice, never an edit
- Guest-side product analytics (`trackEvent()` → `window.dataLayer`) is deliberately **separate** from
  `activity_logs` — different retention, privacy, and trust properties. Don't merge them: it would put
  untrusted client-reported events into the audit trail
- Modular monolith over microservices, explicitly: order→payment→confirmation is one DB transaction
  here, but would become a saga with compensating actions if split. Revisit only on multi-branch
  rollout or a notification/reporting workload heavy enough to affect checkout latency

## Open Items

### Fixed and DB-verified — 2026-08-24 Antigravity round follow-up

- **All 10 non-`invoices`/`activity`/`webhooks` `/admin/*` pages had lost their server-side role
  gate**, relying only on `middleware.ts`'s authenticated+active check (no role check). Fixed: each
  now calls `requireAdminSession(<role set>)` + `<AccessDenied>`/`<RoleGate>`, matching
  `app/admin/invoices/page.tsx`'s established pattern. `npm run typecheck` clean after the change.
- **Migration `0023` had three defects that would have failed it on apply, not one**: indexed
  `orders.tenant_id` (column never created anywhere — schema is single-tenant, `lib/tenant.ts` is
  unused scaffolding), `webhook_events.state` (real column is `status`), and
  `activity_logs.timestamp` (real column is `created_at`, and the corrected index already exists
  verbatim as `idx_activity_logs_severity_created` from `0010` — dropped as a pure duplicate rather
  than recreated under a new name).
- **Migration `0022` referenced a function, `replay_dead_letter_webhook`, that doesn't exist anywhere
  in the schema** — the real one (from `0011`) is `replay_webhook_event`. This failed the whole
  migration outright, meaning the migration's actual security fix (the `super_admin`-assigns-
  `super_admin` trust boundary) had never successfully applied anywhere. Fixed the name; also
  corrected the same wrong name in `RUNBOOK.md`'s webhook-replay runbook step, which would have sent
  an on-call operator to a nonexistent RPC during a real incident.
- **Verification**: rebuilt a throwaway local PostgreSQL 16.4 from scratch (drop/recreate database,
  reapply the Supabase auth shim, then all 23 migration files via `psql -v ON_ERROR_STOP=1` in order,
  output captured to a real file per the `/dev/null` gotcha below) — **all 23 apply cleanly**. Then
  exercised `set_user_role()`'s new trust boundary directly with seeded profiles: owner→super_admin
  blocked (`42501`, "Only a super_admin can assign..."), owner→admin succeeds, non-owner blocked
  entirely, super_admin→super_admin succeeds; confirmed `EXECUTE` on `replay_webhook_event` is
  `true` for `authenticated` and on `record_payment_success` is `true` for `service_role` / `false`
  for `anon`. Database dropped and server stopped after verification, as before.
- `docs/phase1_proofs.md`, `docs/rbac_audit_report.md`, `docs/system_validation_report.md` remain in
  the repo, fabricated (see Key Decisions) — left in place rather than deleted without being asked.
  None of the fixes above relied on anything those docs claimed; every result was independently
  re-derived from the migration files and a real database.

### Defects D1–D7 (2026-08-21) — **FIXED AND VERIFIED against a real PostgreSQL 16.4**

All seven remediated in `0012_defect_remediation.sql` (D1–D5, D7) and both payment route handlers
(D6). **Verified by execution**: all 12 migrations apply cleanly and the full suite passes
**69/69, 0 failures** (`supabase/tests/run_all.sql` with `-v RUN_DEFECT_TESTS=1`), including the
assertion that `anon` no longer holds EXECUTE on `record_payment_success` and that the rate limiter
now actually rejects the 6th enquiry.

**How to re-run** (no Docker/WSL needed — this machine has neither):
portable PostgreSQL lives at `E:\pgtest\pgsql`, data dir `E:\pgtest\data`, and
`E:\pgtest\shim.sql` provides the Supabase compatibility layer (`auth.uid()`, `auth.users`,
`anon`/`authenticated`/`service_role` roles).
```
E:\pgtest\pgsql\bin\pg_ctl.exe -D E:\pgtest\data -o "-p 55432" -l E:\pgtest\server.log start
psql -h 127.0.0.1 -p 55432 -U postgres -d akshaya -v RUN_DEFECT_TESTS=1 -f supabase/tests/run_all.sql
```
Caveat: the shim is not Supabase. It does not reproduce PostgREST exposure, real JWT claims, or
Supabase's role grants, so **RLS behaviour under a genuine anon/authenticated session is still
unverified** — D1's fix is confirmed at the `has_function_privilege` level, not by an actual
unauthenticated HTTP call.

- **D1 🔴 was CRITICAL — free orders.** `record_payment_success` was `GRANT`ed to `anon` and does no
  signature check of its own, so an anonymous caller could confirm an unpaid order straight through
  PostgREST, bypassing the route handler's HMAC entirely. **Fixed:** revoked from
  `anon`/`authenticated`/`PUBLIC`, granted to `service_role` only (same for `record_webhook_event`
  and `update_webhook_outcome`). Both real callers already use the service-role client, so nothing
  legitimate broke. `create_order` and the enquiry RPCs deliberately **keep** `anon` — guest checkout
  and public enquiry are the product.
- **D2 🟠 Rate limiting was a no-op.** Counted an `activity_logs` shape nothing writes, and was never
  called. **Fixed:** now counts `leads` by phone within the window, and is invoked from both enquiry
  RPCs. `restaurant_order` is excluded on purpose — those are payment-gated, and a repeat customer is
  not abuse. Added `idx_leads_phone_created`.
- **D3 🟠 Receipt-number collisions.** **Fixed:** bounded retry loop (10 attempts), matching the
  `order_number` pattern in `0004`.
- **D4 🟠 Notification/Sheets settings were unwritable.** **Fixed:** JSONB patch `update_settings`
  restored as canonical; the 5-arg form kept as a delegating wrapper so existing callers still work.
  ⚠️ Behaviour change: the wrapper can no longer *clear* `gst_number` by passing NULL (COALESCE keeps
  the existing value) — pass the JSONB form to blank a field.
- **D5 🟡 `record_webhook_event` TOCTOU.** **Fixed:** `INSERT … ON CONFLICT DO NOTHING RETURNING`,
  falling back to a SELECT on miss. The `ON CONFLICT` clause **must** restate
  `WHERE external_event_id IS NOT NULL` — the unique index is partial, and inference fails without it.
- **D6 🟡 500 instead of 400 on a malformed signature.** **Fixed** in both
  `app/api/webhooks/razorpay/route.ts` and `app/api/payments/verify/route.ts` (the verify route had
  the same bug): compare buffer lengths before `crypto.timingSafeEqual`, which throws on a mismatch.
- **D7 🟡 Invoice numbering not per-FY, not gapless.** **Fixed:** `invoice_counters` table with a
  per-FY row; `UPDATE … RETURNING` takes a row lock so numbers serialize and a rollback returns the
  number to the pool. `invoice_number_seq` dropped. Trade-off accepted: invoice generation serializes
  on one row, which is correct for a legal numbering series and irrelevant at this volume.
  **Still open for the owner:** confirm the per-FY restart and gap policy with their CA.

### Defects D8–D11 — found by actually EXECUTING the migrations (2026-08-21). All fixed + verified.

These were invisible to code review and to `tsc`; only running the SQL surfaced them. Notably,
**plpgsql function bodies are not name-checked at `CREATE` time**, so a migration can apply with a
clean exit and still be entirely broken at call time.

- **D8 🔴 `create_order` was broken in three independent ways — ordering could not work at all.**
  (a) `WHERE order_id = v_order_id` was unqualified; `order_id` matches both `order_items.order_id`
  and the function's `RETURNS TABLE` OUT variable, so **every call** raised
  `column reference "order_id" is ambiguous`. (b) The lead write used
  `ON CONFLICT (phone) DO UPDATE`, but **there is no unique index on `leads.phone`**. (c) That same
  upsert set `last_active_at` and `interaction_count`, **neither of which exists** on `leads`.
  **Fixed** in `0008`: alias-qualified the aggregate, and made the lead write append-only — which
  also restores consistency with the enquiry RPCs, `check_lead_rate_limit` (a per-phone upsert would
  cap the count at 1 and the limiter could never fire), and the PRD's "capture every intent" goal.
  If per-customer aggregation is wanted, it belongs in a `customers` table or a dashboard view, not
  by collapsing the intent ledger.
- **D9 🟠 Migration `0010` never applied.** The `pg_cron` block nested `$$` inside `DO $$ … $$`, so
  the inner quote terminated the outer block: `syntax error at or near "SELECT"`. `0011` and `0012`
  then cascade-failed on the missing `webhook_direction`/`webhook_status` types. **Fixed** with
  distinct dollar-quote tags (`$do$` / `$cron$`). This would have failed identically on Supabase.
- **D10 🟠 The "critical" payment audit logs never existed.** `verify_payment_drift_guard` did
  `INSERT INTO activity_logs … ; RAISE EXCEPTION …` — the exception rolls back its own INSERT, so not
  one `payment.amount_mismatch` or `payment.currency_mismatch` row was ever persisted. It read like a
  working audit trail while recording nothing, which is worse than no logging because the alerting
  design assumed it. Postgres has no autonomous transactions, so a **rejecting trigger cannot durably
  log its own rejection**. **Fixed**: removed the dead INSERTs; the exception messages carry both
  amounts and the payment routes log via `lib/observability.ts`. Tests now assert the *absence* of
  those rows so nobody re-adds them.
- **D11 🟡 Supabase shim ordering.** Roles are cluster-wide while schemas are per-database, so a
  non-idempotent `CREATE ROLE` aborted the shim before `auth` was created on a rebuild. Fixed in
  `E:\pgtest\shim.sql` (test tooling only, not product code).

**The `0011` "flake" — root-caused, and it is a TEST-HARNESS bug, not a migration bug.**
`0011_enterprise_hardening.sql` intermittently reported a non-zero exit during rebuilds. It was
initially (wrongly) blamed on server warmup. A controlled A/B on identical database state showed the
exit code depends purely on where psql's output goes:

| redirect | psql exit |
|---|---|
| `>/dev/null 2>&1` | **3** |
| `>somefile 2>&1`  | **0** |
| `$(command substitution)` | **0** |

`psql.exe` is a native Windows binary and Git Bash's `/dev/null` shim makes it report a write failure
(exit 3 = "script error under ON_ERROR_STOP"), even though every statement succeeded and the only
output is one harmless `DROP TRIGGER IF EXISTS ... skipping` NOTICE. **The SQL in `0011` is fine.**
When scripting these migrations from Git Bash, redirect to a real file or capture the output —
never to `/dev/null` — or you will chase a phantom failure.

### `/restaurant` storefront redesign (2026-08-21)

- **🔴 CHECKOUT-BLOCKING: the cart's fees are display-only.** The design charges
  Subtotal + ₹30 delivery + ₹20 packaging, but `create_order()` sets
  `orders.total = subtotal` and `verify_payment_drift_guard` rejects any payment whose amount
  differs from `orders.total` by a paisa. A real payment for the displayed total will fail with
  `AMOUNT_MISMATCH` (22000). **The RPC must add the same fees server-side before payments go live** —
  the client constants in `lib/restaurant-data.ts` (`DELIVERY_FEE`, `PACKAGING_FEE`,
  `calculateFees`) must never be the source of the charged amount.
- **The offers strip contradicts the cart.** It advertises "Free Delivery on orders above ₹299"
  while the reference design charges ₹30 on a ₹547 subtotal. Implemented as drawn; set
  `FREE_DELIVERY_ABOVE` (currently `null`) to a number to switch on the threshold instead.
  Confirm the real policy with the owner.
- **🔴 ATTRIBUTION IS A LEGAL OBLIGATION, and it is not yet met.** `public/Images/` now holds **23
  real photographs from Wikimedia Commons** (fetched by `scripts/fetch-photos.mjs`), most under
  **CC BY / CC BY-SA, which legally require crediting the photographer**. Credits are recorded in
  `public/Images/CREDITS.md`, but **that file is not surfaced anywhere on the site** — link it from
  the footer or add a `/credits` page before launch, or the licences are being breached.
- **The photos are stock, not Akshaya's food or premises.** Customers order from these images.
  Replace with real photography of the actual dishes; keep filenames and no code changes are needed.
  Gallery alt text is deliberately generic ("Restaurant dining room", not "our dining hall") because
  claiming a stock Musée d'Orsay interior as Akshaya's premises would be a factual misstatement —
  tighten that copy when real photos land.
- Two offer tiles (`offer-free-delivery`, `offer-first-order`) deliberately stay **SVG** from
  `scripts/generate-images.mjs`: every usable Commons match carried third-party branding (a
  Domino's-liveried scooter, a Chanel gift box). The fetch script has a `GLOBAL_BLOCK` regex that
  rejects brand and artwork titles — **don't remove it**, it also caught a Van Gogh painting being
  served as a restaurant interior photo.
- `scripts/fetch-photos.mjs` rejects any image whose licence can't be positively identified as
  commercially reusable, dedupes by Commons title (two naan searches returned the same file), and
  carries per-dish `avoid` patterns (a first pass gave "Shrimp Biriyani" for mutton and a Korean
  cider for lime soda). Re-running it re-fetches everything and rewrites `CREDITS.md`.
- `DishImage` uses a plain `<img>`, not `next/image`, on purpose: routing SVG through the Next image
  optimizer requires `dangerouslyAllowSVG`, which we don't want enabled globally, and vector art
  gains nothing from raster optimization. If the SVGs are swapped for JPG/PNG photos, switching to
  `next/image` becomes worthwhile — that's the moment to revisit it.
- **Opening hours are still a placeholder** (`Mon–Sun 11:00–23:00`) in `contactInfo`, matching the
  same unconfirmed value in the landing page's JSON-LD. Confirm before launch.
- The contact map is a static styled link to Google Maps, not an embed — an iframe embed needs an
  API key that isn't configured and would fail silently.
- `components/order/CartDrawer.tsx` (old dark/gold) is now **unused by `/restaurant`** but still
  referenced by `/order`. The two will drift; consolidate when `/order` is revisited.

### Dev-server gotcha: `__webpack_modules__[moduleId] is not a function`

Symptom: routes 500 with `TypeError: __webpack_modules__[moduleId] is not a function`, pointing at an
`import` line in an otherwise-fine component (seen at `components/ui/Navbar.tsx` → `@/store/cart` and
`components/restaurant/OffersSection.tsx` → `@/lib/restaurant-data`). **It is not a code bug** — `tsc
--noEmit` passes clean throughout. It means the `.next` chunk tree is corrupt.

Cause found 2026-08-21: **two `next dev` servers were running against the same `.next` directory**,
each overwriting the other's webpack chunks. Six node processes across two full stacks, plus a
third orphan holding port 3000.

Fixing it has a strict order — getting it wrong silently reproduces the fault:
1. Stop every `next dev` process **first** (`Get-CimInstance Win32_Process -Filter "Name='node.exe'"`,
   filter on the project path, `Stop-Process -Force`). Confirm zero listeners on port 3000.
2. **Only then** `rm -rf .next`. Deleting the cache while a server is alive is useless — the running
   server immediately rebuilds a partial tree, which is exactly how this was accidentally
   re-triggered once during diagnosis.
3. Confirm `.next` stays gone, then start exactly **one** server.

Never call `preview_start` again while a preview server is already running for this project.

### Other

- **Superseded 2026-08-24**: Supabase project is now live and Razorpay keys are configured (real UPI
  payments have been attempted against it — see Key Decisions); Phase 0 in `IMPLEMENTATION_PLAN.md`
  should be updated from "partial" accordingly next time that file is touched
- `docs/` folder was removed; architecture spec lives at repo root as `akshaya-platform-architecture.md`
- `/order`, `/banquet`, `/catering` are UI-complete but backend-less — swap static data for live
  Supabase reads and WhatsApp handoff for real RPC writes once Phase 0/1 land
- `WALKTHROUGH.md`'s phase headers were previously numbered independently of this file and
  `IMPLEMENTATION_PLAN.md`; relabeled 2026-08-20 to reference the same canonical Phase 0–9 —
  don't reintroduce a second numbering scheme there
- No responsive/mobile-viewport check has been done on anything built after the initial hero/sections
  pass — `/`, `/order`, `/banquet`, `/catering`, and all 8 `/admin/*` pages have only been verified at
  desktop width, despite "mobile-first, thumb-friendly, large touch targets" being an explicit
  requirement in the original UI/UX brief. `/` now needs re-checking post-Beams too, not just the
  pages added after the original hero pass
- `Beams.tsx`'s canvas sizing could not be visually confirmed in this session — the automation
  browser tab wasn't composited/displayed (`window.innerWidth`/`innerHeight` read 0 all session,
  every screenshot attempt failed with "Browser pane is not displayed"), so the WebGL canvas stayed
  stuck at its 300×150 default in that tab specifically. DOM structure, WebGL context creation, and
  console were all clean — this looks like a display-state artifact, not a code bug, but hasn't been
  confirmed with a real screenshot or live check yet
- The gate's JSON-LD `openingHoursSpecification` (`app/(landing)/page.tsx`) is a **placeholder**
  (11:00–23:00 daily, marked with a `// TODO` comment) — confirm real hours with the owner before
  launch. Publishing wrong hours in structured data actively misleads customers, worse than omitting it
- Navbar/mobile-menu entrance and exit **animations** couldn't be visually confirmed this round either
  — same root cause class as the Beams item, but manifesting differently: `document.visibilityState`
  read `"hidden"` for the whole tab, which is standard browser behavior for pausing
  `requestAnimationFrame` on backgrounded tabs (confirmed via direct check, and fronting the tab via
  the tool didn't change it — a host-app-level state, not something fixable from code). The
  *functional* behavior (state changes, aria attributes, routing) was verified correctly by checking
  `aria-expanded`/`aria-current` directly rather than relying on the CSS animation completing
- No live analytics provider chosen — `trackEvent()` in `lib/analytics.ts` pushes to
  `window.dataLayer` (GA4/GTM-compatible) and logs to console in dev, but nothing consumes those
  events yet. Wire a real GA4/PostHog/Segment snippet when one is chosen
- Task 10 from the "10/10 production-grade" brief (multi-branch restaurants, CRM integration, admin
  analytics dashboard) was **not implemented** — no concrete requirements exist for any of it yet.
  Treat as guidance for future architecture decisions, not a backlog item
- 2026-08-21 gap-closing pass (receipt, Google Sheets export, admin notifications, explicit no-cash
  rule) is **spec-only** — `akshaya-platform-architecture.md` § Deliverable 10 and the schema/API
  additions are written, but no code exists yet. Build them mock-first inside Phase 4/8 like
  everything else, per `IMPLEMENTATION_PLAN.md`'s updated Phase 4/8 sections
- ~~The `settings` table + `is_owner()` helper are written into the spec but not into
  `supabase/migrations/`~~ — **resolved 2026-08-21**, now in `0006_settings_system.sql`
- **GST rate is a single platform-wide value.** Indian GST commonly differs by service line
  (restaurant supply vs. banquet hall rental vs. outdoor catering can attract different rates and
  ITC treatment). One rate is what the brief specified and what's built — but confirm with the
  owner's CA before go-live. If per-service rates are needed, add typed columns
  (`gst_rate_restaurant`/`_banquet`/`_catering`), **not** entries in `extras` — money fields must
  keep their CHECK constraints. `invoices.gst_rate` already snapshots per-invoice, so historical
  documents survive the change
- **Migrations `0002`/`0004`/`0005` were edited in place** during the 2026-08-21 audit rather than
  patched forward, because no live database exists yet. If a database has already been provisioned
  from the old files, those edits will NOT apply — diff them before `supabase db push`
- `/order`'s `CheckoutForm` and `/banquet`//`catering`'s `EnquiryForm` still use the WhatsApp handoff;
  they must now call `create_order` / `create_banquet_enquiry` / `create_catering_enquiry`, since the
  direct-insert RLS policies the forms would otherwise have relied on were **removed** in `0006`
- No CI pipeline exists (`.github/workflows/` is absent). `TRD.md` § 10 describes the target pipeline
  — typecheck/lint/build on PR plus unit tests for webhook signature verification and price-tampering
  — as a plan, not as something currently running
- `PRD.md`'s success metrics are **not instrumented** — no analytics provider is wired, and there's no
  live order/payment volume to measure. The metrics section documents where each number will come from
  once live, not numbers anyone can read today
