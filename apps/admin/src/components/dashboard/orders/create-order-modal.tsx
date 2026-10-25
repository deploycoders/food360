"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Check,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import type { Table } from "@food360/types";
import { getTables } from "@/services/tables.service";
import { ordersService } from "@/services/orders.service";
import type { Product } from "@/types/menu";

type OrderOrigin = "DINE_IN" | "TAKEAWAY" | "DELIVERY";

interface CreateOrderModalProps {
  open: boolean;
  products: Product[];
  onClose: () => void;
  onCreated: () => void | Promise<void>;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface OrderOccupancyData {
  table_id?: string | null;
  tableId?: string | null;
  status?: string | null;
}

const ORIGINS: { value: OrderOrigin; label: string }[] = [
  { value: "DINE_IN", label: "En mesa" },
  { value: "TAKEAWAY", label: "Para llevar" },
  { value: "DELIVERY", label: "Domicilio" },
];

const ACTIVE_ORDER_STATUSES = new Set([
  "PENDING",
  "CONFIRMED",
  "IN_KITCHEN",
  "IN_PROGRESS",
  "READY",
  "SERVED",
]);

const currencyFormatter = new Intl.NumberFormat("es", {
  style: "currency",
  currency: "EUR",
});

function getOrderOccupancyData(order: unknown) {
  if (!order || typeof order !== "object") {
    return null;
  }

  const value = order as OrderOccupancyData;

  const hasTableId = "table_id" in order || "tableId" in order;

  const hasStatus = "status" in order;

  // No declaramos las mesas libres si no podemos comprobar
  // el identificador de mesa y el estado de cada pedido.
  if (!hasTableId || !hasStatus) {
    return null;
  }

  return {
    tableId: value.table_id ?? value.tableId ?? null,
    status: value.status?.trim().toUpperCase() ?? "",
  };
}

export function CreateOrderModal({
  open,
  products,
  onClose,
  onCreated,
}: CreateOrderModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [origin, setOrigin] = useState<OrderOrigin>("DINE_IN");
  const [selectedTableId, setSelectedTableId] = useState("");

  const [tables, setTables] = useState<Table[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [tablesError, setTablesError] = useState<string | null>(null);

  const [occupiedTableIds, setOccupiedTableIds] = useState<Set<string>>(
    new Set(),
  );
  const [availabilityVerified, setAvailabilityVerified] = useState(false);

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Reiniciar el formulario cada vez que se abre el modal.
  useEffect(() => {
    if (!open) return;

    setFullName("");
    setPhone("");
    setOrigin("DINE_IN");
    setSelectedTableId("");

    setSearch("");
    setCart([]);
    setSubmitting(false);

    setTablesError(null);
    setAvailabilityVerified(false);
    setOccupiedTableIds(new Set());
  }, [open]);

  // Cargar las mesas y consultar los pedidos para conocer
  // cuáles tienen una orden activa asociada.
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadTables() {
      setTablesLoading(true);
      setTablesError(null);

      try {
        const result = await getTables();

        if (cancelled) return;

        setTables(result);
      } catch (error) {
        if (cancelled) return;

        setTablesError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las mesas.",
        );
      } finally {
        if (!cancelled) {
          setTablesLoading(false);
        }
      }
    }

    async function loadOccupancy() {
      try {
        const orders = await ordersService.getOrders();

        if (cancelled) return;

        const normalizedOrders = orders.map(getOrderOccupancyData);

        // Si una orden no incluye estos campos, no afirmamos
        // que conocemos la disponibilidad de todas las mesas.
        if (normalizedOrders.some((order) => order === null)) {
          setAvailabilityVerified(false);
          setOccupiedTableIds(new Set());
          return;
        }

        const occupiedIds = new Set<string>();

        for (const order of normalizedOrders) {
          if (order?.tableId && ACTIVE_ORDER_STATUSES.has(order.status)) {
            occupiedIds.add(order.tableId);
          }
        }

        setOccupiedTableIds(occupiedIds);
        setAvailabilityVerified(true);
      } catch (error) {
        if (cancelled) return;

        console.error(
          "[Orders] No se pudo verificar la ocupación de las mesas:",
          error,
        );

        setAvailabilityVerified(false);
        setOccupiedTableIds(new Set());
      }
    }

    void loadTables();
    void loadOccupancy();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const availableProducts = useMemo(
    () =>
      products.filter((product) => product.isActive && !product.isOutOfStock),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");

    return availableProducts.filter((product) =>
      product.name.toLocaleLowerCase("es").includes(query),
    );
  }, [availableProducts, search]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  function addProduct(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [...current, { product, quantity: 1 }];
    });
  }

  function changeQuantity(productId: string, amount: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: item.quantity + amount,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    const normalizedName = fullName.trim();
    const normalizedPhone = phone.trim();

    if (!normalizedName || !normalizedPhone) {
      toast.error("Introduce el nombre y el teléfono del cliente.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Añade al menos un producto al pedido.");
      return;
    }

    let tableId: string | null = null;

    if (origin === "DINE_IN") {
      if (tablesLoading) {
        toast.error("Espera a que se carguen las mesas.");
        return;
      }

      if (tablesError) {
        toast.error("No se pudieron cargar las mesas. Vuelve a intentarlo.");
        return;
      }

      if (!selectedTableId) {
        toast.error("Selecciona una mesa para este pedido.");
        return;
      }

      const selectedTable = tables.find(
        (table) => table.id === selectedTableId,
      );

      if (!selectedTable) {
        toast.error("La mesa seleccionada ya no está disponible en la lista.");
        return;
      }

      tableId = selectedTable.id;
    }

    setSubmitting(true);

    try {
      await ordersService.createOrder({
        full_name: normalizedName,
        phone: normalizedPhone,
        origin,
        table_id: tableId,
        items: cart.map(({ product, quantity }) => ({
          product_id: product.id,
          quantity,
        })),
      });

      toast.success("Pedido creado correctamente.");
      onClose();

      // La creación ya se completó. Si falla el refresco de la lista,
      // informamos del fallo por separado.
      try {
        await onCreated();
      } catch {
        toast.error("El pedido se creó, pero no se pudo actualizar la lista.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo crear el pedido.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-order-title"
        className="flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl sm:rounded-2xl"
      >
        {/* Encabezado */}
        <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2
                id="create-order-title"
                className="text-lg font-bold tracking-tight text-foreground"
              >
                Nueva orden
              </h2>

              <p className="mt-0.5 text-sm text-muted-foreground">
                Registra un pedido y añade sus productos.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Cerrar modal"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* Datos y catálogo */}
            <div className="space-y-7 p-5 sm:p-7">
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-primary" />

                  <h3 className="text-sm font-semibold text-foreground">
                    Datos del cliente
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Nombre completo
                    </span>

                    <input
                      required
                      autoComplete="name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Nombre del cliente"
                      className="h-11 w-full rounded-xl border border-border bg-card px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Teléfono
                    </span>

                    <input
                      required
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="0424-1234567"
                      className="h-11 w-full rounded-xl border border-border bg-card px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </label>
                </div>

                <fieldset className="space-y-2">
                  <legend className="text-xs font-medium text-muted-foreground">
                    Tipo de pedido
                  </legend>

                  <div className="grid grid-cols-3 gap-2">
                    {ORIGINS.map((option) => {
                      const selected = origin === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => {
                            setOrigin(option.value);

                            if (option.value !== "DINE_IN") {
                              setSelectedTableId("");
                            }
                          }}
                          className={`flex min-h-10 items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-semibold transition-colors sm:text-sm ${
                            selected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {selected && <Check className="h-3.5 w-3.5" />}

                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Selector de mesa: solo aplica a pedidos en mesa. */}
                {origin === "DINE_IN" && (
                  <div className="space-y-2">
                    <label
                      htmlFor="create-order-table"
                      className="block text-xs font-medium text-muted-foreground"
                    >
                      Mesa
                    </label>

                    <select
                      id="create-order-table"
                      required
                      value={selectedTableId}
                      onChange={(event) =>
                        setSelectedTableId(event.target.value)
                      }
                      disabled={tablesLoading || Boolean(tablesError)}
                      className="h-11 w-full rounded-xl border border-border bg-card px-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">
                        {tablesLoading
                          ? "Cargando mesas..."
                          : tablesError
                            ? "No se pudieron cargar las mesas"
                            : tables.length === 0
                              ? "No hay mesas registradas"
                              : "Selecciona una mesa"}
                      </option>

                      {tables.map((table) => {
                        const occupied = occupiedTableIds.has(table.id);

                        const availabilityLabel = availabilityVerified
                          ? occupied
                            ? "Ocupada"
                            : "Disponible"
                          : "Estado sin verificar";

                        return (
                          <option key={table.id} value={table.id}>
                            Mesa {table.tableNumber} · {availabilityLabel}
                          </option>
                        );
                      })}
                    </select>

                    {tablesError && (
                      <p className="text-xs text-destructive">{tablesError}</p>
                    )}

                    {!tablesError &&
                      !tablesLoading &&
                      !availabilityVerified && (
                        <p className="text-xs text-muted-foreground">
                          No se pudo verificar la ocupación. Puedes registrar el
                          pedido, pero el estado de las mesas puede no estar
                          actualizado.
                        </p>
                      )}

                    {availabilityVerified && (
                      <p className="text-xs text-muted-foreground">
                        Puedes registrar pedidos independientes en una mesa que
                        ya tenga otros pedidos activos.
                      </p>
                    )}
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Productos
                  </h3>

                  <span className="text-xs text-muted-foreground">
                    {availableProducts.length} disponibles
                  </span>
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar producto..."
                    aria-label="Buscar productos"
                    className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
                    <ShoppingBag className="mx-auto h-7 w-7 text-muted-foreground/60" />

                    <p className="mt-3 text-sm font-medium text-foreground">
                      No hay productos disponibles
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Prueba con otra búsqueda o revisa el catálogo.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {filteredProducts.map((product) => {
                      const inCart =
                        cart.find((item) => item.product.id === product.id)
                          ?.quantity ?? 0;

                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => addProduct(product)}
                          className="group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/40 hover:bg-muted/40 active:scale-[0.99]"
                        >
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ShoppingBag className="h-5 w-5 text-muted-foreground/60" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {product.name}
                            </p>

                            <p className="mt-1 text-sm font-semibold text-foreground">
                              {currencyFormatter.format(product.price)}
                            </p>
                          </div>

                          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                            {inCart > 0 ? (
                              <span className="text-xs font-bold">
                                {inCart}
                              </span>
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Resumen */}
            <aside className="flex flex-col border-t border-border bg-muted/20 lg:border-l lg:border-t-0">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Resumen del pedido
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {totalItems} {totalItems === 1 ? "unidad" : "unidades"}
                  </p>
                </div>

                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCart([])}
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
                  >
                    Vaciar
                  </button>
                )}
              </div>

              <div className="min-h-36 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
                {cart.length === 0 ? (
                  <div className="flex min-h-44 flex-col items-center justify-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                      <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <p className="mt-3 text-sm font-medium text-foreground">
                      Tu pedido está vacío
                    </p>

                    <p className="mt-1 max-w-48 text-xs leading-5 text-muted-foreground">
                      Selecciona productos del catálogo para comenzar.
                    </p>
                  </div>
                ) : (
                  cart.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="rounded-xl border border-border bg-card p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {currencyFormatter.format(product.price)} / unidad
                          </p>
                        </div>

                        <button
                          type="button"
                          aria-label={`Eliminar ${product.name}`}
                          onClick={() => changeQuantity(product.id, -quantity)}
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Quitar una unidad de ${product.name}`}
                            onClick={() => changeQuantity(product.id, -1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>

                          <span className="min-w-5 text-center text-sm font-semibold tabular-nums text-foreground">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            aria-label={`Añadir una unidad de ${product.name}`}
                            onClick={() => changeQuantity(product.id, 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="text-sm font-semibold tabular-nums text-foreground">
                          {currencyFormatter.format(product.price * quantity)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3 border-t border-border bg-card p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal estimado
                  </span>

                  <span className="font-medium tabular-nums text-foreground">
                    {currencyFormatter.format(total)}
                  </span>
                </div>

                <div className="flex items-end justify-between gap-3">
                  <span className="text-sm font-semibold text-foreground">
                    Total estimado
                  </span>

                  <span className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
                    {currencyFormatter.format(total)}
                  </span>
                </div>

                <p className="text-[11px] leading-4 text-muted-foreground">
                  El importe definitivo lo calcula y valida el servidor.
                </p>
              </div>
            </aside>
          </div>

          {/* Acciones */}
          <footer className="flex flex-col-reverse gap-2 border-t border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={submitting || cart.length === 0}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" />

              {submitting
                ? "Creando pedido..."
                : `Crear pedido${
                    total > 0 ? ` · ${currencyFormatter.format(total)}` : ""
                  }`}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
