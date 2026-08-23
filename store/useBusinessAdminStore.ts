import { create } from "zustand";

export type BusinessAdminTab =
  | "dashboard"
  | "orders"
  | "tables"
  | "menu"
  | "customers"
  | "payments"
  | "reports"
  | "staff"
  | "settings";

export type OrderStatus = "Pending" | "Preparing" | "Ready" | "Completed" | "Cancelled";
export type PaymentStatus = "Success" | "Pending" | "Failed";
export type TableStatus = "Available" | "Occupied" | "Billing";
export type StaffRole = "Manager" | "Cashier" | "Kitchen" | "Waiter";

export interface OrderItemLine {
  id: string;
  name: string;
  qty: number;
  price: number;
}

export interface BusinessOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  tableNo: string;
  itemsCount: number;
  items: OrderItemLine[];
  amount: number;
  status: OrderStatus;
  time: string;
}

export interface BusinessPayment {
  id: string;
  orderId: string;
  amount: number;
  method: "UPI" | "Card" | "Cash" | "Wallet";
  status: PaymentStatus;
  time: string;
}

export interface BusinessTable {
  id: string;
  number: string;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  currentAmount?: number;
}

export interface BusinessMenuItem {
  id: string;
  name: string;
  category: "Main Course" | "Starters" | "South Indian" | "Desserts" | "Breads" | "Beverages";
  price: number;
  isAvailable: boolean;
}

export interface BusinessCustomer {
  id: string;
  name: string;
  phone: string;
  ordersCount: number;
  totalSpend: number;
}

export interface BusinessStaffMember {
  id: string;
  name: string;
  role: StaffRole;
  phone: string;
  status: "Active" | "Inactive";
}

export interface BusinessNotification {
  id: string;
  type: "new_order" | "payment_failed" | "order_completed" | "new_customer";
  title: string;
  description: string;
  time: string;
  read: boolean;
  targetTab: BusinessAdminTab;
}

export interface BusinessToast {
  message: string;
  type: "success" | "error" | "info";
  visible: boolean;
}

interface BusinessAdminState {
  // Navigation & UI
  activeTab: BusinessAdminTab;
  activeTabTitle: string;
  searchQuery: string;
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;

  // Store Entities (Single Source of Truth)
  orders: BusinessOrder[];
  payments: BusinessPayment[];
  tables: BusinessTable[];
  menuItems: BusinessMenuItem[];
  customers: BusinessCustomer[];
  staff: BusinessStaffMember[];
  notifications: BusinessNotification[];
  toast: BusinessToast;

  // Settings
  businessInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
    gstin: string;
    serviceTaxPct: number;
    printerIp: string;
  };

  // Actions
  setActiveTab: (tab: BusinessAdminTab) => void;
  setSearchQuery: (query: string) => void;
  toggleSidebarCollapse: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  hideToast: () => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Order Actions
  addOrder: (order: Omit<BusinessOrder, "id" | "orderNumber">) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;

  // Payment Actions
  addPayment: (payment: Omit<BusinessPayment, "id">) => void;
  updatePaymentStatus: (id: string, status: PaymentStatus) => void;

  // Table Actions
  updateTableStatus: (id: string, status: TableStatus) => void;

  // Menu Actions
  addMenuItem: (item: Omit<BusinessMenuItem, "id">) => void;
  toggleMenuItemAvailability: (id: string) => void;
  updateMenuItem: (id: string, updates: Partial<BusinessMenuItem>) => void;

  // Staff Actions
  addStaff: (member: Omit<BusinessStaffMember, "id">) => void;
  toggleStaffStatus: (id: string) => void;

  // Settings Actions
  updateBusinessInfo: (info: Partial<BusinessAdminState["businessInfo"]>) => void;
}

const TAB_TITLES: Record<BusinessAdminTab, string> = {
  dashboard: "Dashboard",
  orders: "Orders Management",
  tables: "Tables Overview",
  menu: "Menu Management",
  customers: "Customer CRM",
  payments: "Payments Ledger",
  reports: "Sales Reports & Analytics",
  staff: "Staff Management",
  settings: "Restaurant Settings",
};

const INITIAL_ORDERS: BusinessOrder[] = [
  {
    id: "ord_1024",
    orderNumber: "#ORD-1024",
    customerName: "Arun Kumar",
    tableNo: "Table 05",
    itemsCount: 4,
    items: [
      { id: "li1", name: "Paneer Butter Masala", qty: 2, price: 220 },
      { id: "li2", name: "Butter Naan", qty: 4, price: 40 },
    ],
    amount: 1290,
    status: "Pending",
    time: "2 min ago",
  },
  {
    id: "ord_1023",
    orderNumber: "#ORD-1023",
    customerName: "Priya Sharma",
    tableNo: "Table 12",
    itemsCount: 6,
    items: [
      { id: "li3", name: "Chicken Biryani", qty: 3, price: 280 },
      { id: "li4", name: "Masala Dosa", qty: 2, price: 120 },
    ],
    amount: 2450,
    status: "Preparing",
    time: "5 min ago",
  },
  {
    id: "ord_1022",
    orderNumber: "#ORD-1022",
    customerName: "Rahul Singh",
    tableNo: "Table 03",
    itemsCount: 3,
    items: [
      { id: "li5", name: "Veg Manchurian", qty: 2, price: 160 },
      { id: "li6", name: "Gulab Jamun", qty: 2, price: 80 },
    ],
    amount: 850,
    status: "Ready",
    time: "8 min ago",
  },
  {
    id: "ord_1021",
    orderNumber: "#ORD-1021",
    customerName: "Sneha Reddy",
    tableNo: "Table 08",
    itemsCount: 5,
    items: [{ id: "li7", name: "Paneer Butter Masala", qty: 3, price: 220 }],
    amount: 1750,
    status: "Pending",
    time: "10 min ago",
  },
  {
    id: "ord_1020",
    orderNumber: "#ORD-1020",
    customerName: "Vikram Patel",
    tableNo: "Table 15",
    itemsCount: 2,
    items: [{ id: "li8", name: "Masala Dosa", qty: 2, price: 120 }],
    amount: 560,
    status: "Completed",
    time: "12 min ago",
  },
];

const INITIAL_PAYMENTS: BusinessPayment[] = [
  { id: "PAY-10024", orderId: "ORD-1024", amount: 1290, method: "UPI", status: "Success", time: "2 min ago" },
  { id: "PAY-10023", orderId: "ORD-1023", amount: 2450, method: "Card", status: "Success", time: "5 min ago" },
  { id: "PAY-10022", orderId: "ORD-1022", amount: 850, method: "Cash", status: "Success", time: "8 min ago" },
  { id: "PAY-10021", orderId: "ORD-1021", amount: 1750, method: "UPI", status: "Failed", time: "12 min ago" },
  { id: "PAY-10020", orderId: "ORD-1020", amount: 560, method: "Wallet", status: "Failed", time: "15 min ago" },
  { id: "PAY-10019", orderId: "ORD-1019", amount: 1250, method: "Card", status: "Failed", time: "30 min ago" },
];

const INITIAL_TABLES: BusinessTable[] = Array.from({ length: 24 }, (_, i) => {
  const num = String(i + 1).padStart(2, "0");
  let status: TableStatus = "Available";
  let currentOrderId: string | undefined;
  let currentAmount: number | undefined;

  if (i === 4) {
    status = "Occupied";
    currentOrderId = "#ORD-1024";
    currentAmount = 1290;
  } else if (i === 11) {
    status = "Occupied";
    currentOrderId = "#ORD-1023";
    currentAmount = 2450;
  } else if (i === 2) {
    status = "Billing";
    currentOrderId = "#ORD-1022";
    currentAmount = 850;
  } else if (i === 7) {
    status = "Billing";
    currentOrderId = "#ORD-1021";
    currentAmount = 1750;
  } else if (i === 14) {
    status = "Occupied";
    currentOrderId = "#ORD-1020";
    currentAmount = 560;
  }

  return {
    id: `tbl_${i + 1}`,
    number: `Table ${num}`,
    capacity: i % 2 === 0 ? 4 : 6,
    status,
    currentOrderId,
    currentAmount,
  };
});

const INITIAL_MENU: BusinessMenuItem[] = [
  { id: "m1", name: "Paneer Butter Masala", category: "Main Course", price: 220, isAvailable: true },
  { id: "m2", name: "Chicken Biryani", category: "Main Course", price: 280, isAvailable: true },
  { id: "m3", name: "Veg Manchurian", category: "Starters", price: 160, isAvailable: true },
  { id: "m4", name: "Masala Dosa", category: "South Indian", price: 120, isAvailable: false },
  { id: "m5", name: "Gulab Jamun", category: "Desserts", price: 80, isAvailable: true },
  { id: "m6", name: "Butter Naan", category: "Breads", price: 40, isAvailable: true },
];

const INITIAL_CUSTOMERS: BusinessCustomer[] = [
  { id: "c1", name: "Arun Kumar", phone: "9876543210", ordersCount: 24, totalSpend: 12450 },
  { id: "c2", name: "Priya Sharma", phone: "9123456789", ordersCount: 18, totalSpend: 8750 },
  { id: "c3", name: "Rahul Singh", phone: "9988776655", ordersCount: 32, totalSpend: 15200 },
  { id: "c4", name: "Sneha Reddy", phone: "9012345678", ordersCount: 12, totalSpend: 6400 },
  { id: "c5", name: "Vikram Patel", phone: "9090909090", ordersCount: 21, totalSpend: 9300 },
];

const INITIAL_STAFF: BusinessStaffMember[] = [
  { id: "s1", name: "Ravi Kumar", role: "Manager", phone: "9876543210", status: "Active" },
  { id: "s2", name: "Suresh Babu", role: "Cashier", phone: "9123456780", status: "Active" },
  { id: "s3", name: "Anita Singh", role: "Kitchen", phone: "9988776600", status: "Active" },
  { id: "s4", name: "Meena Patel", role: "Cashier", phone: "9012345600", status: "Active" },
  { id: "s5", name: "Vikram Rao", role: "Kitchen", phone: "9090909000", status: "Inactive" },
];

const INITIAL_NOTIFICATIONS: BusinessNotification[] = [
  {
    id: "bn1",
    type: "new_order",
    title: "New Order Received",
    description: "Order #ORD-1024 for Table 05 received",
    time: "2 min ago",
    read: false,
    targetTab: "orders",
  },
  {
    id: "bn2",
    type: "payment_failed",
    title: "Payment Failed",
    description: "Payment of ₹1,750 failed for Order #ORD-1021",
    time: "12 min ago",
    read: false,
    targetTab: "payments",
  },
  {
    id: "bn3",
    type: "order_completed",
    title: "Order Completed",
    description: "Order #ORD-1020 has been completed",
    time: "15 min ago",
    read: false,
    targetTab: "orders",
  },
];

export const useBusinessAdminStore = create<BusinessAdminState>((set, get) => ({
  activeTab: "dashboard",
  activeTabTitle: "Dashboard",
  searchQuery: "",
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,

  orders: INITIAL_ORDERS,
  payments: INITIAL_PAYMENTS,
  tables: INITIAL_TABLES,
  menuItems: INITIAL_MENU,
  customers: INITIAL_CUSTOMERS,
  staff: INITIAL_STAFF,
  notifications: INITIAL_NOTIFICATIONS,
  toast: { message: "", type: "info", visible: false },

  businessInfo: {
    name: "Akshaya Restaurant",
    phone: "+91 98765 43210",
    email: "info@akshayarestaurant.in",
    address: "Plot No 123, Hitech City, Hyderabad, Telangana 500081",
    gstin: "36AAAAA0000A1Z5",
    serviceTaxPct: 5,
    printerIp: "192.168.1.100",
  },

  setActiveTab: (tab) =>
    set({
      activeTab: tab,
      activeTabTitle: TAB_TITLES[tab],
    }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleSidebarCollapse: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),

  showToast: (message, type = "success") => {
    set({ toast: { message, type, visible: true } });
    setTimeout(() => {
      set((state) => ({ toast: { ...state.toast, visible: false } }));
    }, 3000);
  },

  hideToast: () => set((state) => ({ toast: { ...state.toast, visible: false } })),

  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  // ORDER ACTIONS
  addOrder: (orderData) => {
    const nextNum = get().orders.length + 1025;
    const newId = `ord_${Date.now()}`;
    const newOrder: BusinessOrder = {
      ...orderData,
      id: newId,
      orderNumber: `#ORD-${nextNum}`,
    };

    set((state) => ({
      orders: [newOrder, ...state.orders],
      notifications: [
        {
          id: `notif_${Date.now()}`,
          type: "new_order",
          title: "New Order Received",
          description: `Order ${newOrder.orderNumber} for ${newOrder.tableNo} (₹${newOrder.amount})`,
          time: "Just now",
          read: false,
          targetTab: "orders",
        },
        ...state.notifications,
      ],
    }));

    get().showToast(`Order ${newOrder.orderNumber} created!`, "success");
  },

  updateOrderStatus: (id, status) => {
    const targetOrder = get().orders.find((o) => o.id === id);
    if (!targetOrder) return;

    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
      notifications:
        status === "Completed"
          ? [
              {
                id: `notif_${Date.now()}`,
                type: "order_completed",
                title: "Order Completed",
                description: `Order ${targetOrder.orderNumber} mark completed`,
                time: "Just now",
                read: false,
                targetTab: "orders",
              },
              ...state.notifications,
            ]
          : state.notifications,
    }));

    get().showToast(`Order ${targetOrder.orderNumber} status updated to ${status}`, "info");
  },

  // PAYMENT ACTIONS
  addPayment: (paymentData) => {
    const newPayment: BusinessPayment = {
      ...paymentData,
      id: `PAY-${Math.floor(10000 + Math.random() * 90000)}`,
    };

    set((state) => ({
      payments: [newPayment, ...state.payments],
      notifications:
        newPayment.status === "Failed"
          ? [
              {
                id: `notif_${Date.now()}`,
                type: "payment_failed",
                title: "Payment Failed",
                description: `Payment of ₹${newPayment.amount} failed for Order #${newPayment.orderId}`,
                time: "Just now",
                read: false,
                targetTab: "payments",
              },
              ...state.notifications,
            ]
          : state.notifications,
    }));

    get().showToast(`Payment ${newPayment.id} recorded!`, newPayment.status === "Failed" ? "error" : "success");
  },

  updatePaymentStatus: (id, status) => {
    set((state) => ({
      payments: state.payments.map((p) => (p.id === id ? { ...p, status } : p)),
    }));

    get().showToast(`Payment ${id} status updated to ${status}`, status === "Failed" ? "error" : "success");
  },

  // TABLE ACTIONS
  updateTableStatus: (id, status) => {
    set((state) => ({
      tables: state.tables.map((t) => (t.id === id ? { ...t, status } : t)),
    }));

    get().showToast(`Table status updated to ${status}`, "info");
  },

  // MENU ACTIONS
  addMenuItem: (itemData) => {
    const newItem: BusinessMenuItem = {
      ...itemData,
      id: `m_${Date.now()}`,
    };

    set((state) => ({
      menuItems: [newItem, ...state.menuItems],
    }));

    get().showToast(`Menu item "${newItem.name}" added!`, "success");
  },

  toggleMenuItemAvailability: (id) => {
    set((state) => ({
      menuItems: state.menuItems.map((m) => (m.id === id ? { ...m, isAvailable: !m.isAvailable } : m)),
    }));

    get().showToast("Menu availability toggled!", "info");
  },

  updateMenuItem: (id, updates) => {
    set((state) => ({
      menuItems: state.menuItems.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));

    get().showToast("Menu item updated!", "success");
  },

  // STAFF ACTIONS
  addStaff: (memberData) => {
    const newStaff: BusinessStaffMember = {
      ...memberData,
      id: `s_${Date.now()}`,
    };

    set((state) => ({
      staff: [newStaff, ...state.staff],
    }));

    get().showToast(`Staff member "${newStaff.name}" added!`, "success");
  },

  toggleStaffStatus: (id) => {
    set((state) => ({
      staff: state.staff.map((s) => (s.id === id ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s)),
    }));

    get().showToast("Staff status updated!", "info");
  },

  updateBusinessInfo: (info) => {
    set((state) => ({
      businessInfo: { ...state.businessInfo, ...info },
    }));

    get().showToast("Restaurant settings saved!", "success");
  },
}));
