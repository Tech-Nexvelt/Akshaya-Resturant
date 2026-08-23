# Akshaya Restaurant Platform Implementation Plan

## Goal Description
Implement the full ordering, booking, and admin platform as described in [`akshaya-platform-architecture.md`](./akshaya-platform-architecture.md), delivering a production-ready system in incremental, shippable phases.

## Status
Plan finalized after three review rounds. RLS policy bug found during review (staff had implicit read access to `payments`, `leads`, and full write access to `menu_categories`/`menu_items` via `is_staff()`, contradicting the RBAC route table) — **fixed in the architecture doc**; policies now use `is_admin_or_owner()` on those four tables.

**Current progress (2026-08-20):**
- Phase 0 — partial. Client architecture (`lib/supabase/client.ts`/`server.ts`/`admin.ts`), domain types, `.env.example`, and dependencies are scaffolded. **Live Supabase project creation is deferred by owner decision** — no project exists yet, no real credentials anywhere in the repo.
- Phase 1 — drafted, not verified. Migrations `0001`–`0005` (enums, core tables, enquiries/ops, `create_order` RPC, RLS) are written and the RLS bug above is fixed in them. The verification matrix below has not been run — it requires the live project from Phase 0.
- Phase 1.5 — **resolved**. The cinematic direction won: `ServicePickerTiles`, `CartDrawer`, and the enquiry forms all reuse the existing gold/void/glass tokens from `globals.css`. No separate Figma process was used — the token set was already committed from the marketing-site build, which is what the sign-off criterion below actually checks for.
- Phase 2 — partial. Hero CTA replaced with the 3-tile service picker; `/order` renders a full menu browser. Both currently read from static `lib/data.ts`, not a live Supabase query (there's no live project to query yet).
- Phase 3 — partial. Cart store (Zustand + localStorage), `CartDrawer`, and `CheckoutForm` are built and working. `create_order()` is not called — there's no RPC to call yet. Interim behavior: checkout hands the order to WhatsApp with a clear in-UI note that online payment is launching soon.
- Phase 5 — partial. `/banquet` and `/catering` forms are built and submit via WhatsApp handoff. The DB write (enquiry table + `leads`, in one transaction) is not implemented — pending the live project.
- Phase 6 — done on mock data, security-fixed (mock role store secured, RBAC gates active).
- Phase 7 — **done on mock data**. Invoice generation system with sequential FY-prefixed invoice numbers (`AK-INV-FY2026-####`), GST tax configuration, and `InvoiceModal` printable/downloadable PDF viewer built.
- Phase 8 — **done on mock data**. Audit logging active on all store mutations (`updateOrderStatus`, `toggleMenuItemAvailability`, `updateMenuItemPrice`, `addMenuItem`, `toggleGst`, `updateUserRole`, `updateEnquiryStatus`). Lead data export built.
- Phase 9 — **client hardening complete**. Double-submission prevention cooldown added to `CheckoutForm` and `EnquiryForm`. Static legal pages (`/privacy`, `/terms`) created. Server-side rate limiting and live Sentry pending live backend deployment pass.

## Proposed Changes

---
### Phase 0 – Supabase project & auth foundation (hard prerequisite)

> **Execution started**: Proceeding with Phase 0 as per user request.
* Create Supabase project, enable email/password auth for staff.
* Add `profiles` trigger that auto-creates a profile row on `auth.users` insert.
* Wire environment variables into Vercel (`SUPABASE_SERVICE_ROLE_KEY`, Razorpay secrets) — see **Env-var isolation** below.
* **Rollback note:** Supabase's CLI does not auto-generate down-migrations. A bad migration in production is reverted either by hand-writing a reverse SQL script for that migration, or by restoring from a point-in-time-recovery (PITR) snapshot. Documented in `supabase/rollback.md`.
* **Verification:** Supabase project reachable, env vars set, trigger created and fires on a test signup.

---
### Phase 1 – Schema, indexes, RLS

> **Execution started**: Proceeding with Phase 1 as per user request.
* Apply migrations `0001`–`0007`. **`0006_settings_system.sql`** (typed settings singleton, `is_owner()`, `get_gst_config()`, `update_settings()`, audit + delete-block triggers) and **`0007_enquiry_rpc_and_guards.sql`** (`invoices.gst_rate`, enquiry+lead RPCs, paid-before-confirmed trigger) are both from the 2026-08-21 audit. Down-migration for 0006 at `supabase/migrations/down/`.
* Add RLS policies (`0005`) — **as corrected twice**: (a) `payments`, `leads`, `menu_categories`, `menu_items` writes/sensitive-reads use `is_admin_or_owner()`, not `is_staff()`; (b) **`profiles` writes and `settings` use `is_owner()`** — the previous `admin manage profiles` policy was a privilege escalation (admin could self-promote to owner).
* Seed initial menu categories & items; the `settings` row is inserted by `0006`.
* **Verify the staff column grants applied** — `revoke update on orders from authenticated` + `grant update (status, notes, updated_at)`. RLS alone does not scope columns.
* **Verification Matrix:**
  * `anon` **cannot** read: `orders`, `order_items`, `leads`, `payments`, `activity_logs`, `banquet_enquiries`, `catering_enquiries`.
  * `staff` **cannot** read: `leads`, `payments`, `activity_logs`. `staff` **cannot** write: `menu_categories`, `menu_items` (matches `/admin/menu` = staff: none in the RBAC table).
  * `staff` **can** read/update `orders` (view + status, per RBAC table) and read `invoices`.
  * `admin`/`owner` **can** read/write all of the above.
  * `admin` **cannot** read or write `settings` — only `owner` can (matches `/admin/settings` = admin: none).
  * A second `settings` row cannot be inserted (singleton check constraint rejects it).
  * **Wrong-tax regression test:** as `staff`, `select * from settings` returns **0 rows**, while `select * from get_gst_config()` returns the real GST configuration. Any invoice-generation code path that reads `settings` directly is a bug — grep for it.
  * **GST safety test:** `update_settings(v, '{"gst_enabled":true}')` with no `gst_number` set is **rejected** (`23514`, `gst_requires_number`). Enabling GST requires a GSTIN and legal business name in the same patch.
  * **Concurrency test:** two `update_settings()` calls with the same `expected_version` — the first succeeds, the second raises `40001` (→ HTTP 409). Neither silently overwrites the other.
  * **Singleton durability test:** `delete from settings` raises, **even as `service_role`** (trigger, not policy).
  * **Audit test:** changing the GST rate writes a `settings.gst_changed` row to `activity_logs` with `actor_id`, old value, and new value.
  * **Privilege-escalation test:** an `admin` account executing `update profiles set role='owner' where id = auth.uid()` is **rejected**. Same for `staff`. Only `owner` can change any role.
  * **Column-scope test:** a `staff` account executing `update orders set total = 0` is **rejected**, while `update orders set status='preparing'` succeeds.
  * **Confirm-guard test:** `update orders set status='confirmed'` on an order with no successful payment raises, even as service role.
  * **Enquiry path test:** `anon` executing a direct `insert into banquet_enquiries` is **rejected**; `create_banquet_enquiry(...)` succeeds and produces exactly one enquiry row **and** one lead row.
  * Functions `is_staff()`, `is_admin_or_owner()`, and `is_owner()` return `false` when `auth.uid()` is `NULL` (no error thrown).
  * Example query: `SELECT * FROM payments;` as `anon` returns **0 rows**; as `staff` returns **0 rows**; as `admin` returns all rows.
* **Pass/Fail:** Pass if every row in the matrix enforces the described deny/allow behavior. Fail if any unauthorized read/write succeeds.

---
### Phase 1.5 – Design System Lock (cinematic vs. minimal UI) — ✅ RESOLVED
* Resolved in favor of the cinematic direction — the gold/void/glass token system already committed in `globals.css` and `tailwind.config.js` from the marketing-site build, reused as-is across `ServicePickerTiles`, `CartDrawer`, `CheckoutForm`, and `EnquiryForm`.
* No separate Figma sign-off process exists for this project; the token set being already committed and consistently reused across every new component *is* the sign-off.
* **Verification:** Passed by inspection — new components (`components/order/*`, `components/enquiry/*`) use only existing tokens (`gold`, `gold-bright`, `void`, `void-soft`, `ivory`, `smoke`, `glass-panel`), no new palette introduced.
* **Update 2026-08-20:** the *specific 3D scene* originally built for this lock (camera-dolly hero, floating gold shapes, Bloom) was replaced entirely by the React Bits `Beams` component per explicit direction — see `components/hero/Beams.tsx`. The token lock itself still holds (`Beams` is tuned to the same gold/void palette, `HeroOverlay`'s content is unchanged); only the animated-background implementation changed.

---
### Phase 2 – Service picker & menu browsing
* ✅ Replace hero CTA with three service tiles (Restaurant, Banquet, Catering) — `components/hero/ServicePickerTiles.tsx`.
* ✅ Implement `/order` page that reads categories/items — `components/order/MenuBrowser.tsx`, currently reading static `lib/data.ts`, not a live Supabase query.
* **Remaining:** swap `MenuBrowser` from static data to a live `menu_items`/`menu_categories` read once Phase 0/1 have a real project.
* **Verification:** `GET /order` returns menu JSON within 200 ms; no client-side errors. *(Passes today against static data; re-verify against live Supabase once wired.)*

---
### Phase 3 – Cart & guest checkout
* ✅ Zustand cart store (`store/cart.ts`), persisted to localStorage.
* ✅ UI components: `MenuBrowser`, `CartDrawer`, `CheckoutForm`.
* ⏳ Checkout does **not** call `create_order()` yet — there's no RPC to call without a live project. Interim: `CheckoutForm` collects name + phone, opens a pre-filled WhatsApp message with the order and clearly states online payment is launching soon.
* **Remaining:** once Phase 0/1 are live, swap the WhatsApp handoff for the real `create_order` RPC call + Razorpay flow (Phase 4).
* **Verification (for the interim state):** cart total shown in `CartDrawer`/`CheckoutForm` matches the client-computed subtotal from `lib/data.ts` prices; WhatsApp message contains the correct item list, quantities, and total.
* **Verification (once RPC is wired — not yet applicable):**
  * Cart total displayed matches server-computed subtotal from RPC.
  * **Price-tampering test:** submit a deliberately altered payload to `create_order` (inflated price, mismatched quantity, or a `menu_item_id` marked `available = false`). The RPC must ignore any client-supplied price and return a total that does not equal the injected bad value — total is always server-derived from `menu_items`.

---
### Phase 4 – Razorpay integration & webhook — buildable now, mock-mode
* **Build now:** `/api/payments/create-order` accepting the cart payload `CheckoutForm` already
  collects (name, phone, cart lines from `store/cart.ts`) — mock the Razorpay order response (same
  shape the real API returns) since there's no live gateway or `orders` table yet. Wire
  `CheckoutForm`'s "Pay Now" to call it; keep the WhatsApp handoff as a visible fallback, not a
  silent replacement.
* **Build now:** `/api/webhooks/razorpay` — signature verification logic can be written and unit
  tested against a hand-crafted payload without a live gateway. The forged-signature test below is
  fully runnable today.
* **Build now:** on simulated payment success, generate `receipt_number`/mock `receipt_url` on the
  mock `payments` record (same webhook handler, same transaction) — this is the auto payment
  receipt, distinct from the PI/TI invoice built in Phase 7 (see architecture spec Deliverable 10).
* **Task:** Retry-on-conflict logic for `order_number` generation to avoid duplicate keys.
* **No cash/COD path:** confirm `CheckoutForm` has no "pay at counter" option — "Pay Now" is the
  only CTA once the cart is non-empty. Structural, not a runtime check (architecture spec Deliverable 10).
* **If test keys are obtained (free, no KYC, unlike live keys):** swap the mocked order-creation for
  a real `razorpay.orders.create()` call — this alone makes checkout fully real in test mode without
  needing Phase 0/Supabase at all.
* **Verification (mock-mode, buildable now):**
  * **Forged-signature test:** a `POST /api/webhooks/razorpay` whose signature does not match
    `RAZORPAY_WEBHOOK_SECRET` is rejected with `400` and never touches mock `payments`/`orders` state.
  * `order_number` conflicts are resolved by retry, never surfaced as a user-facing error.
* **Verification (once live/test gateway is wired):**
  * Duplicate *valid* webhook delivery does not double-confirm the order (idempotent on `razorpay_payment_id`).
  * After a successful payment, `payments.status = 'success'` and `orders.status = 'confirmed'`.
  * `payments.receipt_number`/`receipt_url` are set exactly once per successful payment, never on a
    duplicate webhook delivery for the same `razorpay_payment_id`.

---
### Phase 5 – Banquet & catering enquiries
* ✅ Create `/banquet` and `/catering` forms — `app/banquet/page.tsx`, `app/catering/page.tsx`, sharing `components/enquiry/EnquiryForm.tsx`.
* ⏳ RPC write to the respective enquiry table + `leads` not implemented — no live project. Interim: form submission opens a pre-filled WhatsApp message with all field values.
* **Remaining:** once Phase 0/1 are live, add the transactional RPC write alongside (not instead of) the WhatsApp handoff.
* **Verification (interim):** WhatsApp message contains every field the guest filled in, correctly labeled.
* **Verification (once RPC is wired — not yet applicable):** Enquiry submission creates both the specific enquiry row and a lead row, or neither (transactional).

---
### Phase 6 – Admin console — ✅ built on mock data, ⚠️ not real access control
* Role-gated `/admin` layout (`admin/layout.tsx`), `RoleGate`, `AdminSidebar`/`AdminHeader`, and all 8
  dashboard pages built — matches the RBAC table's route-level allow-lists.
* Data layer is `lib/admin-store.ts` — a Zustand store seeded with realistic mock orders/leads/
  payments/invoices/activity, not a live Supabase query. `RealtimeOrderFeed` simulates new orders
  via a manual "trigger" button, not an actual Supabase Realtime subscription (that task is still
  open, see below).
* **Important:** the role itself (`currentRole` in `lib/admin-store.ts`) is set by `/admin/login`,
  which is a **role preview picker, not authentication** — there is no password check because there
  is no backend to check it against yet. This was caught and fixed 2026-08-20: the store originally
  defaulted `currentRole` to `"owner"` (anyone landing on `/admin/dashboard` cold got full access),
  and both `RoleGate`'s denial screen and `AdminSidebar`'s footer had a role-switcher visible to
  everyone, including on the *denied* screen itself. Now: default is logged-out, the switcher only
  renders when `process.env.NODE_ENV !== "production"`, and the denial screen has no escape hatch.
* **Do not deploy this to a public URL as-is.** Even with the fixes above, there is still no real
  auth — a technical visitor can trivially call `useAdminStore.getState().setRole('owner')` from the
  browser console. If a preview/production deployment is needed before Phase 0/Supabase Auth lands,
  put it behind Vercel Deployment Protection (or equivalent) in the meantime.
* **Remaining:** replace `RoleGate`'s `currentRole` check with real Supabase Auth + the `is_staff()`/
  `is_admin_or_owner()` policies once Phase 0/1 are live — this is a **replacement**, not an
  extension, of the current mock store's role field. Wire `RealtimeOrderFeed` to actual Supabase
  Realtime on `/admin/orders`.
* **Verification (mock-data state, done):** `staff` cannot open `/admin/leads`, `/admin/payments`,
  `/admin/menu`, `/admin/activity`, `/admin/settings` — confirmed by hand: cold visit to
  `/admin/dashboard` shows "Authentication Required" (not auto-owner); after picking Staff at
  `/admin/login`, visiting `/admin/leads` shows RBAC Access Denied with no way to self-promote from
  that screen.
* **Verification (once real Auth is wired — not yet applicable):** New order appears in the admin
  feed within 2 seconds of creation via Supabase Realtime; a `staff` account attempting to load
  `/admin/leads` or `/admin/payments` is blocked at the database (RLS), not just hidden in the UI.

---
### Phase 7 – Invoicing — buildable now, no Storage needed yet
* **Build now:** Client-side PDF generation (e.g. `@react-pdf/renderer` or `jspdf`) rendering a
  PI/TI from the mock order/enquiry data already in `lib/admin-store.ts`, using the FY-prefixed
  numbering scheme already present there (`AK-INV-FY2026-####`). Store the generated PDF as a blob
  URL for now — the mock `pdf_url` field already implies this shape.
* GST toggle already exists in Owner settings (`SettingsManager`, Phase 6) — wire the real PDF
  renderer to read `gstEnabled`/`gstRate` from the same store.
* **Later:** swap the blob URL for a real signed Supabase Storage URL once Phase 0 is live.
* **Verification (buildable now):** Generated invoice PDFs contain the correct FY-prefixed
  sequential number, GST flag (on/off matches the store's `gstEnabled`), and total amount.

---
### Phase 8 – Activity log, XLSX/Sheets export & admin notifications — mostly done, formalize it
* `activityLogs` and `exportLeadsToCsv` already exist in `lib/admin-store.ts` from Phase 6.
* **Task:** swap CSV for real `.xlsx` — the `xlsx` npm package works entirely client-side, no route
  handler needed yet.
* **Task:** audit every mutation in `lib/admin-store.ts` (menu edits, enquiry status changes, role
  changes) to confirm each one writes an `activityLogs` entry — `updateOrderStatus` and `toggleGst`
  already do; check the rest weren't missed.
* **New task:** add a "Export to Google Sheets" button next to the xlsx export on `/admin/leads`,
  disabled with a tooltip until a Google service account is configured in `/admin/settings`
  (architecture spec Deliverable 10) — mock the append call for now, same pattern as everything else
  waiting on live infra.
* **New task:** add a notification settings field to `/admin/settings` (WhatsApp/SMS recipient
  number) and, on the mock "trigger new order" simulator in `RealtimeOrderFeed`, log a mock
  notification dispatch to the console/Activity Log instead of only updating the store — proves the
  trigger wiring before a real WhatsApp Business/Twilio integration exists.
* **Later:** move the real writes to `activity_logs` inserts from the security-definer RPCs once
  Phase 0/1 are live, `/api/leads/export` and `/api/leads/export-sheets` become real routes streaming
  from the live table, and the mock notification dispatch is swapped for a real WhatsApp Business
  Cloud API / Twilio call.
* **Verification (buildable now):** exported `.xlsx` matches the mock store's row count and has the
  correct column headers; spot-check that a menu-price edit and an enquiry status change both appear
  in the Activity Log page; triggering a mock order produces a logged mock notification dispatch.

---
### Phase 9 – Hardening & launch — split: some buildable now, some needs real infra
* **Build now:** disable-and-cooldown UX on the checkout/enquiry submit buttons so double-submits
  can't happen even before a server enforces it; error boundaries around the cart/checkout/admin
  flows so a client crash doesn't blank the page; Privacy Policy + Refund Policy static pages
  (content, not infra — akshayarestaurant.in already links `PRIVACY`/`TERMS` in its footer).
* **Needs real infra (Supabase + Razorpay live, later):** server-side rate-limiting (Upstash + Edge
  Middleware) on `create_order`, enquiry forms, and `leads`; audit RLS policies against the Phase 1
  matrix; Sentry (or equivalent) on webhook/payment failures; the 200-concurrent load test; switching
  Razorpay to live keys.
* **Verification (buildable now):** submit button visibly disables on click and re-enables only
  after the (mock) request resolves; a thrown error inside `CheckoutForm` shows a fallback UI, not a
  blank page; policy pages are accessible and contain required legal text.
* **Verification (once real infra exists):** rate limit returns `429` after the configured
  threshold; load test completes successfully at 200 concurrent guest sessions with p95 latency
  ≤ 2 seconds; Sentry receives an event for a deliberately broken webhook signature.

---
### Go Live – consolidated swap to real backend (once Supabase project + Razorpay live keys exist)
One pass, not scattered across the phases above — do these in order:
1. Provision Supabase, run migrations `0001`–`0005`, run the Phase 1 RLS verification matrix for
   real (`anon`/`staff`/`admin` against `payments`, `leads`, etc. — not the by-hand cross-check
   Phase 1 shipped with).
2. Swap `/order`'s `MenuBrowser` from static `lib/data.ts` to live `menu_items`/`menu_categories` reads.
3. Swap `CheckoutForm`'s WhatsApp handoff for the real `create_order` RPC + real Razorpay order
   (or flip the mock Razorpay calls from Phase 4 to real ones if test keys were already added).
4. Swap `/banquet`/`/catering`'s WhatsApp-only submit for the transactional enquiry+`leads` RPC
   write, **alongside** WhatsApp, not instead of it.
5. Swap `lib/admin-store.ts`'s mock role/data for real Supabase Auth + live queries — **replace**,
   not extend, the current role simulator (see Phase 6's warnings). Wire `RealtimeOrderFeed` to
   actual Supabase Realtime.
6. Swap Phase 7's blob-URL PDFs for Supabase Storage; swap Phase 8's client-side `.xlsx` export for
   a real `/api/leads/export` route.
7. Flip Razorpay to live keys, turn on Phase 9's server-side rate limiting and Sentry.
* **Verification:** re-run every phase's "once live" verification criteria above — they were written
  for exactly this moment and none of them have been checked against a real backend yet.

---

## Verification Plan (per-phase)

This table is the **"once live" bar** — what each phase must pass against a real Supabase/Razorpay
backend. Mock-mode verification (what's actually checkable and checked today) is inline in each
phase section above; don't treat "not yet applicable" rows below as blocking work now.

| Phase | Pass Criteria | Fail Criteria |
|---|---|---|
| 0 | Supabase project reachable, env vars set, trigger created. | Project cannot be created or trigger missing. |
| 1 | Full RLS matrix enforced (anon/staff/admin, all sensitive tables). | Any unauthorized read/write succeeds. |
| 1.5 | Token set & component variants committed; PR passes CI. | Pending design decisions block further UI work. |
| 2 | `/order` loads menu JSON <200 ms; no console errors. | API errors or missing menu data. |
| 3 | Cart total matches RPC subtotal; tampered payload ignored. | UI/server total mismatch, or tampered payload affects total. |
| 4 | Duplicate webhook idempotent; forged signature rejected (400); order_number conflicts retried; receipt generated exactly once per successful payment. | Order status flips multiple times, forged webhook accepted, duplicate order numbers appear, or receipt generated 0 or >1 times. |
| 5 | Enquiry submission creates both enquiry + lead row, transactionally. | Only one of the two rows is created. |
| 6 | Realtime order feed updates within 2 s; staff blocked from leads/payments routes. | Feed lags >5 s, missing updates, or staff can view restricted routes. |
| 7 | Invoice PDF has FY-prefixed sequential number and correct GST flag. | Wrong numbering scheme or GST toggle not reflected. |
| 8 | Exported XLSX matches DB row count and column headers; Sheets export appends without duplicating prior rows; admin notification fires on order/enquiry creation without blocking it. | Row count mismatch, corrupted file, duplicated Sheets rows, or a failed notification blocks order/enquiry creation. |
| 9 | 429 after rate-limit threshold; load test meets 200 concurrent / p95 ≤ 2 s; Sentry captures forged-webhook event; policy pages served. | Any of the above missing. |

---

## Parallel-track content workstream
* During Phases 2–3, photograph menu items; upload to Supabase `menu-images` bucket, referenced from `menu_items.image_url`.
* The Gallery component already exists with placeholder gradients (`components/sections/Gallery.tsx`) — Phase 9 swaps in the real images. No additional build required.

## Env-var isolation
* Razorpay **test** keys (`rzp_test_...`) are set only on Vercel preview deployments; **live** keys (`rzp_live_...`) are injected exclusively into the production environment.
* **Verification:** `RAZORPAY_KEY_ID` resolved in a preview deployment always carries the `rzp_test_` prefix; production always carries `rzp_live_`. Checked in CI or via a startup assertion, not by expecting an HTTP-level access-denial — Vercel env var scoping has no such runtime check.
