import { Router, type Request, type Response } from "express";
import { supabaseAdmin } from "@food360/database";
import { hasPermission } from "@food360/types";

export const dashboardRouter: Router = Router();

const ACTIVE_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "READY",
  "SERVED",
] as const;

const DEFAULT_LAYOUT = {
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
} as const;

const ALLOWED_WIDGET_IDS = new Set(
  DEFAULT_LAYOUT.widgets.map((widget) => widget.id),
);

type WidgetId = (typeof DEFAULT_LAYOUT.widgets)[number]["id"];
type WidgetSize = "small" | "wide";

interface DashboardWidget {
  id: WidgetId;
  size: WidgetSize;
}

interface DashboardLayout {
  widgets: DashboardWidget[];
}

interface DbOrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number | string;
}

interface DbOrder {
  id: string;
  customer_id: string | null;
  table_id: string | null;
  origin: string;
  status: string | null;
  total_amount: number | string;
  created_at: string | null;
  order_items?: DbOrderItem[] | null;
}

function normalizedStatus(status: string | null | undefined) {
  return (status ?? "").trim().toUpperCase();
}

function dateKey(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const part = (type: string) =>
    parts.find((value) => value.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function addDays(key: string, days: number): string {
  const [year, month, day] = key.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

function safeTimezone(value: string | null | undefined): string {
  if (!value) return "UTC";

  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return value;
  } catch {
    return "UTC";
  }
}

function toNumber(value: number | string | null | undefined): number {
  const result = Number(value ?? 0);
  return Number.isFinite(result) ? result : 0;
}

function getOrderDateKey(order: DbOrder, timezone: string): string | null {
  if (!order.created_at) return null;

  const date = new Date(order.created_at);

  if (Number.isNaN(date.getTime())) return null;

  return dateKey(date, timezone);
}

function responseError(res: Response, status: number, error: string) {
  return res.status(status).json({
    success: false,
    error,
  });
}

async function verifyDashboardAccess(
  req: Request,
  res: Response,
): Promise<{ restaurantId: string; userId: string } | null> {
  const restaurantId = req.restaurantId;

  if (!restaurantId) {
    responseError(res, 401, "Restaurant not found in authenticated session");
    return null;
  }

  if (!hasPermission(req.userRole, "dashboard.view")) {
    responseError(res, 403, "You do not have permission to view the dashboard");
    return null;
  }

  try {
    const userId = req.user.id;
    const { data: membership, error } = await supabaseAdmin
      .from("restaurant_members")
      .select("user_id")
      .eq("user_id", userId)
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;

    if (!membership) {
      responseError(
        res,
        403,
        "User is not an active member of this restaurant",
      );
      return null;
    }

    return { restaurantId, userId };
  } catch (error: unknown) {
    console.error("Error verificando acceso al dashboard:", error);
    responseError(res, 500, "Unable to verify dashboard access");
    return null;
  }
}

/**
 * GET /api/v1/dashboard/summary
 *
 * Métricas del negocio.
 * Las ventas y las listas de productos populares se calculan
 * exclusivamente con pedidos COMPLETED.
 */
dashboardRouter.get("/summary", async (req: Request, res: Response) => {
  const access = await verifyDashboardAccess(req, res);

  if (!access) return;

  const { restaurantId } = access;

  try {
    // orders has created_at but no completed_at, so completed-sales periods
    // consistently use the order creation date as their temporal basis.
    const queryStart = new Date(
      Date.now() - 36 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const [
      restaurantResult,
      ordersResult,
      activeOrdersResult,
      recentOrdersResult,
      tablesResult,
      productsResult,
      categoriesResult,
    ] = await Promise.all([
      supabaseAdmin
        .from("restaurants")
        .select("currency, timezone")
        .eq("id", restaurantId)
        .maybeSingle(),

      supabaseAdmin
        .from("orders")
        .select(
          `
          id,
          customer_id,
          table_id,
          origin,
          status,
          total_amount,
          created_at,
          order_items (
            id,
            product_id,
            product_name,
            quantity,
            unit_price
          )
        `,
        )
        .eq("restaurant_id", restaurantId)
        .gte("created_at", queryStart)
        .order("created_at", { ascending: false }),

      supabaseAdmin
        .from("orders")
        .select("id, table_id, status")
        .eq("restaurant_id", restaurantId)
        .in("status", [...ACTIVE_STATUSES]),

      supabaseAdmin
        .from("orders")
        .select(
          "id, customer_id, table_id, origin, status, total_amount, created_at",
        )
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(8),

      supabaseAdmin
        .from("tables")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId),

      supabaseAdmin
        .from("products")
        .select("id, name, category_id")
        .eq("restaurant_id", restaurantId),

      supabaseAdmin
        .from("categories")
        .select("id, name")
        .eq("restaurant_id", restaurantId),
    ]);

    const queryErrors = [
      restaurantResult.error,
      ordersResult.error,
      activeOrdersResult.error,
      recentOrdersResult.error,
      tablesResult.error,
      productsResult.error,
      categoriesResult.error,
    ];

    const failedQuery = queryErrors.find(Boolean);

    if (failedQuery) throw failedQuery;

    const timezone = safeTimezone(restaurantResult.data?.timezone);
    const currency = restaurantResult.data?.currency || "EUR";

    const orders = (ordersResult.data ?? []) as unknown as DbOrder[];
    const recentOrders = (recentOrdersResult.data ??
      []) as unknown as DbOrder[];

    const today = dateKey(new Date(), timezone);
    const yesterday = addDays(today, -1);
    const thirtyDaysAgo = addDays(today, -29);
    const chartDays = Array.from({ length: 7 }, (_, index) =>
      addDays(today, index - 6),
    );

    const salesByDay = new Map<string, number>(
      chartDays.map((day) => [day, 0]),
    );

    const statusCounts = new Map<string, number>();

    let salesToday = 0;
    let salesYesterday = 0;
    let ordersToday = 0;
    let ordersYesterday = 0;
    let completedOrdersToday = 0;

    const productMap = new Map(
      (productsResult.data ?? []).map((product) => [
        product.id,
        {
          name: product.name,
          categoryId: product.category_id,
        },
      ]),
    );

    const categoryMap = new Map(
      (categoriesResult.data ?? []).map((category) => [
        category.id,
        category.name,
      ]),
    );

    const popularProductsMap = new Map<
      string,
      { id: string; name: string; quantity: number; revenue: number }
    >();

    const popularCategoriesMap = new Map<
      string,
      { id: string; name: string; quantity: number; revenue: number }
    >();

    for (const order of orders) {
      const status = normalizedStatus(order.status);
      const orderDate = getOrderDateKey(order, timezone);

      if (!orderDate) continue;

      const isCompleted = status === "COMPLETED";
      const orderAmount = toNumber(order.total_amount);

      if (orderDate === today) {
        ordersToday += 1;

        if (isCompleted) {
          salesToday += orderAmount;
          completedOrdersToday += 1;
        }
      }

      if (orderDate === yesterday) {
        ordersYesterday += 1;

        if (isCompleted) {
          salesYesterday += orderAmount;
        }
      }

      if (orderDate >= thirtyDaysAgo && status) {
        statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
      }

      if (isCompleted && salesByDay.has(orderDate)) {
        salesByDay.set(
          orderDate,
          (salesByDay.get(orderDate) ?? 0) + orderAmount,
        );
      }

      if (!isCompleted || orderDate < thirtyDaysAgo || orderDate > today) {
        continue;
      }

      for (const item of order.order_items ?? []) {
        const quantity = toNumber(item.quantity);
        const unitPrice = toNumber(item.unit_price);
        const revenue = quantity * unitPrice;
        const productKey = item.product_id ?? `deleted:${item.product_name}`;

        const product = popularProductsMap.get(productKey) ?? {
          id: productKey,
          name:
            (item.product_id
              ? productMap.get(item.product_id)?.name
              : undefined) ??
            item.product_name ??
            "Producto eliminado",
          quantity: 0,
          revenue: 0,
        };

        product.quantity += quantity;
        product.revenue += revenue;

        popularProductsMap.set(productKey, product);

        const categoryId = item.product_id
          ? productMap.get(item.product_id)?.categoryId
          : null;

        if (categoryId) {
          const category = popularCategoriesMap.get(categoryId) ?? {
            id: categoryId,
            name: categoryMap.get(categoryId) ?? "Categoría",
            quantity: 0,
            revenue: 0,
          };

          category.quantity += quantity;
          category.revenue += revenue;

          popularCategoriesMap.set(categoryId, category);
        }
      }
    }

    const occupiedTableIds = new Set(
      (activeOrdersResult.data ?? [])
        .map((order) => order.table_id)
        .filter((id): id is string => Boolean(id)),
    );

    const totalTables = tablesResult.count ?? 0;
    const occupiedTables = occupiedTableIds.size;

    const customerIds = Array.from(
      new Set(
        recentOrders
          .map((order) => order.customer_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const tableIds = Array.from(
      new Set(
        recentOrders
          .map((order) => order.table_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const [customersResult, recentTablesResult] = await Promise.all([
      customerIds.length
        ? supabaseAdmin
            .from("customers")
            .select("id, full_name")
            .eq("restaurant_id", restaurantId)
            .in("id", customerIds)
        : Promise.resolve({ data: [], error: null }),

      tableIds.length
        ? supabaseAdmin
            .from("tables")
            .select("id, table_number")
            .eq("restaurant_id", restaurantId)
            .in("id", tableIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (customersResult.error) throw customersResult.error;
    if (recentTablesResult.error) throw recentTablesResult.error;

    const customerMap = new Map(
      (customersResult.data ?? []).map((customer) => [
        customer.id,
        customer.full_name,
      ]),
    );

    const recentTableMap = new Map(
      (recentTablesResult.data ?? []).map((table) => [
        table.id,
        table.table_number,
      ]),
    );

    const changePercent =
      salesYesterday > 0
        ? ((salesToday - salesYesterday) / salesYesterday) * 100
        : null;

    return res.json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        currency,
        timezone,

        metrics: {
          salesToday,
          salesYesterday,
          salesChangePercent: changePercent,
          ordersToday,
          ordersYesterday,
          completedOrdersToday,
          averageTicket:
            completedOrdersToday > 0 ? salesToday / completedOrdersToday : 0,
          totalTables,
          occupiedTables,
          occupancyPercent:
            totalTables > 0 ? (occupiedTables / totalTables) * 100 : 0,
        },

        salesSeries: chartDays.map((day) => ({
          date: day,
          label: new Intl.DateTimeFormat("es", {
            timeZone: "UTC",
            weekday: "short",
          })
            .format(new Date(`${day}T12:00:00Z`))
            .replace(".", ""),
          sales: salesByDay.get(day) ?? 0,
        })),

        orderStatuses: Array.from(statusCounts.entries()).map(([status, count]) => ({
          status,
          count,
        })),

        popularProducts: Array.from(popularProductsMap.values())
          .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
          .slice(0, 5),

        popularCategories: Array.from(popularCategoriesMap.values())
          .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
          .slice(0, 5),

        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          customerName: order.customer_id
            ? (customerMap.get(order.customer_id) ?? "Cliente")
            : "Cliente",
          tableNumber: order.table_id
            ? (recentTableMap.get(order.table_id) ?? null)
            : null,
          origin: order.origin,
          status: normalizedStatus(order.status),
          totalAmount: toNumber(order.total_amount),
          createdAt: order.created_at,
        })),
      },
    });
  } catch (error: unknown) {
    console.error("Error obteniendo las métricas del dashboard:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to retrieve dashboard metrics",
    });
  }
});

/**
 * GET /api/v1/dashboard/preferences
 * Cargar la disposición del dashboard del usuario.
 */
dashboardRouter.get("/preferences", async (req: Request, res: Response) => {
  const access = await verifyDashboardAccess(req, res);

  if (!access) return;

  try {
    const { data, error } = await supabaseAdmin
      .from("dashboard_preferences")
      .select("layout, updated_at")
      .eq("user_id", access.userId)
      .eq("restaurant_id", access.restaurantId)
      .maybeSingle();

    if (error) throw error;

    return res.json({
      success: true,
      data: {
        layout: data?.layout ?? DEFAULT_LAYOUT,
        updatedAt: data?.updated_at ?? null,
      },
    });
  } catch (error: unknown) {
    console.error("Error obteniendo las preferencias del dashboard:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to retrieve dashboard preferences",
    });
  }
});

/**
 * PUT /api/v1/dashboard/preferences
 * Guardar los widgets visibles, su orden y tamaño.
 */
dashboardRouter.put("/preferences", async (req: Request, res: Response) => {
  const access = await verifyDashboardAccess(req, res);

  if (!access) return;

  const layout = (req.body as { layout?: unknown } | undefined)?.layout;

  if (
    !layout ||
    typeof layout !== "object" ||
    Array.isArray(layout) ||
    Object.keys(layout).some((key) => key !== "widgets") ||
    !("widgets" in layout) ||
    !Array.isArray((layout as { widgets?: unknown }).widgets)
  ) {
    return responseError(res, 400, "A valid layout with widgets is required");
  }

  const widgets = (layout as { widgets: unknown[] }).widgets;

  if (widgets.length > DEFAULT_LAYOUT.widgets.length) {
    return responseError(res, 400, "Too many dashboard widgets");
  }

  const seen = new Set<string>();
  const normalizedWidgets: DashboardWidget[] = [];

  for (const rawWidget of widgets) {
    if (!rawWidget || typeof rawWidget !== "object") {
      return responseError(res, 400, "Invalid dashboard widget");
    }

    const widget = rawWidget as { id?: unknown; size?: unknown };

    if (Object.keys(rawWidget).some((key) => key !== "id" && key !== "size")) {
      return responseError(res, 400, "Unexpected dashboard widget properties");
    }

    if (
      typeof widget.id !== "string" ||
      !ALLOWED_WIDGET_IDS.has(widget.id as WidgetId)
    ) {
      return responseError(res, 400, "Unsupported dashboard widget");
    }

    if (seen.has(widget.id)) {
      return responseError(res, 400, "Duplicate dashboard widget");
    }

    if (widget.size !== "small" && widget.size !== "wide") {
      return responseError(res, 400, "Invalid dashboard widget size");
    }

    seen.add(widget.id);

    normalizedWidgets.push({
      id: widget.id as WidgetId,
      size: widget.size as WidgetSize,
    });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("dashboard_preferences")
      .upsert(
        {
          user_id: access.userId,
          restaurant_id: access.restaurantId,
          layout: { widgets: normalizedWidgets } satisfies DashboardLayout,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,restaurant_id" },
      )
      .select("layout, updated_at")
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      data: {
        layout: data.layout,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: unknown) {
    console.error("Error guardando las preferencias del dashboard:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to save dashboard preferences",
    });
  }
});
