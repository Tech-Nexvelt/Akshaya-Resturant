-- Migration 0005: RLS Policies & Helper Functions
-- Enforces Row-Level Security across all 11 tables with corrected RBAC privileges.

-- Helper function: is current user staff/admin/owner?
CREATE OR REPLACE FUNCTION is_staff() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid());
$$;

-- Helper function: is current user admin or owner?
CREATE OR REPLACE FUNCTION is_admin_or_owner() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','owner'));
$$;

-- Helper function: is current user the owner?
-- Required because /admin/settings (GST toggle, staff accounts, role assignment) is
-- owner-only in the RBAC table — is_admin_or_owner() would wrongly match plain admin.
CREATE OR REPLACE FUNCTION is_owner() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner');
$$;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE banquet_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE catering_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES
-- SECURITY: role assignment is OWNER-ONLY. The previous "admin manage profiles"
-- policy was FOR ALL USING (is_admin_or_owner()), which let any admin UPDATE their
-- own row and set role='owner' — a one-statement privilege escalation, and a direct
-- contradiction of the RBAC table (/admin/settings = admin: none). Split into a
-- read policy for staff+ and a write policy restricted to owner.
CREATE POLICY "read own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "staff read all profiles" ON profiles FOR SELECT USING (is_staff());
CREATE POLICY "owner insert profiles" ON profiles FOR INSERT WITH CHECK (is_owner());
CREATE POLICY "owner update profiles" ON profiles FOR UPDATE USING (is_owner()) WITH CHECK (is_owner());
CREATE POLICY "owner delete profiles" ON profiles FOR DELETE USING (is_owner());

-- 2. MENU CATEGORIES & ITEMS (Public read active/available; Admin/Owner write)
CREATE POLICY "public read active categories" ON menu_categories FOR SELECT USING (active);
CREATE POLICY "admin manage categories" ON menu_categories FOR ALL USING (is_admin_or_owner());

CREATE POLICY "public read available items" ON menu_items FOR SELECT USING (available);
CREATE POLICY "admin manage items" ON menu_items FOR ALL USING (is_admin_or_owner());

-- 3. ORDERS & ORDER ITEMS (Staff read/update; direct client insert blocked, RPC used)
CREATE POLICY "staff read orders" ON orders FOR SELECT USING (is_staff());
CREATE POLICY "staff update orders" ON orders FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());
CREATE POLICY "staff read order_items" ON order_items FOR SELECT USING (is_staff());

-- RLS cannot restrict WHICH columns an update touches — without this, "staff update
-- orders" lets any staff account rewrite subtotal/total (e.g. to 0) or flip status to
-- 'confirmed' on an unpaid order. Column-level grants are the mechanism that actually
-- scopes it to the operational fields the RBAC table intends ("view + status update").
REVOKE UPDATE ON orders FROM authenticated;
GRANT UPDATE (status, notes, updated_at) ON orders TO authenticated;

-- 4. PAYMENTS (Service-role writes via webhook; Admin/Owner read only)
CREATE POLICY "admin read payments" ON payments FOR SELECT USING (is_admin_or_owner());

-- 5. BANQUET ENQUIRIES (Public insert; Staff read/update)
CREATE POLICY "public submit banquet enquiry" ON banquet_enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "staff read banquet enquiries" ON banquet_enquiries FOR SELECT USING (is_staff());
CREATE POLICY "staff update banquet enquiries" ON banquet_enquiries FOR UPDATE USING (is_staff());

-- 6. CATERING ENQUIRIES (Public insert; Staff read/update)
CREATE POLICY "public submit catering enquiry" ON catering_enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "staff read catering enquiries" ON catering_enquiries FOR SELECT USING (is_staff());
CREATE POLICY "staff update catering enquiries" ON catering_enquiries FOR UPDATE USING (is_staff());

-- 7. LEADS (Public insert; Admin/Owner read only)
CREATE POLICY "public create lead" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "admin read leads" ON leads FOR SELECT USING (is_admin_or_owner());

-- 8. INVOICES (Staff read; Admin/Owner manage)
CREATE POLICY "staff read invoices" ON invoices FOR SELECT USING (is_staff());
CREATE POLICY "admin manage invoices" ON invoices FOR ALL USING (is_admin_or_owner());

-- 9. ACTIVITY LOGS (Admin/Owner read; security definer RPCs write)
CREATE POLICY "admin read activity" ON activity_logs FOR SELECT USING (is_admin_or_owner());
