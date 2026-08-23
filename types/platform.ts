/**
 * The one role vocabulary. Mirrors the Postgres `user_role` enum
 * (`0001_enums.sql` + `0018_add_super_admin_role.sql`). If you add a label to
 * one, add it to the other in the same change — a role that exists in only one
 * place is either a type error waiting to happen or a policy that silently
 * matches nobody.
 *
 * Ranking, highest first: super_admin > owner > admin > staff.
 * `super_admin` is accepted everywhere `owner` is; the DB helpers in
 * `0019_rbac_hardening.sql` make the same choice (`is_owner()` matches both).
 */
export type UserRole = 'super_admin' | 'owner' | 'admin' | 'staff';

/**
 * Named role sets, so a page never hand-rolls an array. Before these existed,
 * `/admin/orders` passed ["owner","admin","staff"] to <RoleGate> while
 * `requireAdminSession()` defaulted to ["owner","admin"] — the client gate and
 * the server gate disagreed about who staff were, on the same page.
 *
 * Use these on BOTH sides of every admin page so the two can never drift.
 */

/** Platform-wide. Cross-business surfaces only. */
export const SUPER_ADMIN_ONLY: readonly UserRole[] = ['super_admin'];

/** Settings, GST toggle, staff accounts, role assignment. */
export const OWNER_AND_ABOVE: readonly UserRole[] = ['owner', 'super_admin'];

/** Payments, leads, activity, menu CRUD, webhook console. */
export const ADMIN_AND_ABOVE: readonly UserRole[] = ['admin', 'owner', 'super_admin'];

/** Dashboard, orders, invoices — everyone with a console account. */
export const STAFF_AND_ABOVE: readonly UserRole[] = ['staff', 'admin', 'owner', 'super_admin'];

/** Every role, for pickers and iteration. Ordered most privileged first. */
export const ALL_ROLES: readonly UserRole[] = ['super_admin', 'owner', 'admin', 'staff'];
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type EnquiryStatus = 'new' | 'contacted' | 'quoted' | 'confirmed' | 'lost';
export type LeadSource = 'restaurant_order' | 'banquet_enquiry' | 'catering_enquiry' | 'button_click' | 'contact_form';
export type InvoiceType = 'proforma' | 'tax';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_veg: boolean;
  is_available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  guest_name: string;
  guest_phone: string;
  status: OrderStatus;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Payment {
  id: string;
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  amount: number;
  status: PaymentStatus;
  raw_response: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface BanquetEnquiry {
  id: string;
  guest_name: string;
  guest_phone: string;
  event_date: string;
  guest_count: number;
  event_type: string;
  notes: string | null;
  status: EnquiryStatus;
  created_at: string;
}

export interface CateringEnquiry {
  id: string;
  guest_name: string;
  guest_phone: string;
  event_date: string;
  guest_count: number;
  location: string;
  notes: string | null;
  status: EnquiryStatus;
  created_at: string;
}

export interface Lead {
  id: string;
  source: LeadSource;
  guest_name: string;
  guest_phone: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  type: InvoiceType;
  order_id: string | null;
  banquet_enquiry_id: string | null;
  catering_enquiry_id: string | null;
  subtotal: number;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
  pdf_url: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
