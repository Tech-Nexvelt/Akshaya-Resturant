import { create } from "zustand";

export type SuperAdminTab =
  | "dashboard"
  | "businesses"
  | "users"
  | "enquiries"
  | "invoices"
  | "orders"
  | "payments"
  | "webhooks"
  | "activity"
  | "health"
  | "settings";

export type SystemUserRole = "super_admin" | "owner" | "admin" | "staff";
export type NotificationType = "payment_failed" | "new_enquiry" | "webhook_failure" | "new_user";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  targetTab: SuperAdminTab;
}

export interface BusinessItem {
  id: string;
  name: string;
  owner: string;
  email: string;
  status: "Active" | "Inactive";
  revenue: number;
  createdDate: string;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  businessId: string | null;
  businessName: string;
  status: "Active" | "Inactive";
}

export interface EnquiryItem {
  id: string;
  customer: string;
  phone: string;
  email: string;
  eventType: string;
  date: string;
  guests: number;
  status: "New" | "Quoted" | "Confirmed" | "Lost";
}

export interface InvoiceLineItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface InvoiceItem {
  id: string;
  customer: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  location: string;
  guests: number;
  amount: number;
  status: "Draft" | "Sent" | "Paid" | "Locked";
  type: "PI" | "TI";
  date: string;
  items: InvoiceLineItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
}

export interface OrderItem {
  id: string;
  business: string;
  amount: number;
  status: "Pending" | "Completed" | "Cancelled";
  time: string;
}

export interface PaymentItem {
  id: string;
  orderId: string;
  amount: number;
  method: "Card" | "UPI" | "Wallet" | "Net Banking";
  status: "Success" | "Pending" | "Failed";
  time: string;
}

export interface WebhookLogItem {
  id: string;
  type: string;
  status: "DELIVERED" | "FAILED";
  retries: number;
  time: string;
  payload: string;
}

export interface ActivityLogRecord {
  id: string;
  action: string;
  entity: string;
  name: string;
  user: string;
  severity: "Critical" | "Warning" | "Info";
  time: string;
}

export interface ToastState {
  message: string;
  type: "success" | "error" | "info";
  visible: boolean;
}

interface SuperAdminState {
  // Navigation & UI Layout
  activeTab: SuperAdminTab;
  activeTabTitle: string;
  searchQuery: string;
  isMobileSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  userRole: SystemUserRole;

  // Single Source of Truth Data Store
  businesses: BusinessItem[];
  users: UserItem[];
  enquiries: EnquiryItem[];
  invoices: InvoiceItem[];
  orders: OrderItem[];
  payments: PaymentItem[];
  webhooks: WebhookLogItem[];
  activityLogs: ActivityLogRecord[];
  notifications: NotificationItem[];
  toast: ToastState;

  // System Settings State
  platformSettings: {
    platformName: string;
    supportEmail: string;
    contactNumber: string;
    dateFormat: string;
    razorpayKey: string;
    webhookSecret: string;
  };

  // Actions
  setActiveTab: (tab: SuperAdminTab) => void;
  setSearchQuery: (query: string) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setUserRole: (role: SystemUserRole) => void;

  // Notifications & Toasts
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  hideToast: () => void;

  // CRUD & Reactive Logic
  addBusiness: (business: Omit<BusinessItem, "id">) => void;
  updateBusiness: (id: string, updates: Partial<BusinessItem>) => void;
  deleteBusiness: (id: string) => void;

  addUser: (user: Omit<UserItem, "id">) => void;
  updateUserRole: (id: string, role: string) => void;
  deleteUser: (id: string) => void;

  addEnquiry: (enquiry: Omit<EnquiryItem, "id">) => void;
  generatePIFromEnquiry: (enquiryId: string) => void;

  saveInvoice: (invoice: InvoiceItem) => void;
  sendInvoice: (id: string, method: "whatsapp" | "email") => void;
  convertPIToTI: (id: string) => void;

  addOrder: (order: Omit<OrderItem, "id">) => void;
  updateOrderStatus: (id: string, status: "Pending" | "Completed" | "Cancelled") => void;

  addPayment: (payment: Omit<PaymentItem, "id">) => void;
  updatePaymentStatus: (id: string, status: "Success" | "Pending" | "Failed") => void;
  deletePayment: (id: string) => void;

  replayWebhook: (id: string) => void;
  updateSettings: (settings: Partial<SuperAdminState["platformSettings"]>) => void;
}

const TAB_TITLES: Record<SuperAdminTab, string> = {
  dashboard: "Dashboard (Control Center)",
  businesses: "Businesses",
  users: "Users",
  enquiries: "Enquiries",
  invoices: "Invoices (PI / TI)",
  orders: "Orders",
  payments: "Payments",
  webhooks: "Webhooks",
  activity: "Activity Logs",
  health: "System Health",
  settings: "Settings",
};

const INITIAL_BUSINESSES: BusinessItem[] = [
  { id: "b1", name: "The Grand Kitchen", owner: "Ravi Kumar", email: "ravi@grandkitchen.com", status: "Active", revenue: 1245000, createdDate: "12 May 2025" },
  { id: "b2", name: "Akshaya Caterers", owner: "Suresh Babu", email: "suresh@akshayacaterers.com", status: "Active", revenue: 876000, createdDate: "10 May 2025" },
  { id: "b3", name: "Spice Delight", owner: "Anita Singh", email: "anita@spicedelight.com", status: "Active", revenue: 650200, createdDate: "08 May 2025" },
  { id: "b4", name: "Royal Treats", owner: "Vikram Iyer", email: "vikram@royaltreats.com", status: "Active", revenue: 490150, createdDate: "05 May 2025" },
  { id: "b5", name: "Banquet Kings", owner: "Meena Patel", email: "meena@banquetkings.com", status: "Inactive", revenue: 0, createdDate: "01 May 2025" },
];

const INITIAL_USERS: UserItem[] = [
  { id: "u1", name: "Ravi Kumar", email: "ravi@grandkitchen.com", role: "Owner", businessId: "b1", businessName: "The Grand Kitchen", status: "Active" },
  { id: "u2", name: "Suresh Babu", email: "suresh@akshayacaterers.com", role: "Owner", businessId: "b2", businessName: "Akshaya Caterers", status: "Active" },
  { id: "u3", name: "Admin User", email: "admin@spicedelight.com", role: "Admin", businessId: "b3", businessName: "Spice Delight", status: "Active" },
  { id: "u4", name: "John Doe", email: "john@royaltreats.com", role: "Staff", businessId: "b4", businessName: "Royal Treats", status: "Active" },
  { id: "u5", name: "Priya Sharma", email: "priya@banquetkings.com", role: "Staff", businessId: "b5", businessName: "Banquet Kings", status: "Inactive" },
];

const INITIAL_ENQUIRIES: EnquiryItem[] = [
  { id: "ENQ-00128", customer: "Ravi Kumar", phone: "+91 98765 43210", email: "ravi@gmail.com", eventType: "Wedding", date: "24 May 2025", guests: 250, status: "New" },
  { id: "ENQ-00127", customer: "Priya Sharma", phone: "+91 98765 43211", email: "priya@gmail.com", eventType: "Engagement", date: "28 May 2025", guests: 150, status: "Quoted" },
  { id: "ENQ-00126", customer: "Arun Prakash", phone: "+91 98765 43212", email: "arun@gmail.com", eventType: "Birthday Party", date: "02 Jun 2025", guests: 80, status: "New" },
  { id: "ENQ-00125", customer: "Meena Iyer", phone: "+91 98765 43213", email: "meena@gmail.com", eventType: "Corporate Event", date: "10 Jun 2025", guests: 200, status: "Quoted" },
  { id: "ENQ-00124", customer: "Vikram Singh", phone: "+91 98765 43214", email: "vikram@gmail.com", eventType: "Wedding", date: "15 Jun 2025", guests: 300, status: "Confirmed" },
];

const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: "PI-2025-0045",
    customer: "Ravi Kumar",
    phone: "+91 98765.43210",
    email: "ravi.kumar@gmail.com",
    eventType: "Wedding",
    eventDate: "24 May 2025",
    location: "Akshaya Grand Hall, Chennai",
    guests: 250,
    amount: 400757.5,
    status: "Draft",
    type: "PI",
    date: "24 May 2025",
    items: [
      { id: "i1", name: "Wedding Package - Premium", qty: 1, price: 150000, total: 150000 },
      { id: "i2", name: "Additional Food (Per Plate)", qty: 250, price: 550, total: 137500 },
      { id: "i3", name: "Venue Decoration", qty: 1, price: 45000, total: 45000 },
      { id: "i4", name: "Sound & Lighting", qty: 1, price: 25000, total: 25000 },
    ],
    subtotal: 357500,
    cgst: 32175,
    sgst: 32175,
  },
  {
    id: "TI-2025-00045",
    customer: "Ravi Kumar",
    phone: "+91 98765.43210",
    email: "ravi.kumar@gmail.com",
    eventType: "Wedding",
    eventDate: "24 May 2025",
    location: "Akshaya Grand Hall, Chennai",
    guests: 250,
    amount: 400757.5,
    status: "Locked",
    type: "TI",
    date: "24 May 2025",
    items: [
      { id: "i1", name: "Catering Services", qty: 1, price: 339625, total: 339625 },
    ],
    subtotal: 339625,
    cgst: 30566.25,
    sgst: 30566.25,
  },
];

const INITIAL_ORDERS: OrderItem[] = [
  { id: "ORD-78910", business: "The Grand Kitchen", amount: 2450, status: "Pending", time: "24 May 2025 18:42" },
  { id: "ORD-78909", business: "Akshaya Caterers", amount: 12750, status: "Completed", time: "24 May 2025 18:15" },
  { id: "ORD-78908", business: "Spice Delight", amount: 850, status: "Completed", time: "24 May 2025 17:50" },
  { id: "ORD-78907", business: "Royal Treats", amount: 4120, status: "Cancelled", time: "24 May 2025 17:10" },
  { id: "ORD-78906", business: "Banquet Kings", amount: 18900, status: "Completed", time: "24 May 2025 16:30" },
];

const INITIAL_PAYMENTS: PaymentItem[] = [
  { id: "PAY-981241", orderId: "ORD-78910", amount: 2450, method: "Card", status: "Pending", time: "24 May 2025 18:42" },
  { id: "PAY-981240", orderId: "ORD-78909", amount: 12750, method: "UPI", status: "Success", time: "24 May 2025 18:15" },
  { id: "PAY-981239", orderId: "ORD-78908", amount: 850, method: "Wallet", status: "Success", time: "24 May 2025 17:50" },
  { id: "PAY-981238", orderId: "ORD-78907", amount: 4120, method: "Net Banking", status: "Failed", time: "24 May 2025 17:10" },
  { id: "PAY-981237", orderId: "ORD-78906", amount: 18900, method: "UPI", status: "Success", time: "24 May 2025 16:30" },
];

const INITIAL_WEBHOOKS: WebhookLogItem[] = [
  { id: "1", type: "payment.captured", status: "DELIVERED", retries: 0, time: "24 May 2025 18:42:10", payload: '{"id":"pay_981240","event":"payment.captured","amount":12750,"status":"captured"}' },
  { id: "2", type: "payment.failed", status: "FAILED", retries: 3, time: "24 May 2025 18:25:44", payload: '{"id":"pay_981238","event":"payment.failed","amount":4120,"error":"insufficient_funds"}' },
  { id: "3", type: "order.paid", status: "DELIVERED", retries: 0, time: "24 May 2025 18:15:02", payload: '{"id":"ord_78909","event":"order.paid","amount":12750}' },
  { id: "4", type: "invoice.created", status: "DELIVERED", retries: 0, time: "24 May 2025 17:50:33", payload: '{"id":"pi_0045","event":"invoice.created","amount":400757}' },
  { id: "5", type: "payment.authorized", status: "DELIVERED", retries: 0, time: "24 May 2025 17:10:19", payload: '{"id":"pay_981237","event":"payment.authorized","amount":18900}' },
];

const INITIAL_ACTIVITY: ActivityLogRecord[] = [
  { id: "a1", action: "Payment Failed", entity: "Payment", name: "PAY-981238", user: "Razorpay", severity: "Critical", time: "2 min ago" },
  { id: "a2", action: "Invoice Created", entity: "Invoice", name: "PI-2025-0045", user: "Admin", severity: "Info", time: "15 min ago" },
  { id: "a3", action: "Business Created", entity: "Business", name: "The Grand Kitchen", user: "Super Admin", severity: "Info", time: "25 min ago" },
  { id: "a4", action: "User Role Updated", entity: "User", name: "john.doe@example.com", user: "Super Admin", severity: "Warning", time: "35 min ago" },
  { id: "a5", action: "Webhook Failed", entity: "Webhook", name: "payment.failed", user: "System", severity: "Warning", time: "1 hour ago" },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "payment_failed",
    title: "Failed Payment Alert",
    description: "Razorpay transaction PAY-981238 of ₹4,120 failed",
    time: "2 min ago",
    read: false,
    targetTab: "payments",
  },
  {
    id: "notif-2",
    type: "new_enquiry",
    title: "New Event Enquiry",
    description: "Ravi Kumar requested quote for 250 guests",
    time: "15 min ago",
    read: false,
    targetTab: "enquiries",
  },
  {
    id: "notif-3",
    type: "webhook_failure",
    title: "Webhook Delivery Error",
    description: "Endpoint invoice.paid failed 3 retries",
    time: "42 min ago",
    read: false,
    targetTab: "webhooks",
  },
];

export const useSuperAdminStore = create<SuperAdminState>((set, get) => ({
  activeTab: "dashboard",
  activeTabTitle: "Dashboard (Control Center)",
  searchQuery: "",
  isMobileSidebarOpen: false,
  isSidebarCollapsed: false,
  userRole: "super_admin",

  businesses: INITIAL_BUSINESSES,
  users: INITIAL_USERS,
  enquiries: INITIAL_ENQUIRIES,
  invoices: INITIAL_INVOICES,
  orders: INITIAL_ORDERS,
  payments: INITIAL_PAYMENTS,
  webhooks: INITIAL_WEBHOOKS,
  activityLogs: INITIAL_ACTIVITY,
  notifications: INITIAL_NOTIFICATIONS,

  toast: { message: "", type: "info", visible: false },

  platformSettings: {
    platformName: "Akshaya Platform",
    supportEmail: "support@akshaya.com",
    contactNumber: "+91 98765 43210",
    dateFormat: "DD/MM/YYYY",
    razorpayKey: "rzp_live_xxxxxxxxxxxx",
    webhookSecret: "whsec_xxxxxxxxxxxx",
  },

  setActiveTab: (tab) =>
    set({
      activeTab: tab,
      activeTabTitle: TAB_TITLES[tab],
    }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
  toggleSidebarCollapse: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  setUserRole: (role) => set({ userRole: role }),

  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  showToast: (message, type = "success") => {
    set({ toast: { message, type, visible: true } });
    setTimeout(() => {
      set((state) => ({ toast: { ...state.toast, visible: false } }));
    }, 3000);
  },

  hideToast: () => set((state) => ({ toast: { ...state.toast, visible: false } })),

  // 1. BUSINESS CRUD
  addBusiness: (businessData) => {
    const newId = `b_${Date.now()}`;
    const newBusiness: BusinessItem = {
      ...businessData,
      id: newId,
    };

    set((state) => ({
      businesses: [newBusiness, ...state.businesses],
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          action: "Business Created",
          entity: "Business",
          name: newBusiness.name,
          user: "Super Admin",
          severity: "Info",
          time: "Just now",
        },
        ...state.activityLogs,
      ],
    }));

    get().showToast(`Business "${newBusiness.name}" created successfully!`, "success");
  },

  updateBusiness: (id, updates) => {
    set((state) => ({
      businesses: state.businesses.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      users: state.users.map((u) => (u.businessId === id && updates.name ? { ...u, businessName: updates.name } : u)),
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          action: "Business Updated",
          entity: "Business",
          name: updates.name || "Business Record",
          user: "Super Admin",
          severity: "Info",
          time: "Just now",
        },
        ...state.activityLogs,
      ],
    }));

    get().showToast("Business record updated!", "info");
  },

  deleteBusiness: (id) => {
    const target = get().businesses.find((b) => b.id === id);
    const targetName = target ? target.name : "Business";

    set((state) => ({
      businesses: state.businesses.filter((b) => b.id !== id),
      users: state.users.map((u) => (u.businessId === id ? { ...u, businessId: null, businessName: "Unassigned" } : u)),
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          action: "Business Deleted",
          entity: "Business",
          name: targetName,
          user: "Super Admin",
          severity: "Warning",
          time: "Just now",
        },
        ...state.activityLogs,
      ],
    }));

    get().showToast(`Business "${targetName}" removed globally. Users reassigned.`, "error");
  },

  // 2. USER CRUD
  addUser: (userData) => {
    const newUser: UserItem = {
      ...userData,
      id: `u_${Date.now()}`,
    };

    set((state) => ({
      users: [newUser, ...state.users],
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          action: "User Created",
          entity: "User",
          name: newUser.email,
          user: "Super Admin",
          severity: "Info",
          time: "Just now",
        },
        ...state.activityLogs,
      ],
    }));

    get().showToast(`User ${newUser.name} created!`, "success");
  },

  updateUserRole: (id, role) => {
    const userObj = get().users.find((u) => u.id === id);
    const userName = userObj ? userObj.email : "User";

    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, role } : u)),
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          action: "User Role Updated",
          entity: "User",
          name: userName,
          user: "Super Admin",
          severity: "Warning",
          time: "Just now",
        },
        ...state.activityLogs,
      ],
    }));

    get().showToast(`Role updated to "${role}" for ${userName}`, "info");
  },

  deleteUser: (id) => {
    const target = get().users.find((u) => u.id === id);
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          action: "User Removed",
          entity: "User",
          name: target ? target.email : "User",
          user: "Super Admin",
          severity: "Warning",
          time: "Just now",
        },
        ...state.activityLogs,
      ],
    }));

    get().showToast("User deleted permanently", "error");
  },

  // 3. ENQUIRY & CONVERSION TO PI
  addEnquiry: (enquiryData) => {
    const newEnquiry: EnquiryItem = {
      ...enquiryData,
      id: `ENQ-${Math.floor(10000 + Math.random() * 90000)}`,
    };

    set((state) => ({
      enquiries: [newEnquiry, ...state.enquiries],
      notifications: [
        {
          id: `notif_${Date.now()}`,
          type: "new_enquiry",
          title: "New Enquiry Received",
          description: `${newEnquiry.customer} booked for ${newEnquiry.guests} guests`,
          time: "Just now",
          read: false,
          targetTab: "enquiries",
        },
        ...state.notifications,
      ],
    }));

    get().showToast(`Enquiry ${newEnquiry.id} created!`, "success");
  },

  generatePIFromEnquiry: (enquiryId) => {
    const enq = get().enquiries.find((e) => e.id === enquiryId);
    if (!enq) return;

    // Create PI Invoice
    const newPI: InvoiceItem = {
      id: `PI-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: enq.customer,
      phone: enq.phone || "+91 98765 43210",
      email: enq.email || "customer@example.com",
      eventType: enq.eventType,
      eventDate: enq.date,
      location: "Akshaya Banquet Hall",
      guests: enq.guests,
      amount: enq.guests * 850 + 25000,
      status: "Draft",
      type: "PI",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      items: [
        { id: "pi_1", name: `${enq.eventType} Package (${enq.guests} Guests)`, qty: enq.guests, price: 850, total: enq.guests * 850 },
        { id: "pi_2", name: "Hall Rental & Decoration", qty: 1, price: 25000, total: 25000 },
      ],
      subtotal: enq.guests * 850 + 25000,
      cgst: (enq.guests * 850 + 25000) * 0.09,
      sgst: (enq.guests * 850 + 25000) * 0.09,
    };

    set((state) => ({
      enquiries: state.enquiries.map((e) => (e.id === enquiryId ? { ...e, status: "Quoted" } : e)),
      invoices: [newPI, ...state.invoices],
      activeTab: "invoices",
      activeTabTitle: "Invoices (PI / TI)",
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          action: "Invoice Created",
          entity: "Invoice",
          name: newPI.id,
          user: "Super Admin",
          severity: "Info",
          time: "Just now",
        },
        ...state.activityLogs,
      ],
    }));

    get().showToast(`Proforma Invoice ${newPI.id} created from Enquiry ${enquiryId}!`, "success");
  },

  // 4. INVOICES (PI / TI)
  saveInvoice: (invoice) => {
    set((state) => {
      const exists = state.invoices.some((i) => i.id === invoice.id);
      const updatedInvoices = exists
        ? state.invoices.map((i) => (i.id === invoice.id ? invoice : i))
        : [invoice, ...state.invoices];
      return { invoices: updatedInvoices };
    });

    get().showToast(`Invoice ${invoice.id} saved!`, "success");
  },

  sendInvoice: (id, method) => {
    set((state) => ({
      invoices: state.invoices.map((i) => (i.id === id ? { ...i, status: "Sent" } : i)),
    }));

    get().showToast(`Invoice ${id} sent via ${method.toUpperCase()}!`, "success");
  },

  convertPIToTI: (id) => {
    const pi = get().invoices.find((i) => i.id === id);
    if (!pi) return;

    const tiId = `TI-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTI: InvoiceItem = {
      ...pi,
      id: tiId,
      type: "TI",
      status: "Locked",
    };

    // Create payment entry automatically
    const newPayment: PaymentItem = {
      id: `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
      orderId: `ORD-${Math.floor(70000 + Math.random() * 9000)}`,
      amount: newTI.amount,
      method: "UPI",
      status: "Success",
      time: "Just now",
    };

    set((state) => ({
      invoices: [newTI, ...state.invoices.map((i) => (i.id === id ? { ...i, status: "Paid" as const } : i))],
      payments: [newPayment, ...state.payments],
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          action: "Tax Invoice Locked",
          entity: "Invoice",
          name: tiId,
          user: "Super Admin",
          severity: "Info",
          time: "Just now",
        },
        ...state.activityLogs,
      ],
    }));

    get().showToast(`Converted ${id} -> Tax Invoice ${tiId} & GST Locked!`, "success");
  },

  // 5. ORDERS & PAYMENTS
  addOrder: (orderData) => {
    const newOrder: OrderItem = {
      ...orderData,
      id: `ORD-${Math.floor(70000 + Math.random() * 9000)}`,
    };

    set((state) => ({
      orders: [newOrder, ...state.orders],
    }));

    get().showToast(`Order ${newOrder.id} created!`, "success");
  },

  updateOrderStatus: (id, status) => {
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    }));

    get().showToast(`Order ${id} status updated to ${status}`, "info");
  },

  // 6. PAYMENTS REACTIVITY & CRUD
  addPayment: (paymentData) => {
    const newPayment: PaymentItem = {
      ...paymentData,
      id: `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    set((state) => ({
      payments: [newPayment, ...state.payments],
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          action: "Payment Created",
          entity: "Payment",
          name: newPayment.id,
          user: "Super Admin",
          severity: newPayment.status === "Failed" ? "Critical" : "Info",
          time: "Just now",
        },
        ...state.activityLogs,
      ],
    }));

    get().showToast(`Payment ${newPayment.id} recorded!`, "success");
  },

  updatePaymentStatus: (id, status) => {
    const prevPayment = get().payments.find((p) => p.id === id);
    if (!prevPayment) return;

    set((state) => ({
      payments: state.payments.map((p) => (p.id === id ? { ...p, status } : p)),
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          action: "Payment Status Updated",
          entity: "Payment",
          name: id,
          user: "Super Admin",
          severity: status === "Failed" ? "Critical" : "Info",
          time: "Just now",
        },
        ...state.activityLogs,
      ],
    }));

    get().showToast(`Payment ${id} status updated to "${status}"`, status === "Failed" ? "error" : "success");
  },

  deletePayment: (id) => {
    set((state) => ({
      payments: state.payments.filter((p) => p.id !== id),
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          action: "Payment Removed",
          entity: "Payment",
          name: id,
          user: "Super Admin",
          severity: "Warning",
          time: "Just now",
        },
        ...state.activityLogs,
      ],
    }));

    get().showToast(`Payment ${id} removed`, "info");
  },

  // 6. WEBHOOKS REPLAY
  replayWebhook: (id) => {
    set((state) => ({
      webhooks: state.webhooks.map((w) =>
        w.id === id ? { ...w, status: "DELIVERED", retries: w.retries + 1 } : w
      ),
      activityLogs: [
        {
          id: `act_${Date.now()}`,
          action: "Webhook Replayed",
          entity: "Webhook",
          name: `evt_${id}`,
          user: "Super Admin",
          severity: "Info",
          time: "Just now",
        },
        ...state.activityLogs,
      ],
    }));

    get().showToast("Webhook replayed successfully! Status: 200 OK", "success");
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      platformSettings: { ...state.platformSettings, ...newSettings },
    }));

    get().showToast("Platform global settings updated!", "success");
  },
}));
