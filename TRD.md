# Akshaya — Technical Requirements Document (TRD)

**Product:** Akshaya Hospitality Platform
**Doc version:** 1.0.0 · **Last updated:** 2026-08-21
**Companion docs:** [`PRD.md`](./PRD.md) (product spec), [`akshaya-platform-architecture.md`](./akshaya-platform-architecture.md) (**canonical** DDL, RPCs, RLS policies), [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) (phased build + verification), [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md) (current status)

> **Relationship to the architecture spec:** `akshaya-platform-architecture.md` holds the executable
> detail — full SQL DDL, RPC bodies, every RLS policy. This TRD is the system-level view: architecture
> shape, stack rationale, API surface, security and deployment strategy. Where they overlap, the
> architecture doc is authoritative and this document links to it rather than restating SQL.

---

## 1. System Architecture

### Recommendation: **Modular monolith**, not microservices

For a single-location hospitality business with three business lines and an expected order volume in
the tens-to-low-hundreds per day, microservices would add deployment surface, network failure modes,
and distributed-transaction problems to solve a scaling problem this product does not have. The
recommendation is a **modular monolith**: one Next.js deployment with clear internal module boundaries
(order, payment, lead, invoice, admin), backed by one Postgres database.

**Why this holds up:**
- The riskiest operation in the system (order → payment → confirmation) is a single logical transaction. In a monolith it's one DB transaction; split across services it becomes a saga with compensating actions — strictly worse for the same guarantee.
- Vercel scales the Next.js layer horizontally without any service decomposition; Supabase scales Postgres vertically well past this product's ceiling.
- Module boundaries are enforced by folder structure and the RPC/route-handler split, so a future extraction (e.g. a separate notification worker) is mechanical, not a rewrite.

**When to revisit:** multi-branch rollout (Task 10 in `PROJECT_MEMORY.md` Open Items) or a notification/
reporting workload heavy enough to affect checkout latency. Neither exists today.

### High-level shape

```text
┌────────────────────────────────────────────────────────────┐
│  CLIENT (browser / mobile web)                             │
│  Next.js App Router — React Server Components + client      │
│  islands (cart, checkout, admin tables)                     │
└───────────────┬───────────────────────┬────────────────────┘
                │                       │
    Supabase JS │ (anon key, RLS)       │ fetch()
                ▼                       ▼
┌───────────────────────────┐  ┌────────────────────────────┐
│  SUPABASE                 │  │  NEXT.JS ROUTE HANDLERS     │
│  ├ Postgres + RLS         │  │  (server-only secrets)      │
│  ├ security-definer RPCs  │◄─┤  ├ /api/payments/*          │
│  │   create_order, etc.   │  │  ├ /api/webhooks/razorpay   │
│  ├ Auth (staff/admin/     │  │  ├ /api/leads/export*       │
│  │   owner only)          │  │  ├ /api/invoices/[id]/pdf   │
│  ├ Realtime (order feed)  │  │  └ /api/receipts/[id]       │
│  └ Storage (menu images,  │  └──────┬─────────────────────┘
│      invoices, receipts)  │         │
└───────────────────────────┘         ▼
                          ┌────────────────────────────────┐
                          │  EXTERNAL                       │
                          │  ├ Razorpay (UPI intent + webhook)│
                          │  ├ Google Sheets API (service acct)│
                          │  └ WhatsApp Cloud API / Twilio   │
                          └────────────────────────────────┘
```

### API layer — two tiers, deliberately

| Tier | Used for | Why |
|---|---|---|
| **Postgres RPC** (`security definer`, called via Supabase client) | Anything writing money- or pricing-sensitive data: `create_order`, enquiry+lead transactional writes | Runs inside the DB transaction, bypasses RLS in a controlled way, and makes it structurally impossible for a client to insert an order at a price it chose |
| **Next.js route handlers** | Anything touching a third-party secret or generating a file: Razorpay, Sheets, WhatsApp/Twilio, PDF rendering | Secrets must never reach the browser; these run server-side only |

Guests use the anon key with RLS enforced; staff/admin/owner authenticate via Supabase Auth and are
further checked against `profiles.role`.

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript | Already the codebase's foundation; RSC keeps menu/marketing pages fast and mostly server-rendered, client islands only where interactivity is needed (cart, admin tables) |
| **Styling / UI** | Tailwind CSS v4 + existing gold/void/glass token system; shadcn/ui for admin primitives | Token system already committed and locked (Phase 1.5); shadcn adds accessible table/dialog/form primitives without a competing design system |
| **Animation** | GSAP (scroll reveals), Framer Motion (transitions), React Bits `Beams` (hero) | Already built and locked — not a new decision |
| **Backend** | Supabase (Postgres + Auth + Realtime + Storage) + Next.js route handlers | Avoids standing up and operating a separate Node/NestJS service for what is fundamentally CRUD + a payment webhook. RLS gives per-table authorization the app layer can't accidentally bypass |
| **Database** | Postgres (Supabase-managed), region `ap-south-1` (Mumbai) | Relational data with real foreign keys and money columns; nearest region to Siddipet for latency |
| **State (client)** | Zustand (cart, admin store), persisted to localStorage | Already in use; cart must survive a refresh without a server round-trip |
| **Payments** | Razorpay — UPI intent mode | Chosen over PhonePe (locked decision): native order/payment/refund APIs, webhook signing built in, UPI intent launches the guest's UPI app directly on mobile |
| **Hosting** | Vercel (app) + Supabase (data/auth/storage) | Zero-config Next.js deploys, preview environments per branch, edge middleware for the entry gate |
| **Exports** | `xlsx` npm package (client-side) + `googleapis` Sheets API (server-side) | xlsx needs no setup and works offline; Sheets is additive for owners who connect a service account |
| **Notifications** | WhatsApp Business Cloud API (primary), Twilio SMS (fallback) | WhatsApp familiarity is already assumed by the guest-facing handoff flow |
| **Analytics** | Provider-agnostic `trackEvent()` → `window.dataLayer` (GA4/GTM-compatible shape) | Locked decision: don't hardcode a specific SDK until a provider is chosen |
| **Error monitoring** | Sentry (planned, Phase 9) | Webhook and payment failures need alerting that isn't "a guest complained" |

---

## 3. Database Schema

**Canonical DDL:** [`akshaya-platform-architecture.md` § Deliverable 02](./akshaya-platform-architecture.md#deliverable-02--full-database-schema). Summary of the twelve tables and how they relate:

| Table | Purpose | Key relationships |
|---|---|---|
| `profiles` | Extends `auth.users` with `role` (owner/admin/staff) + contact info. Guests never get a row. | `id` → `auth.users.id`; referenced by `activity_logs.actor_id` |
| `menu_categories` | Menu grouping, admin-editable | 1 → many `menu_items` |
| `menu_items` | Items with `price numeric(10,2)`, veg flag, spice level, availability | `category_id` → `menu_categories.id`; referenced by `order_items` |
| `orders` | Guest orders. `order_number` unique, server-generated with retry-on-conflict. Prices always server-derived. | 1 → many `order_items`; 1 → **many** `payments` (retries after failure), constrained to **at most one `success`**; 1 → **many** `invoices` (a PI and a TI can both reference one order) |
| `order_items` | Line items with a **name/price snapshot** so later menu edits don't rewrite order history | `order_id` → `orders.id` (cascade); `menu_item_id` → `menu_items.id` (restrict) |
| `payments` | Razorpay IDs, status, raw gateway response, plus auto-generated `receipt_number`/`receipt_url` on success | `order_id` → `orders.id`. Unique partial index on `razorpay_payment_id` (real idempotency) and on `order_id WHERE status='success'` (blocks double-charge) |
| `banquet_enquiries` | Banquet form submissions with triage `status` | 1 → 0..1 `invoices` |
| `catering_enquiries` | Catering form submissions with triage `status` | 1 → 0..1 `invoices` |
| `leads` | Every captured intent — orders, enquiries, button clicks — with a `source` enum and `metadata jsonb` | Denormalized by design: a lead survives even if its source row is later deleted |
| `invoices` | PI/TI with FY-prefixed sequential number, GST flag/**rate**/amount, PDF URL | Exactly one of `order_id`/`banquet_enquiry_id`/`catering_enquiry_id` is non-null (enforced by a `check` constraint) |
| `activity_logs` | Audit trail. `actor_id` null = guest/system action | `actor_id` → `profiles.id` |
| `settings` | **Typed singleton row** (boolean PK + `check(id)` makes a second row impossible): GST toggle/rate/GSTIN, notification recipients, Google Sheets config, `extras jsonb` for non-money settings, `version` for optimistic locking | Owner-only via RLS (`is_owner()`); staff read tax fields through `get_gst_config()`. `updated_by` → `profiles.id` |

**Design rules that are not negotiable:**
- Money is `numeric(10,2)`, never float.
- `order_items` snapshots `item_name` and `unit_price` — changing a menu price must never retroactively alter a past order or invoice.
- `invoices` snapshot `gst_applicable`, `gst_rate`, **and** `gst_amount` at generation time, and are immutable once generated; a correction is a new invoice, not an edit. Snapshotting the rate is what allows the `settings` singleton to stay current-state-only instead of a versioned config table — a past tax document is reconstructable from the invoice alone.
- The `settings` singleton is why GST is platform-wide rather than per-order — a per-order GST flag would let two invoices for the same day disagree.
- `orders.status = 'confirmed'` is enforced by a database trigger requiring a successful payment row — not by application convention.

---

## 4. API Design

**Canonical detail:** [`akshaya-platform-architecture.md` § Deliverable 04](./akshaya-platform-architecture.md#deliverable-04--api--rpc-structure).

### Auth (`/auth`)
Handled by Supabase Auth, not custom endpoints. Email+password for staff/admin/owner only; public
sign-up **disabled** (owner creates accounts, then promotes roles). Guests never authenticate — the
entire ordering and enquiry surface is anonymous by design. A Postgres trigger on `auth.users` insert
creates the matching `profiles` row defaulted to `role = 'staff'`.

### Orders
| Operation | Interface | Auth |
|---|---|---|
| Create order | `create_order(name, phone, items)` Postgres RPC | `anon` (granted execute; `security definer`) |
| List/read orders | Supabase client select on `orders` | `staff`+ via RLS |
| Update order status | Supabase client update on `orders` | `staff`+ via RLS |

### Payments
| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/payments/create-order` | POST | public (rate-limited) | Creates a Razorpay order for the **server-computed** total, inserts a `pending` payments row |
| `/api/payments/verify` | POST | public | Optimistic client-side confirmation only — **not** authoritative |
| `/api/webhooks/razorpay` | POST | Razorpay signature | Source of truth: flips payment/order status, generates receipt, fires notification. Idempotent on `razorpay_payment_id` |

### Leads
| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| Insert lead | Supabase client insert / enquiry RPC | `anon` (insert-only policy) | Button-click intent + enquiry capture |
| Read leads | Supabase client select | **owner/admin only** (`is_admin_or_owner()`) | Staff is excluded |
| `/api/leads/export` | GET | owner/admin | Streams `.xlsx` |
| `/api/leads/export-sheets` | POST | owner/admin | Appends to a connected Google Sheet |

### Invoices
| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| Create invoice | Supabase client insert (server-side generation) | `staff`+ | PI/TI generation. Reads GST via **`get_gst_config()` RPC**, never by selecting `settings` — see Settings below |
| `/api/invoices/[id]/pdf` | GET | `staff`+ | Signed Storage URL for the invoice PDF |
| `/api/receipts/[id]` | GET | `staff`+, or guest with matching order phone | Auto-generated payment receipt (distinct from PI/TI) |

### Settings

Two distinct access paths, because two different roles need two different things:

| Operation | Interface | Auth | Notes |
|---|---|---|---|
| `GET /api/settings` | Route handler → `select * from settings` | **owner only** | Full config incl. notification + Sheets fields. Returns `version` — the client must echo it back on write |
| `PATCH /api/settings` | Route handler → `update_settings(version, patch)` RPC | **owner only** | Optimistic locking; partial patch (absent keys untouched) |
| Read GST for invoice generation | `get_gst_config()` RPC | `staff`+ | Tax fields **only**. Raises if the row is missing |

**Why invoice generation does not read `settings` directly.** `/admin/invoices` is staff-accessible,
but `settings` is owner-only — and under RLS a denied read returns **zero rows, not an error**.
A direct `select` from a staff session would yield nothing, the caller would coalesce to
`gst_enabled = false`, and a taxable sale would be invoiced with no tax, silently. `get_gst_config()`
is `security definer`, returns only `gst_enabled`/`gst_rate`/`gst_number`/`legal_business_name`, and
**raises** when the singleton is absent so the failure is loud.

**`PATCH /api/settings` contract:**

```jsonc
// Request
{ "version": 7, "patch": { "gst_enabled": true, "gst_rate": 5.00, "gst_number": "36ABCDE1234F1Z5" } }

// 200 — returns the full updated row, including the new version
{ "settings": { "version": 8, "gst_enabled": true, ... } }

// 409 — someone else changed settings since this client last read them.
// The client re-fetches, re-shows the form, and does not retry blindly.
{ "error": "Settings were modified by someone else", "currentVersion": 9 }
```

| Postgres error | HTTP | Meaning |
|---|---|---|
| `42501` | `403` | Caller is not the owner |
| `40001` | `409` | Version mismatch — concurrent edit |
| `P0002` | `500` | Singleton row missing (should be impossible; delete is trigger-blocked) |
| `23514` | `400` | CHECK violation — e.g. GST enabled without a GSTIN, or a rate outside 0–100 |

**Conventions:** JSON request/response; errors return a stable `{ error: string }` shape with the
correct HTTP status (`400` invalid input or forged signature, `401` unauthenticated, `403` role
denied, `429` rate-limited, `500` unexpected). Route handlers never leak gateway or DB error text to
the client.

---

## 5. Payment Flow

**Sequence diagram:** [`akshaya-platform-architecture.md` § Deliverable 05](./akshaya-platform-architecture.md#deliverable-05--payment-integration-flow).

### UPI/QR generation
Razorpay Checkout in **intent mode**: on mobile the guest's installed UPI app (GPay/PhonePe/Paytm)
launches directly — no manual QR scan step. On desktop, Razorpay renders a scannable QR for the same
order. Both paths produce the same `razorpay_order_id` and the same webhook event, so there is one
confirmation code path, not two.

### Confirmation
1. `create_order` RPC computes the authoritative total from live `menu_items`.
2. `/api/payments/create-order` opens a Razorpay order for exactly that amount and stores a `pending` `payments` row.
3. Guest approves in their UPI app.
4. Razorpay POSTs `payment.captured` to `/api/webhooks/razorpay`.
5. Handler verifies the HMAC signature against `RAZORPAY_WEBHOOK_SECRET`, then in one transaction: `payments.status → 'success'`, `orders.status → 'confirmed'`, generate `receipt_number`/`receipt_url`.
6. Fire-and-forget admin notification; Realtime pushes the confirmed order to any open admin dashboard.

### Webhook handling rules
- **Signature verification is mandatory** — a mismatched signature returns `400` and touches nothing. This is verified by an explicit forged-signature test, not assumed.
- **Idempotent on `razorpay_payment_id`** — Razorpay retries on timeout; a duplicate `payment.captured` must be a no-op. Receipt generation and notification dispatch are gated on the same status check, so neither fires twice.
- **The browser callback is never trusted** — `/api/payments/verify` only speeds up the UI.

### Failure handling
| Failure | Behavior |
|---|---|
| Guest abandons the UPI approval | `orders` stays `pending`, `payments` stays `pending`. Row is **not** deleted — visible to staff as an abandoned order, and the lead is already captured |
| Payment explicitly fails | Webhook sets `payments.status = 'failed'`; order stays unconfirmed; guest sees a retry path |
| Webhook never arrives | Order stays `pending`; reconciliation via `/admin/payments` against Razorpay's dashboard. (A scheduled reconciliation job is a post-v1 improvement, not in scope) |
| Notification provider down | Logged and ignored — never blocks or reverses a confirmed payment |
| `order_number` collision | Retry-on-conflict in generation; never surfaced as a user-facing error |

---

## 6. Role-Based Access Logic

### Two-layer enforcement (both required)
1. **Route layer** — `app/admin/layout.tsx` checks `profiles.role` **server-side** before rendering; anything below the required role is redirected to `/admin/login`.
2. **Database layer** — RLS policies independently enforce the same matrix. A bug in the route guard still cannot leak data.

> **Current state:** the role gate is presently a client-side Zustand simulator for building the console
> UI, **not real access control** (see `PROJECT_MEMORY.md` Key Decisions). It must be **replaced**, not
> extended, by Supabase Auth + these RLS policies before `/admin` is publicly reachable.

### Helper functions
| Function | Returns true for | Guards |
|---|---|---|
| `is_staff()` | any authenticated staff/admin/owner | `orders`, `order_items`, enquiries, `invoices` reads |
| `is_admin_or_owner()` | admin + owner | `payments`, `leads`, `activity_logs` reads; menu writes |
| `is_owner()` | owner only | `settings` (GST toggle, notification/Sheets config) |

All three return `false` (not an error) when `auth.uid()` is null.

### Permission matrix

| Route / Resource | Owner | Admin | Staff | Guest |
|---|---|---|---|---|
| `/order`, `/banquet`, `/catering` (public) | ✓ | ✓ | ✓ | ✓ |
| `/admin/dashboard` | full | full | view | ✗ |
| `/admin/orders` | full | full | view + status update | ✗ |
| `/admin/invoices` | full | full | view + create PI/TI | ✗ |
| `/admin/leads` | full | full | **none** | ✗ |
| `/admin/payments` | full | full | **none** | ✗ |
| `/admin/activity` | full | full | **none** | ✗ |
| `/admin/menu` | full | full | **none** | ✗ |
| `/admin/settings` (GST, roles, integrations) | full | **none** | **none** | ✗ |

The two rows most often gotten wrong: **Staff has no Leads/Payments access** (so those policies use
`is_admin_or_owner()`, not `is_staff()`), and **Admin has no Settings access** (so `settings` uses
`is_owner()`). Both were bugs caught in review — don't reintroduce them.

---

## 7. Data Export System

### Excel (.xlsx)
- Client-side via the `xlsx` npm package for the mock/current phase; a real `/api/leads/export` route streams from the live table once Supabase is live.
- Owner/admin only, enforced at both the route and RLS layers.
- Exports the **currently filtered** view, not blindly the whole table.

### Google Sheets sync
- Owner connects a Google service account (client email + private key) once, in `/admin/settings`. The **private key lives in a server-only secret**, never in the `settings` table and never in a `NEXT_PUBLIC_*` variable — the table stores only the service-account email and target sheet ID for display.
- `/api/leads/export-sheets` uses `spreadsheets.values.append` — append-only, so re-running it doesn't duplicate a full export or overwrite existing rows.
- **Degradation:** if no service account is configured, the Sheets button is disabled with a tooltip pointing at Settings. `.xlsx` export keeps working regardless — Sheets is strictly additive.

---

## 8. Activity Tracking

### Event logging
- Every state-changing operation writes an `activity_logs` row: `actor_id` (null for guest/system), `action` (dotted namespace — `order.created`, `payment.captured`, `enquiry.status_changed`, `settings.gst_toggled`, `profile.role_changed`), `entity_type`, `entity_id`, `metadata jsonb`.
- Writes happen **inside** the `security definer` RPCs and route handlers that perform the mutation — not as a separate client call that could be skipped or forged.
- Guest-side interaction events (page views, button clicks that don't convert) go to `lib/analytics.ts`'s `trackEvent()` → `window.dataLayer`, deliberately **separate** from `activity_logs`. Audit trail and product analytics have different retention, privacy, and trust requirements; conflating them would put untrusted client-reported events into the audit log.

### Admin monitoring
- `/admin/activity` renders the full trail (owner/admin only), filterable by actor, action, entity type, and date range.
- The same `activity_logs` insert on `order.created`/`enquiry.created`/`payment.captured` is what triggers the WhatsApp/SMS admin notification — one write path, not two.

---

## 9. Security

### Authentication
- Supabase Auth (email + password) for staff/admin/owner **only**; public sign-up disabled.
- Supabase issues JWTs; `@supabase/ssr` manages them in httpOnly cookies (not localStorage) so they aren't readable by scripts.
- `auth.uid()` inside RLS policies is the single source of caller identity — the app layer cannot spoof it.
- Guests are never authenticated: no accounts, no OTP, no password to leak. The attack surface for guest data is limited to what a guest supplies (name + phone).

### Data protection
- RLS enabled on **every** table, default-deny — nothing readable until a policy allows it.
- Encryption in transit (TLS everywhere) and at rest (Supabase-managed Postgres encryption).
- PII collected is deliberately minimal: name + phone, email optional. No addresses, no stored payment instruments — Razorpay holds all card/UPI credentials; the platform stores only gateway IDs and status.
- Storage buckets scoped: `menu-images`/`gallery` public read; `invoices` (and receipts) **private, signed URLs only**.
- `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, and the Google private key exist only in server-side contexts — never in a `NEXT_PUBLIC_*` variable.

### Payment security
- No client-supplied price is ever trusted — `create_order` re-derives every line from `menu_items`. Verified by an explicit price-tampering test (inflated price, mismatched quantity, unavailable item ID) in the Phase 3 verification criteria.
- Webhook HMAC signature verification is mandatory; forged signatures rejected with `400` and explicitly tested.
- Idempotency on `razorpay_payment_id` prevents double-confirmation, duplicate receipts, and duplicate notifications.
- Test keys (`rzp_test_`) on preview deployments, live keys (`rzp_live_`) only in production — verified by key prefix assertion, not an HTTP check.
- Rate limiting (Upstash + edge middleware) on the three public insert paths: order creation, enquiry submission, lead insert.

---

## 10. Deployment Strategy

### Environments
| Environment | Hosting | Supabase | Razorpay |
|---|---|---|---|
| Local | `next dev` | Local Supabase CLI or shared dev project | `rzp_test_*` |
| Preview (per branch) | Vercel preview | Dev/staging project | `rzp_test_*` **only** |
| Production | Vercel production | Production project (`ap-south-1`) | `rzp_live_*` |

Env-var scoping is enforced by a startup assertion on the key prefix — Vercel's scoping has no runtime
check of its own, so "preview can't reach live keys" must be asserted in code, not assumed.

### CI/CD
1. **On PR:** typecheck (`tsc --noEmit`), lint, build. Unit tests for webhook signature verification and price-tampering logic — the two highest-risk code paths — run here.
2. **Preview deploy:** every branch gets a Vercel preview against the staging Supabase project and Razorpay test keys.
3. **Migrations:** applied via `supabase db push` as an explicit, reviewed step — never auto-applied on deploy. Supabase's CLI does not generate down-migrations; rollback is a hand-written reverse script or a PITR snapshot restore (documented in `supabase/rollback.md`).
4. **Production deploy:** merge to the default branch → Vercel production build. Migrations run **before** the app deploy when a release contains both.

> **CI is not yet set up** — there is no `.github/workflows/` in the repo today. The above is the target
> pipeline, not a description of what runs now.

### Production rollout
1. Provision the Supabase production project; run migrations `0001`–`0005`; execute the Phase 1 RLS verification matrix for real (`anon`/`staff`/`admin`/`owner` against every sensitive table).
2. Replace the mock admin role store with real Supabase Auth — a **replacement**, not an extension. `/admin` must not be publicly reachable before this lands (use Vercel Deployment Protection in the interim).
3. Swap static menu data for live Supabase reads; swap the WhatsApp handoff for the real `create_order` RPC + Razorpay flow (keeping WhatsApp as a visible fallback, not removing it).
4. Go live on Razorpay **test** keys first; run the full checkout path end-to-end including webhook delivery and receipt generation.
5. Flip to live keys, enable rate limiting and Sentry, run the 200-concurrent load test (p95 ≤ 2 s).
6. Confirm real business hours and replace the placeholder `openingHoursSpecification` JSON-LD before the site is indexed with wrong hours.

Full ordered checklist: [`IMPLEMENTATION_PLAN.md` § Go Live](./IMPLEMENTATION_PLAN.md).

---

*Product spec: [`PRD.md`](./PRD.md). Executable schema/RPC/RLS detail: [`akshaya-platform-architecture.md`](./akshaya-platform-architecture.md).*
