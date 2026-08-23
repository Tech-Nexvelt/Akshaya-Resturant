import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  UserRole,
  OrderStatus,
  PaymentStatus,
  EnquiryStatus,
  LeadSource,
  InvoiceType,
  Profile,
  Order,
  OrderItem,
  Payment,
  Lead,
  Invoice,
  ActivityLog,
  BanquetEnquiry,
  CateringEnquiry,
} from "@/types/platform";
import { menuItems as initialMenuItems, menuCategories as initialMenuCategories } from "@/lib/data";

export interface ExtendedMenuItem {
  id: string;
  category_id: string;
  category_name: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_veg: boolean;
  spice_level: number;
  available: boolean;
  sort_order: number;
}

interface AdminState {
  currentRole: UserRole | null;
  currentUser: Profile | null;
  gstEnabled: boolean;
  gstRate: number; // e.g., 5% for food service
  
  // Collections
  staffProfiles: Profile[];
  orders: Order[];
  orderItemsMap: Record<string, OrderItem[]>;
  payments: Payment[];
  leads: Lead[];
  banquetEnquiries: BanquetEnquiry[];
  cateringEnquiries: CateringEnquiry[];
  invoices: Invoice[];
  activityLogs: ActivityLog[];
  menuItemsList: ExtendedMenuItem[];
  
  // Realtime Feed Simulation
  lastOrderAlert: string | null;

  // Actions
  setRole: (role: UserRole | null) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addSimulatedOrder: (guestName?: string, guestPhone?: string) => void;
  toggleMenuItemAvailability: (itemId: string) => void;
  updateMenuItemPrice: (itemId: string, newPrice: number) => void;
  addMenuItem: (item: Omit<ExtendedMenuItem, "id">) => void;
  toggleGst: (enabled: boolean) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  updateEnquiryStatus: (type: "banquet" | "catering", id: string, status: EnquiryStatus) => void;
  exportLeadsToCsv: () => string;
  clearLastOrderAlert: () => void;
}

// Map category names to UUID-like IDs
const categoryIdMap: Record<string, string> = {
  Biryani: "cat-biryani-01",
  Kababs: "cat-kababs-02",
  Curries: "cat-curries-03",
  Cafe: "cat-cafe-04",
  Desserts: "cat-desserts-05",
};

const initialExtendedMenuItems: ExtendedMenuItem[] = initialMenuItems.map((item, idx) => ({
  id: item.id,
  category_id: categoryIdMap[item.category] || "cat-biryani-01",
  category_name: item.category,
  name: item.name,
  description: item.description,
  price: item.price,
  image_url: null,
  is_veg: item.category === "Cafe" || item.category === "Desserts",
  spice_level: item.spice,
  available: true,
  sort_order: idx + 1,
}));

const initialProfiles: Profile[] = [
  {
    id: "user-owner-01",
    email: "owner@akshayarestaurant.in",
    full_name: "Srinivas Rao",
    phone: "98490 12345",
    role: "owner",
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-08-20T10:00:00Z",
  },
  {
    id: "user-admin-01",
    email: "admin@akshayarestaurant.in",
    full_name: "Rajesh Varma",
    phone: "98490 67890",
    role: "admin",
    created_at: "2026-02-01T11:30:00Z",
    updated_at: "2026-08-20T10:00:00Z",
  },
  {
    id: "user-staff-01",
    email: "kitchen.staff@akshayarestaurant.in",
    full_name: "Mahesh Kumar",
    phone: "98490 54321",
    role: "staff",
    created_at: "2026-03-15T09:15:00Z",
    updated_at: "2026-08-20T10:00:00Z",
  },
  {
    id: "user-staff-02",
    email: "frontdesk@akshayarestaurant.in",
    full_name: "Priya Reddy",
    phone: "98490 98765",
    role: "staff",
    created_at: "2026-04-01T14:20:00Z",
    updated_at: "2026-08-20T10:00:00Z",
  },
];

const initialOrders: Order[] = [
  {
    id: "ord-101",
    order_number: "AK-20260820-0417",
    guest_name: "Venkatesh Rao",
    guest_phone: "98491 11223",
    status: "preparing",
    subtotal: 770,
    tax_amount: 38.5,
    total_amount: 808.5,
    notes: "Please make Biryani extra spicy with separate gravy",
    created_at: "2026-08-20T18:30:00Z",
    updated_at: "2026-08-20T18:35:00Z",
  },
  {
    id: "ord-102",
    order_number: "AK-20260820-0418",
    guest_name: "Sravanthi Reddy",
    guest_phone: "97012 33445",
    status: "confirmed",
    subtotal: 620,
    tax_amount: 31,
    total_amount: 651,
    notes: "Deliver near Siddipet New Bus Stand",
    created_at: "2026-08-20T19:10:00Z",
    updated_at: "2026-08-20T19:10:00Z",
  },
  {
    id: "ord-103",
    order_number: "AK-20260820-0419",
    guest_name: "Anil Kumar",
    guest_phone: "99890 55667",
    status: "ready",
    subtotal: 1050,
    tax_amount: 52.5,
    total_amount: 1102.5,
    notes: "Dine-in takeaway order",
    created_at: "2026-08-20T19:45:00Z",
    updated_at: "2026-08-20T20:05:00Z",
  },
  {
    id: "ord-104",
    order_number: "AK-20260820-0420",
    guest_name: "Kiran Mazumdar",
    guest_phone: "94401 77889",
    status: "completed",
    subtotal: 450,
    tax_amount: 22.5,
    total_amount: 472.5,
    notes: null,
    created_at: "2026-08-20T17:15:00Z",
    updated_at: "2026-08-20T17:45:00Z",
  },
];

const initialOrderItemsMap: Record<string, OrderItem[]> = {
  "ord-101": [
    {
      id: "oi-101-1",
      order_id: "ord-101",
      menu_item_id: "special-mutton-biryani",
      item_name: "Special Mutton Biryani",
      unit_price: 450,
      quantity: 1,
      subtotal: 450,
    },
    {
      id: "oi-101-2",
      order_id: "ord-101",
      menu_item_id: "miriyala-kabab",
      item_name: "Miriyala Kabab",
      unit_price: 320,
      quantity: 1,
      subtotal: 320,
    },
  ],
  "ord-102": [
    {
      id: "oi-102-1",
      order_id: "ord-102",
      menu_item_id: "chicken-dum-biryani",
      item_name: "Chicken Dum Biryani",
      unit_price: 320,
      quantity: 1,
      subtotal: 320,
    },
    {
      id: "oi-102-2",
      order_id: "ord-102",
      menu_item_id: "hariyali-kabab",
      item_name: "Hariyali Kabab",
      unit_price: 300,
      quantity: 1,
      subtotal: 300,
    },
  ],
  "ord-103": [
    {
      id: "oi-103-1",
      order_id: "ord-103",
      menu_item_id: "special-mutton-biryani",
      item_name: "Special Mutton Biryani",
      unit_price: 450,
      quantity: 2,
      subtotal: 900,
    },
    {
      id: "oi-103-2",
      order_id: "ord-103",
      menu_item_id: "double-ka-meetha",
      item_name: "Double Ka Meetha",
      unit_price: 150,
      quantity: 1,
      subtotal: 150,
    },
  ],
  "ord-104": [
    {
      id: "oi-104-1",
      order_id: "ord-104",
      menu_item_id: "special-mutton-biryani",
      item_name: "Special Mutton Biryani",
      unit_price: 450,
      quantity: 1,
      subtotal: 450,
    },
  ],
};

const initialPayments: Payment[] = [
  {
    id: "pay-101",
    order_id: "ord-101",
    razorpay_order_id: "order_Pz91827364",
    razorpay_payment_id: "pay_Qx12345678",
    razorpay_signature: "sig_abc123def456",
    amount: 808.5,
    status: "success",
    raw_response: { method: "upi", vpa: "venkatesh@okaxis", bank: "HDFC" },
    created_at: "2026-08-20T18:31:00Z",
    updated_at: "2026-08-20T18:31:05Z",
  },
  {
    id: "pay-102",
    order_id: "ord-102",
    razorpay_order_id: "order_Pz91827365",
    razorpay_payment_id: "pay_Qx12345679",
    razorpay_signature: "sig_abc123def457",
    amount: 651,
    status: "success",
    raw_response: { method: "upi", vpa: "sravanthi@ybl", bank: "ICICI" },
    created_at: "2026-08-20T19:10:30Z",
    updated_at: "2026-08-20T19:10:35Z",
  },
  {
    id: "pay-103",
    order_id: "ord-103",
    razorpay_order_id: "order_Pz91827366",
    razorpay_payment_id: "pay_Qx12345680",
    razorpay_signature: "sig_abc123def458",
    amount: 1102.5,
    status: "success",
    raw_response: { method: "upi", vpa: "anil@paytm", bank: "SBI" },
    created_at: "2026-08-20T19:45:20Z",
    updated_at: "2026-08-20T19:45:25Z",
  },
  {
    id: "pay-104",
    order_id: "ord-104",
    razorpay_order_id: "order_Pz91827367",
    razorpay_payment_id: "pay_Qx12345681",
    razorpay_signature: "sig_abc123def459",
    amount: 472.5,
    status: "success",
    raw_response: { method: "card", card_network: "Visa", last4: "4242" },
    created_at: "2026-08-20T17:15:30Z",
    updated_at: "2026-08-20T17:15:35Z",
  },
];

const initialLeads: Lead[] = [
  {
    id: "lead-201",
    source: "banquet_enquiry",
    guest_name: "Ramesh Goud",
    guest_phone: "98492 88990",
    details: { event_type: "Engagement Ceremony", guest_count: 150, date: "2026-09-15" },
    created_at: "2026-08-20T14:20:00Z",
  },
  {
    id: "lead-202",
    source: "catering_enquiry",
    guest_name: "Dr. Sunitha Reddy",
    guest_phone: "94405 66778",
    details: { location: "Medak Road, Siddipet", guest_count: 300, date: "2026-10-02" },
    created_at: "2026-08-20T15:45:00Z",
  },
  {
    id: "lead-203",
    source: "restaurant_order",
    guest_name: "Venkatesh Rao",
    guest_phone: "98491 11223",
    details: { order_number: "AK-20260820-0417", amount: 808.5 },
    created_at: "2026-08-20T18:30:00Z",
  },
  {
    id: "lead-204",
    source: "contact_form",
    guest_name: "Bhadraiah V.",
    guest_phone: "98660 33441",
    details: { subject: "Corporate Lunch Catering Request", message: "Need weekly lunch boxes for 40 executives." },
    created_at: "2026-08-20T11:10:00Z",
  },
  {
    id: "lead-205",
    source: "button_click",
    guest_name: "Anonymous Visitor",
    guest_phone: "90000 00000",
    details: { button: "Hero Book Banquet CTA", page: "/#hero" },
    created_at: "2026-08-20T09:05:00Z",
  },
];

const initialBanquetEnquiries: BanquetEnquiry[] = [
  {
    id: "bq-301",
    guest_name: "Ramesh Goud",
    guest_phone: "98492 88990",
    event_date: "2026-09-15",
    guest_count: 150,
    event_type: "Engagement Ceremony",
    notes: "Requires stage decor and non-veg buffet",
    status: "new",
    created_at: "2026-08-20T14:20:00Z",
  },
  {
    id: "bq-302",
    guest_name: "Vijay Bhaskar",
    guest_phone: "97001 22334",
    event_date: "2026-09-28",
    guest_count: 100,
    event_type: "First Birthday Party",
    notes: "AC Hall 1 preferred",
    status: "contacted",
    created_at: "2026-08-19T16:30:00Z",
  },
];

const initialCateringEnquiries: CateringEnquiry[] = [
  {
    id: "cat-401",
    guest_name: "Dr. Sunitha Reddy",
    guest_phone: "94405 66778",
    event_date: "2026-10-02",
    guest_count: 300,
    location: "Medak Road, Siddipet",
    notes: "Wedding Reception catering with live Biryani counter",
    status: "quoted",
    created_at: "2026-08-20T15:45:00Z",
  },
];

const initialInvoices: Invoice[] = [
  {
    id: "inv-501",
    invoice_number: "AK-INV-FY2026-0001",
    type: "tax",
    order_id: "ord-101",
    banquet_enquiry_id: null,
    catering_enquiry_id: null,
    subtotal: 770,
    gst_rate: 5,
    gst_amount: 38.5,
    total_amount: 808.5,
    pdf_url: "/docs/invoices/AK-INV-FY2026-0001.pdf",
    created_at: "2026-08-20T18:32:00Z",
  },
  {
    id: "inv-502",
    invoice_number: "AK-INV-FY2026-0002",
    type: "tax",
    order_id: "ord-102",
    banquet_enquiry_id: null,
    catering_enquiry_id: null,
    subtotal: 620,
    gst_rate: 5,
    gst_amount: 31,
    total_amount: 651,
    pdf_url: "/docs/invoices/AK-INV-FY2026-0002.pdf",
    created_at: "2026-08-20T19:11:00Z",
  },
  {
    id: "inv-503",
    invoice_number: "AK-INV-FY2026-0003",
    type: "proforma",
    order_id: null,
    banquet_enquiry_id: "bq-301",
    catering_enquiry_id: null,
    subtotal: 45000,
    gst_rate: 18,
    gst_amount: 8100,
    total_amount: 53100,
    pdf_url: "/docs/invoices/AK-INV-FY2026-0003.pdf",
    created_at: "2026-08-20T16:00:00Z",
  },
];

const initialActivityLogs: ActivityLog[] = [
  {
    id: "act-601",
    actor_id: "user-owner-01",
    action: "gst.toggle_updated",
    entity_type: "settings",
    entity_id: "gst",
    metadata: { enabled: true, rate: 5 },
    created_at: "2026-08-20T10:00:00Z",
  },
  {
    id: "act-602",
    actor_id: null,
    action: "order.created",
    entity_type: "order",
    entity_id: "ord-101",
    metadata: { order_number: "AK-20260820-0417", total: 808.5 },
    created_at: "2026-08-20T18:30:00Z",
  },
  {
    id: "act-603",
    actor_id: null,
    action: "payment.captured",
    entity_type: "payment",
    entity_id: "pay-101",
    metadata: { razorpay_payment_id: "pay_Qx12345678", status: "success" },
    created_at: "2026-08-20T18:31:05Z",
  },
  {
    id: "act-604",
    actor_id: "user-staff-01",
    action: "order.status_updated",
    entity_type: "order",
    entity_id: "ord-101",
    metadata: { from: "confirmed", to: "preparing" },
    created_at: "2026-08-20T18:35:00Z",
  },
  {
    id: "act-605",
    actor_id: "user-admin-01",
    action: "menu.item_availability_changed",
    entity_type: "menu_item",
    entity_id: "special-mutton-biryani",
    metadata: { available: true },
    created_at: "2026-08-20T12:00:00Z",
  },
];

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Defaults to logged-out. This store is a client-side role simulator for building
      // the admin UI ahead of real Supabase Auth — it is NOT access control. Do not change
      // this default back to a role; see PROJECT_MEMORY.md's Key Decisions.
      currentRole: null,
      currentUser: null,
      gstEnabled: true,
      gstRate: 5,

      staffProfiles: initialProfiles,
      orders: initialOrders,
      orderItemsMap: initialOrderItemsMap,
      payments: initialPayments,
      leads: initialLeads,
      banquetEnquiries: initialBanquetEnquiries,
      cateringEnquiries: initialCateringEnquiries,
      invoices: initialInvoices,
      activityLogs: initialActivityLogs,
      menuItemsList: initialExtendedMenuItems,
      lastOrderAlert: null,

      setRole: (role) => {
        const user = initialProfiles.find((p) => p.role === role) || null;
        set({ currentRole: role, currentUser: user });
      },

      updateOrderStatus: (orderId, newStatus) => {
        const state = get();
        const existing = state.orders.find((o) => o.id === orderId);
        if (!existing) return;

        const updatedOrders = state.orders.map((o) =>
          o.id === orderId ? { ...o, status: newStatus, updated_at: new Date().toISOString() } : o
        );

        const newLog: ActivityLog = {
          id: `act-${Date.now()}`,
          actor_id: state.currentUser?.id || null,
          action: "order.status_updated",
          entity_type: "order",
          entity_id: orderId,
          metadata: { order_number: existing.order_number, from: existing.status, to: newStatus },
          created_at: new Date().toISOString(),
        };

        set({
          orders: updatedOrders,
          activityLogs: [newLog, ...state.activityLogs],
        });
      },

      addSimulatedOrder: (guestName = "Rajeshwar Rao", guestPhone = "98499 77665") => {
        const state = get();
        const newId = `ord-${Date.now()}`;
        const orderNum = `AK-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
          1000 + Math.random() * 9000
        )}`;

        // Pick 2 random menu items
        const item1 = state.menuItemsList[0];
        const item2 = state.menuItemsList[3];

        const subtotal = item1.price + item2.price;
        const tax = state.gstEnabled ? (subtotal * state.gstRate) / 100 : 0;
        const total = subtotal + tax;

        const newOrder: Order = {
          id: newId,
          order_number: orderNum,
          guest_name: guestName,
          guest_phone: guestPhone,
          status: "pending",
          subtotal,
          tax_amount: tax,
          total_amount: total,
          notes: "Simulated online order (Realtime Feed Test)",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const newOrderItems: OrderItem[] = [
          {
            id: `oi-${newId}-1`,
            order_id: newId,
            menu_item_id: item1.id,
            item_name: item1.name,
            unit_price: item1.price,
            quantity: 1,
            subtotal: item1.price,
          },
          {
            id: `oi-${newId}-2`,
            order_id: newId,
            menu_item_id: item2.id,
            item_name: item2.name,
            unit_price: item2.price,
            quantity: 1,
            subtotal: item2.price,
          },
        ];

        const newPayment: Payment = {
          id: `pay-${Date.now()}`,
          order_id: newId,
          razorpay_order_id: `order_Pz${Math.floor(10000000 + Math.random() * 90000000)}`,
          razorpay_payment_id: `pay_Qx${Math.floor(10000000 + Math.random() * 90000000)}`,
          razorpay_signature: `sig_sim_${Date.now()}`,
          amount: total,
          status: "success",
          raw_response: { method: "upi", vpa: `${guestName.toLowerCase().replace(/\s+/g, "")}@upi` },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const newLead: Lead = {
          id: `lead-${Date.now()}`,
          source: "restaurant_order",
          guest_name: guestName,
          guest_phone: guestPhone,
          details: { order_number: orderNum, amount: total },
          created_at: new Date().toISOString(),
        };

        const newInvoice: Invoice = {
          id: `inv-${Date.now()}`,
          invoice_number: `AK-INV-FY2026-${Math.floor(1000 + Math.random() * 9000)}`,
          type: "tax",
          order_id: newId,
          banquet_enquiry_id: null,
          catering_enquiry_id: null,
          subtotal,
          gst_rate: state.gstRate,
          gst_amount: tax,
          total_amount: total,
          pdf_url: `/docs/invoices/AK-INV-${orderNum}.pdf`,
          created_at: new Date().toISOString(),
        };

        const newLog: ActivityLog = {
          id: `act-${Date.now()}`,
          actor_id: null,
          action: "order.created",
          entity_type: "order",
          entity_id: newId,
          metadata: { order_number: orderNum, total },
          created_at: new Date().toISOString(),
        };

        set({
          orders: [newOrder, ...state.orders],
          orderItemsMap: { ...state.orderItemsMap, [newId]: newOrderItems },
          payments: [newPayment, ...state.payments],
          leads: [newLead, ...state.leads],
          invoices: [newInvoice, ...state.invoices],
          activityLogs: [newLog, ...state.activityLogs],
          lastOrderAlert: `New Order Received! ${orderNum} by ${guestName} (₹${total})`,
        });
      },

      toggleMenuItemAvailability: (itemId) => {
        const state = get();
        const item = state.menuItemsList.find((m) => m.id === itemId);
        if (!item) return;

        const updated = state.menuItemsList.map((m) =>
          m.id === itemId ? { ...m, available: !m.available } : m
        );

        const newLog: ActivityLog = {
          id: `act-${Date.now()}`,
          actor_id: state.currentUser?.id || null,
          action: "menu.item_availability_changed",
          entity_type: "menu_item",
          entity_id: itemId,
          metadata: { name: item.name, available: !item.available },
          created_at: new Date().toISOString(),
        };

        set({
          menuItemsList: updated,
          activityLogs: [newLog, ...state.activityLogs],
        });
      },

      updateMenuItemPrice: (itemId, newPrice) => {
        const state = get();
        const item = state.menuItemsList.find((m) => m.id === itemId);
        if (!item) return;

        const updated = state.menuItemsList.map((m) =>
          m.id === itemId ? { ...m, price: newPrice } : m
        );

        const newLog: ActivityLog = {
          id: `act-${Date.now()}`,
          actor_id: state.currentUser?.id || null,
          action: "menu.price_updated",
          entity_type: "menu_item",
          entity_id: itemId,
          metadata: { name: item.name, oldPrice: item.price, newPrice },
          created_at: new Date().toISOString(),
        };

        set({
          menuItemsList: updated,
          activityLogs: [newLog, ...state.activityLogs],
        });
      },

      addMenuItem: (itemData) => {
        const state = get();
        const newItem: ExtendedMenuItem = {
          ...itemData,
          id: `item-${Date.now()}`,
        };

        const newLog: ActivityLog = {
          id: `act-${Date.now()}`,
          actor_id: state.currentUser?.id || null,
          action: "menu.item_created",
          entity_type: "menu_item",
          entity_id: newItem.id,
          metadata: { name: newItem.name, price: newItem.price },
          created_at: new Date().toISOString(),
        };

        set({
          menuItemsList: [newItem, ...state.menuItemsList],
          activityLogs: [newLog, ...state.activityLogs],
        });
      },

      toggleGst: (enabled) => {
        const state = get();
        const newLog: ActivityLog = {
          id: `act-${Date.now()}`,
          actor_id: state.currentUser?.id || null,
          action: "gst.toggle_updated",
          entity_type: "settings",
          entity_id: "gst",
          metadata: { enabled, rate: state.gstRate },
          created_at: new Date().toISOString(),
        };

        set({
          gstEnabled: enabled,
          activityLogs: [newLog, ...state.activityLogs],
        });
      },

      updateUserRole: (userId, newRole) => {
        const state = get();
        const user = state.staffProfiles.find((u) => u.id === userId);
        if (!user) return;

        const updated = state.staffProfiles.map((u) =>
          u.id === userId ? { ...u, role: newRole, updated_at: new Date().toISOString() } : u
        );

        const newLog: ActivityLog = {
          id: `act-${Date.now()}`,
          actor_id: state.currentUser?.id || null,
          action: "user.role_updated",
          entity_type: "profile",
          entity_id: userId,
          metadata: { user_name: user.full_name, old_role: user.role, new_role: newRole },
          created_at: new Date().toISOString(),
        };

        set({
          staffProfiles: updated,
          activityLogs: [newLog, ...state.activityLogs],
        });
      },

      updateEnquiryStatus: (type, id, status) => {
        const state = get();
        const newLog: ActivityLog = {
          id: `act-${Date.now()}`,
          actor_id: state.currentUser?.id || null,
          action: "enquiry.status_updated",
          entity_type: type === "banquet" ? "banquet_enquiry" : "catering_enquiry",
          entity_id: id,
          metadata: { type, status },
          created_at: new Date().toISOString(),
        };

        if (type === "banquet") {
          const updated = state.banquetEnquiries.map((b) => (b.id === id ? { ...b, status } : b));
          set({ banquetEnquiries: updated, activityLogs: [newLog, ...state.activityLogs] });
        } else {
          const updated = state.cateringEnquiries.map((c) => (c.id === id ? { ...c, status } : c));
          set({ cateringEnquiries: updated, activityLogs: [newLog, ...state.activityLogs] });
        }
      },

      exportLeadsToCsv: () => {
        const state = get();
        const headers = ["Lead ID", "Source", "Guest Name", "Guest Phone", "Details", "Created At"];
        const rows = state.leads.map((l) => [
          l.id,
          l.source,
          `"${l.guest_name}"`,
          `"${l.guest_phone}"`,
          `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`,
          l.created_at,
        ]);
        return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      },

      clearLastOrderAlert: () => set({ lastOrderAlert: null }),
    }),
    {
      name: "akshaya-admin-store-v1",
    }
  )
);
