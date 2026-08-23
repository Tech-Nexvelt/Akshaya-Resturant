# Akshaya — Product Requirements Document (PRD)

**Product:** Akshaya Hospitality Platform (Restaurant + Banquet Hall + Catering)
**Doc version:** 1.0.0 · **Last updated:** 2026-08-21
**Companion docs:** [`TRD.md`](./TRD.md) (technical spec), [`akshaya-platform-architecture.md`](./akshaya-platform-architecture.md) (schema/API detail), [`PROJECT_MEMORY.md`](./PROJECT_MEMORY.md) (current build status — **read this before assuming anything below is live**)

> **Status note:** This PRD describes the target product. As of this writing, the marketing site and
> UI flows are built against mock/static data; live Supabase, Razorpay, and the notification/Sheets
> integrations are not yet provisioned (owner-deferred). Every section below is written as the
> intended end state — cross-check `PROJECT_MEMORY.md`'s Overview for what's actually live today.

---

## 1. Product Vision

### Problem it solves
Akshaya Family Restaurant (Siddipet, Telangana, est. 2007) runs three business lines — walk-in/
delivery restaurant, banquet hall bookings, and catering — with no unified digital front door. Today,
enquiries and orders arrive by phone or in person, which means:
- No structured record of leads (who enquired, for what, when) — follow-up depends entirely on staff memory.
- No online payment path — every rupee is collected in person, which caps order volume to walk-in capacity and creates cash-handling overhead.
- No visibility for ownership into daily order/enquiry volume without manually asking staff.
- No consistent invoicing (PI/TI) — generated ad hoc, with no GST toggle for one restaurant serving both GST and non-GST scenarios (banquet vs. small order).

Akshaya-the-platform digitizes intake (ordering, booking enquiries, catering enquiries) and back-office
operations (lead tracking, invoicing, payment reconciliation) without adding friction for the guest —
no account, no app download, no OTP.

### Target audience
| Segment | Who | Primary need |
|---|---|---|
| Guests (B2C) | Walk-in/delivery diners in and around Siddipet | Order food fast on a phone, pay instantly, no signup |
| Event planners / hosts (B2C, higher-intent) | Families/organizers booking weddings, receptions, corporate events | Fast enquiry submission, confident someone will follow up |
| Corporate/bulk buyers (B2B-ish) | Offices, event organizers needing catering | Same as above, plus itemized invoicing (GST) |
| Restaurant ownership & staff (internal) | Owner, Admin, Staff (kitchen/front-of-house) | One dashboard for orders, leads, payments, invoices — no spreadsheets |

### Business goals
1. Move a measurable share of order volume online (reduces phone-order errors and frees staff time).
2. Capture **100% of inbound intent** (every order, every banquet/catering enquiry, every "Order Now" click) as a lead — nothing lost to memory or a missed call.
3. Eliminate cash-handling risk and reconciliation effort on the ordering flow via UPI-only payment.
4. Give ownership same-day, self-serve visibility into revenue, leads, and GST-liable invoices without asking staff to compile it.
5. Keep the platform sellable as a template for other single-location hospitality businesses later (Task 10 in `PROJECT_MEMORY.md`'s Open Items — explicitly out of scope for v1, noted for architecture decisions only).

---

## 2. User Personas

### Customer (ordering food)
- **Who:** Walk-in-adjacent or delivery diner, on their phone, in a hurry.
- **Goals:** See the menu, order in a few taps, pay without creating an account, get confirmation.
- **Frustrations this fixes:** Phoning in an order and mishearing/being mishead; no visibility into whether the order was received.
- **Technical comfort:** Low-to-medium — must work with zero onboarding, no app store detour, no password.

### Event planner / host (banquet enquiry)
- **Who:** Person organizing a wedding, reception, birthday, or corporate event at the banquet hall.
- **Goals:** Quickly express interest (date, guest count, event type) and get a human follow-up call — this is a high-consideration purchase, so the platform's job is capture and handoff, not closing the sale online.
- **Frustrations this fixes:** Calling during business hours only; no confirmation their enquiry was received.

### Admin
- **Who:** Restaurant manager/office staff responsible for day-to-day operations.
- **Goals:** See every lead and order in one place, triage banquet/catering enquiries, export data for follow-up campaigns, monitor payment status.
- **Explicitly not:** Financial reporting or GST control (Owner-only) or staff/role management (Owner-only).

### Owner
- **Who:** Business owner/proprietor.
- **Goals:** Full visibility (everything Admin sees, plus financial reports), control GST behavior platform-wide, manage staff accounts and roles, configure notification/export integrations.
- **Frustrations this fixes:** Not knowing daily numbers without asking; no single place to toggle GST across invoices; no audit trail of who changed what.

### Staff (invoice creation, order fulfillment)
- **Who:** Front-of-house or back-office staff handling order status and invoice generation.
- **Goals:** Update order status (received → preparing → ready), generate PI/TI for confirmed orders/enquiries.
- **Explicitly not:** No access to Leads, Payments, Activity Log, Menu CRUD, or Settings (see RBAC, PRD §4 / `akshaya-platform-architecture.md` Deliverable 09).

---

## 3. User Flows

### 3.1 Food ordering → payment → confirmation
1. Guest lands on `/` (decision gate) → picks **Restaurant** → arrives at `/home`, taps the ordering CTA → `/order`.
2. Browses menu by category (`menu_categories`/`menu_items`), adds items to cart (client-side Zustand store, persisted to localStorage so a refresh doesn't lose the cart).
3. Opens cart drawer, reviews line items and subtotal, proceeds to checkout.
4. Checkout form collects **name + phone only** — no account, no email required.
5. Taps **Pay Now** → client calls `create_order` RPC (server re-derives every price from `menu_items`; a stale/tampered client price is never trusted) → order row created in `pending` status.
6. Client opens Razorpay Checkout in UPI-intent mode for the server-computed total.
7. Guest approves in their UPI app (GPay/PhonePe/Paytm).
8. Razorpay's **webhook** (not the browser callback) confirms payment server-side, flips `payments.status = 'success'` and `orders.status = 'confirmed'`, generates the auto payment receipt, and notifies admin staff (WhatsApp/SMS).
9. Guest sees an order-confirmation screen with order number, item summary, and receipt link.

*Interim state (documented in `PROJECT_MEMORY.md`): until Supabase/Razorpay are live, step 5 onward hands off to a pre-filled WhatsApp message instead of a real charge — this is a build-order decision, not a scope change.*

### 3.2 Banquet enquiry → lead capture
1. Guest picks **Banquet** on the gate (or taps "Book Now" from `/home`) → `/banquet`.
2. Fills a single-screen form: name, phone, event type, date, guest count, budget range, additional requirements.
3. Submits → one transaction writes a `banquet_enquiries` row **and** a `leads` row (`source = 'banquet_enquiry'`) — never one without the other.
4. Guest sees a confirmation message; staff sees the enquiry appear in `/admin/leads` and `/admin/dashboard`.

### 3.3 Catering enquiry → lead capture
Same shape as 3.2 at `/catering`, fields: name, phone, event type, location, guest count, date, requirements. `leads.source = 'catering_enquiry'`.

### 3.4 Admin → view/export leads
1. Admin (or Owner) opens `/admin/leads`.
2. Views all leads across all sources (order, banquet enquiry, catering enquiry, button-click intent) with filter/search by name, phone, source, date range.
3. Exports the filtered view to **.xlsx** (instant download) or **Google Sheets** (append to a connected sheet, once configured in Settings).
4. Staff role cannot open this route at all — blocked both in the UI (`RoleGate`) and at the database (RLS).

### 3.5 Staff → create PI/TI
1. Staff opens `/admin/invoices` (or an order/enquiry detail view) for a confirmed order or enquiry.
2. Selects **Proforma Invoice** or **Tax Invoice**, system generates a sequential, FY-prefixed invoice number (`AK-INV-FY2026-####`), applies GST only if the platform-wide GST toggle (Owner-controlled) is on.
3. PDF is generated and made available for download/print; the action is recorded in `activity_logs`.

### 3.6 Owner → toggle GST
1. Owner opens `/admin/settings` (Admin and Staff cannot reach this route).
2. Toggles GST on/off and sets the rate; this is a **platform-wide singleton setting** (`settings` table, one row), not per-order.
3. Every invoice generated after the toggle reflects the new state; past invoices are untouched (immutable once generated).
4. Change is written to `activity_logs` with the owner's `actor_id`.

---

## 4. Features List

### Customer Features
- Menu browsing by category, with veg/non-veg and spice-level indicators, item photos.
- Add to cart, adjust quantity, persistent cart across a session.
- Guest checkout — name + phone only, no account.
- Order & pay via UPI/QR (Razorpay intent mode — UPI app launches directly on mobile, no separate QR scan step needed).
- Order confirmation screen + auto-generated payment receipt.
- Banquet/catering enquiry forms — no payment, enquiry-only.

### Admin Features
- Lead dashboard — all sources, filter/search, xlsx + Google Sheets export.
- Order management — live feed (Realtime), status updates for kitchen/front-of-house ops.
- Payment reconciliation view — payment ID, status, gateway response.
- Invoice list (view access) — PI/TI, PDF download.
- **Explicitly excluded from Admin:** Settings (GST toggle, staff/role management, notification/Sheets config) — Owner-only.

### Owner Features
- Everything Admin has, plus:
- GST toggle (platform-wide, singleton setting) and rate configuration.
- Staff account management and role assignment.
- Notification channel config (WhatsApp/SMS recipient) and Google Sheets connection.
- Full financial visibility — revenue snapshot, payment reconciliation, invoice totals.
- Full activity log access — every order, enquiry, payment, and admin action.

### Staff Features
- View dashboard, orders, and invoices.
- Update order status (received → preparing → ready → completed).
- Create Proforma Invoice (PI) and Tax Invoice (TI) for confirmed orders/enquiries.
- **Explicitly excluded:** Leads, Payments, Activity Log, Menu CRUD, Settings.

---

## 5. Functional Requirements

### Button-click / interaction behavior
| Action | System behavior |
|---|---|
| Tap a menu item / "Add to cart" | Item added to Zustand cart store, cart badge count updates immediately (client-side, no network round-trip) |
| Tap "Pay Now" in checkout | Client validates name + phone are present (non-empty, phone matches a basic length check) before calling `create_order`; button disables + shows a cooldown state to prevent double-submission |
| Tap "Submit" on banquet/catering form | Same disable-and-cooldown pattern; validates required fields client-side before the transactional RPC write |
| Owner toggles GST switch | Optimistic UI update, then a write to `settings.gst_enabled`; on failure the toggle reverts and shows an error — GST state must never silently desync between UI and DB |
| Staff clicks "Generate Invoice" | Reads current `settings.gst_enabled`/`gst_rate` at generation time (not the state when the order was placed) — an invoice generated today always reflects today's GST setting |

### Data captured
| Flow | Data captured | Where |
|---|---|---|
| Order | name, phone, cart lines (item, qty), server-derived prices | `orders`, `order_items` |
| Banquet enquiry | name, phone, event type, date, guest count, budget range, notes | `banquet_enquiries` + `leads` |
| Catering enquiry | name, phone, event type, location, guest count, date, requirements | `catering_enquiries` + `leads` |
| Button-click intent (e.g. "Order Now" tap with no follow-through) | name/phone if available, source tag | `leads` (`source = 'button_click'`) |
| Every state-changing action | actor (or null for guest/system), action name, entity type/id, metadata | `activity_logs` |

### Payment validation flow
1. Client never computes the amount charged — `create_order` RPC re-derives every line price from live `menu_items` at write time.
2. `/api/payments/create-order` opens a Razorpay order for exactly that server-computed total — the Razorpay order amount and the DB `orders.total` are the same number, set once, never re-negotiated.
3. The client-side payment callback (`/api/payments/verify`) is **optimistic UI only** — it may show "Payment successful" faster, but it is never what marks an order `confirmed`.
4. The **webhook** (`/api/webhooks/razorpay`) is the sole source of truth: verifies Razorpay's signature against `RAZORPAY_WEBHOOK_SECRET`, rejects anything that doesn't match with `400`, and is idempotent — a retried webhook for the same `razorpay_payment_id` is a no-op, never a double-confirm or a duplicate receipt.
5. No cash/COD path exists anywhere — enforced structurally (no cash `payment_method`, no "pay at counter" UI option, `orders.status` can only reach `confirmed` via a successful webhook write).

### Order confirmation logic
- An order is "confirmed" if and only if `payments.status = 'success'` for its linked payment, written exclusively by the webhook.
- On confirmation: `orders.status → 'confirmed'`, a payment receipt is generated (`payments.receipt_number`/`receipt_url`), an admin WhatsApp/SMS notification fires (fire-and-forget — never blocks the confirmation itself), and a Realtime push updates any open admin dashboard within ~2 seconds.
- If payment fails or times out, `orders.status` stays `pending`/moves to a failed state visible to staff — the order row is not deleted, so no lead/intent is ever silently lost even on payment failure.

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | `/order` menu load < 200 ms server response; checkout-to-Razorpay-handoff < 1 s; admin Realtime order feed updates within 2 s of a DB write |
| **Security** | RLS enabled on every table, default-deny; no client-supplied price ever trusted for a payment; webhook signature verified, forged signatures rejected with `400`; service-role key and payment secrets never exposed to the browser (`NEXT_PUBLIC_*`) |
| **Scalability** | Stateless Next.js app (horizontally scalable on Vercel); Postgres (Supabase) as the single relational source of truth; target 200 concurrent guest checkout sessions at p95 ≤ 2 s (per `IMPLEMENTATION_PLAN.md` Phase 9) |
| **Availability** | Public site (`/`, `/order`, `/banquet`, `/catering`) must degrade gracefully if Supabase/Razorpay are unreachable — WhatsApp handoff is the existing fallback pattern, not a new one; `/admin` outage does not affect guest-facing flows (separate route group, separate failure domain) |
| **Data integrity** | Order pricing and enquiry writes always go through `security definer` RPCs, never raw client inserts — guarantees a price or a lead can't be fabricated or tampered with from the browser |
| **Auditability** | Every state-changing action (order, payment, enquiry status change, GST toggle, role change) writes to `activity_logs` — no admin mutation is silent |

---

## 7. Success Metrics

> None of these are instrumented against live traffic yet — `lib/analytics.ts`'s `trackEvent()` pushes
> to `window.dataLayer` but no analytics provider is wired up, and there's no live payment/order volume
> until Supabase + Razorpay go live (see `PROJECT_MEMORY.md` Open Items). Listed here as the metrics
> the platform must be able to report once live, and where each one comes from.

| Metric | Definition | Data source |
|---|---|---|
| **Conversion rate** | Guests who reach `/order` (or `/banquet`, `/catering`) ÷ guests who complete an order/enquiry | `trackEvent()` funnel events + `orders`/`banquet_enquiries`/`catering_enquiries` row counts |
| **Orders per day** | Count of `orders` with `status != 'cancelled'`, grouped by day | `orders.created_at` |
| **Lead capture rate** | Total `leads` rows ÷ total distinct site sessions | `leads.created_at` vs. analytics session count |
| **Payment success rate** | `payments` rows with `status = 'success'` ÷ total `payments` rows created | `payments.status` |
| **Enquiry-to-response time** (operational, not in original brief but directly supports the business goal in §1) | Time between `banquet_enquiries`/`catering_enquiries.created_at` and `status` first changing away from `'new'` | `activity_logs` (`enquiry.status_changed`) |

---

*Companion technical spec: [`TRD.md`](./TRD.md). Schema/API/RLS detail lives in [`akshaya-platform-architecture.md`](./akshaya-platform-architecture.md) — this PRD intentionally does not restate SQL or endpoint signatures.*
