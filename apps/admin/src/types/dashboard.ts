export type DashboardWidgetId =
  | "sales"
  | "orders"
  | "average-ticket"
  | "sales-chart"
  | "order-status"
  | "table-occupancy"
  | "popular-items"
  | "recent-orders";

export type DashboardWidgetSize = "small" | "wide";

export interface DashboardWidget {
  id: DashboardWidgetId;
  size: DashboardWidgetSize;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
}

export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayout = {
  widgets: [
    { id: "sales", size: "small" },
    { id: "orders", size: "small" },
    { id: "average-ticket", size: "small" },
    { id: "sales-chart", size: "wide" },
    { id: "order-status", size: "small" },
    { id: "table-occupancy", size: "small" },
    { id: "popular-items", size: "wide" },
    { id: "recent-orders", size: "wide" },
  ],
};

export interface DashboardMetricData {
  salesToday: number;
  salesYesterday: number;
  salesChangePercent: number | null;
  ordersToday: number;
  ordersYesterday: number;
  completedOrdersToday: number;
  averageTicket: number;
  totalTables: number;
  occupiedTables: number;
  occupancyPercent: number;
}

export interface DashboardSalesPoint {
  date: string;
  label: string;
  sales: number;
}

export interface DashboardOrderStatus {
  status: string;
  count: number;
}

export interface DashboardPopularItem {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface DashboardRecentOrder {
  id: string;
  customerName: string;
  tableNumber: number | null;
  origin: string;
  status: string;
  totalAmount: number;
  createdAt: string | null;
}

export interface DashboardSummary {
  generatedAt: string;
  currency: string;
  timezone: string;
  metrics: DashboardMetricData;
  salesSeries: DashboardSalesPoint[];
  orderStatuses: DashboardOrderStatus[];
  popularProducts: DashboardPopularItem[];
  popularCategories: DashboardPopularItem[];
  recentOrders: DashboardRecentOrder[];
}
