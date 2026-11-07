"use client";

import { useState, type ReactNode } from "react";
import { ScrollReveal } from "./scroll-reveal";

type Screen = "dashboard" | "orders" | "kitchen" | "inventory";

const tabs: { id: Screen; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "orders", label: "Pedidos" },
  { id: "kitchen", label: "Cocina" },
  { id: "inventory", label: "Inventario" },
];

function Status({
  children,
  color = "green",
}: {
  children: ReactNode;
  color?: "green" | "orange" | "blue";
}) {
  const colors = {
    green: "bg-[#EAF3EB] text-[#54805C]",
    orange: "bg-[#FFF0E8] text-[#C36943]",
    blue: "bg-[#EAF0F7] text-[#587DA7]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-[5px] px-2 py-1 text-[9px] font-semibold ${colors[color]}`}
    >
      {children}
    </span>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border-l-2 border-[#E66F43] bg-white px-4 py-3.5">
      <p className="text-[10px] font-medium text-[#89837B]">{label}</p>
      <p className="mt-2 text-[25px] font-bold tracking-[-1px] text-[#292723]">
        {value}
      </p>
      <p className="mt-1 text-[9px] text-[#99938B]">{detail}</p>
    </div>
  );
}

function DashboardView() {
  const orders = [
    ["#1048", "Laura Méndez", "2 productos", "$24.50", "En preparación"],
    ["#1047", "Carlos Pérez", "3 productos", "$38.00", "Listo"],
    ["#1046", "María Torres", "1 producto", "$12.00", "Entregado"],
    ["#1045", "Andrés Gómez", "2 productos", "$29.00", "En preparación"],
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] text-[#918A81]">Resumen general</p>
          <h3 className="mt-1 text-[19px] font-bold tracking-tight text-[#292723]">
            Actividad del restaurante
          </h3>
        </div>

        <Status>Operación activa</Status>
      </div>

      <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        <Metric label="Pedidos de hoy" value="48" detail="12 más que ayer" />
        <Metric
          label="Ventas del día"
          value="$1,248"
          detail="Datos de demostración"
        />
        <Metric label="En preparación" value="06" detail="Pedidos activos" />
        <Metric
          label="Ticket promedio"
          value="$26.00"
          detail="Valor ilustrativo"
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.5fr_0.8fr]">
        <div className="border border-[#EAE7E1] bg-white">
          <div className="flex items-center justify-between border-b border-[#EEECE8] px-4 py-3">
            <h4 className="text-[11px] font-bold text-[#33302C]">
              Últimos pedidos
            </h4>
            <span className="text-[9px] font-semibold text-[#C66A44]">
              Ver pedidos →
            </span>
          </div>

          <div className="grid grid-cols-[0.7fr_1.6fr_0.8fr_1fr] gap-2 border-b border-[#EEECE8] bg-[#FAF9F6] px-4 py-2.5 text-[8px] font-semibold uppercase tracking-wider text-[#989187]">
            <span>Orden</span>
            <span>Cliente</span>
            <span>Total</span>
            <span>Estado</span>
          </div>

          <div>
            {orders.map((order) => (
              <div
                key={order[0]}
                className="grid grid-cols-[0.7fr_1.6fr_0.8fr_1fr] items-center gap-2 border-b border-[#F0EEE9] px-4 py-4 last:border-0"
              >
                <span className="text-[10px] font-bold text-[#524C44]">
                  {order[0]}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold text-[#38342F]">
                    {order[1]}
                  </p>
                  <p className="mt-1 text-[9px] text-[#A19B93]">{order[2]}</p>
                </div>

                <span className="text-[10px] font-semibold text-[#504A43]">
                  {order[3]}
                </span>

                <span className="truncate text-[9px] text-[#77716A]">
                  {order[4]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-[#EAE7E1] bg-white p-4">
          <h4 className="text-[11px] font-bold text-[#33302C]">
            Estado de los pedidos
          </h4>

          <p className="mt-1 text-[9px] text-[#99938B]">
            Distribución de órdenes del día
          </p>

          <div className="mt-6 space-y-5">
            {[
              {
                label: "Pendientes",
                amount: "08",
                percent: "28%",
                width: "28%",
                color: "bg-[#D4A16F]",
              },
              {
                label: "En preparación",
                amount: "06",
                percent: "45%",
                width: "45%",
                color: "bg-[#E66F43]",
              },
              {
                label: "Listos",
                amount: "12",
                percent: "65%",
                width: "65%",
                color: "bg-[#85A38B]",
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex justify-between text-[10px]">
                  <span className="text-[#77716A]">{item.label}</span>
                  <span className="font-semibold text-[#3D3934]">
                    {item.amount}
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden bg-[#F0EEE9]">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: item.width }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 border-t border-[#EEECE8] pt-4">
            <p className="text-[10px] font-semibold text-[#504A43]">
              Información centralizada
            </p>
            <p className="mt-1 text-[9px] leading-5 text-[#99938B]">
              Consulta la actividad de tu negocio en un mismo espacio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersView() {
  const orders = [
    ["#1052", "Retiro en local", "12:42 PM", "$32.00", "Pendiente"],
    ["#1051", "Consumo en el local", "12:38 PM", "$18.50", "En preparación"],
    ["#1050", "Domicilio", "12:31 PM", "$45.00", "Listo"],
    ["#1049", "Consumo en el local", "12:25 PM", "$21.00", "Pendiente"],
    ["#1048", "Retiro en local", "12:19 PM", "$24.50", "Entregado"],
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] text-[#918A81]">Gestión operativa</p>
          <h3 className="mt-1 text-[19px] font-bold text-[#292723]">
            Pedidos y comandas
          </h3>
        </div>
        <Status>Pedidos organizados</Status>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {["Todos", "Pendientes", "Preparación", "Listos"].map((item, index) => (
          <span
            key={item}
            className={`rounded-[5px] px-3 py-2 text-[9px] font-semibold ${
              index === 0
                ? "bg-[#2A2824] text-white"
                : "border border-[#EAE7E1] bg-white text-[#77716A]"
            }`}
          >
            {item}
          </span>
        ))}
      </div>

      <div className="border border-[#EAE7E1] bg-white">
        {orders.map((order) => (
          <div
            key={order[0]}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEECE8] px-4 py-4 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center bg-[#F4F1EC] text-[10px] font-bold text-[#77716A]">
                {order[0].slice(1)}
              </span>
              <div>
                <p className="text-[11px] font-bold text-[#37332E]">
                  {order[0]} · {order[1]}
                </p>
                <p className="mt-1 text-[9px] text-[#99938B]">{order[2]}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-[#37332E]">
                {order[3]}
              </span>
              <Status color="orange">{order[4]}</Status>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KitchenView() {
  const columns = [
    {
      title: "Pendientes",
      color: "bg-[#D4A16F]",
      items: ["Hamburguesa clásica", "Pasta Alfredo"],
    },
    {
      title: "Preparando",
      color: "bg-[#E66F43]",
      items: ["Pizza Margarita", "Ensalada César"],
    },
    {
      title: "Listos",
      color: "bg-[#85A38B]",
      items: ["Club House"],
    },
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] text-[#918A81]">Kitchen Display System</p>
          <h3 className="mt-1 text-[19px] font-bold text-[#292723]">
            Operación de cocina
          </h3>
        </div>
        <Status>Vista de cocina</Status>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {columns.map((column) => (
          <div key={column.title} className="border border-[#EAE7E1] bg-white">
            <div className="flex items-center justify-between border-b border-[#EEECE8] px-3 py-3">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 ${column.color}`} />
                <p className="text-[10px] font-bold text-[#46413B]">
                  {column.title}
                </p>
              </div>
              <span className="text-[9px] text-[#99938B]">
                {column.items.length} órdenes
              </span>
            </div>

            <div className="space-y-2 bg-[#FAF9F6] p-2.5">
              {column.items.map((item, index) => (
                <div
                  key={item}
                  className="border border-[#ECE8E1] bg-white p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-[#C66A44]">
                      #{1048 - index}
                    </span>
                    <span className="text-[9px] text-[#AAA39A]">
                      12:4{index} PM
                    </span>
                  </div>

                  <p className="mt-3 text-[10px] font-semibold text-[#38342F]">
                    {item}
                  </p>

                  <p className="mt-1 text-[9px] text-[#A19B93]">
                    1 unidad · Sin observaciones
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryView() {
  const products = [
    ["Carne de res", "Proteínas", "12 kg", "Stock bajo"],
    ["Queso mozzarella", "Lácteos", "18 kg", "Disponible"],
    ["Harina de trigo", "Secos", "24 kg", "Disponible"],
    ["Tomate", "Vegetales", "3 kg", "Stock bajo"],
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] text-[#918A81]">Control operativo</p>
          <h3 className="mt-1 text-[19px] font-bold text-[#292723]">
            Inventario y existencias
          </h3>
        </div>
        <Status>Control de stock</Status>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Metric
          label="Productos registrados"
          value="36"
          detail="En el inventario"
        />
        <Metric
          label="Alertas de stock"
          value="02"
          detail="Requieren atención"
        />
      </div>

      <div className="border border-[#EAE7E1] bg-white">
        <div className="grid grid-cols-[1.5fr_1fr_auto] gap-3 border-b border-[#EEECE8] bg-[#FAF9F6] px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-[#99938B]">
          <span>Producto</span>
          <span>Existencias</span>
          <span>Estado</span>
        </div>

        {products.map((product) => (
          <div
            key={product[0]}
            className="grid grid-cols-[1.5fr_1fr_auto] items-center gap-3 border-b border-[#F1EFEB] px-4 py-4 last:border-0"
          >
            <div>
              <p className="text-[10px] font-semibold text-[#38342F]">
                {product[0]}
              </p>
              <p className="mt-1 text-[9px] text-[#A19B93]">{product[1]}</p>
            </div>

            <span className="text-[10px] font-medium text-[#514B44]">
              {product[2]}
            </span>

            <Status color={product[3] === "Disponible" ? "green" : "orange"}>
              {product[3]}
            </Status>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductShowcase() {
  const [activeScreen, setActiveScreen] = useState<Screen>("dashboard");

  return (
    <ScrollReveal className="w-full" stagger={0.12}>
      <section id="producto" className="px-4 pb-20 sm:px-8 lg:px-14">
        <div className="mx-auto max-w-375">
          <div
            data-reveal-item
            className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C56542]">
                Conoce Food360
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.05em] text-[#24221F] sm:text-3xl">
                Una visión completa de tu negocio.
              </h2>
            </div>

            <p className="max-w-90 text-[12px] leading-6 text-[#827B72]">
              Información, herramientas y procesos reunidos en una sola
              plataforma de trabajo.
            </p>
          </div>

          <div
            data-reveal-item
            className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#E7E2DA] pb-3"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              {tabs.map((tab) => {
                const active = activeScreen === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveScreen(tab.id)}
                    aria-pressed={active}
                    className={`rounded-md px-4 py-2.5 text-[11px] font-semibold transition-[background-color,color,transform] duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E66F43] focus-visible:ring-offset-2 ${
                      active
                        ? "bg-[#282622] text-white"
                        : "text-[#77716A] hover:bg-[#EDE9E2] hover:text-[#292723]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <span className="hidden text-[10px] text-[#99938B] sm:inline">
              Vista ilustrativa del producto
            </span>
          </div>

          <div
            data-reveal-item
            className="overflow-hidden rounded-xl border border-[#E4E0D8] bg-white shadow-[0_12px_40px_rgba(40,34,25,0.07)]"
          >
            {/* Barra superior de la aplicación */}
            <div className="flex h-12.5 items-center justify-between border-b border-[#EAE7E1] bg-[#FDFCFA] px-4 sm:px-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#E66F43] text-[12px] font-black text-white">
                  f.
                </span>
                <span className="text-[12px] font-bold text-[#33302C]">
                  food<span className="text-[#E66F43]">360</span>
                </span>
                <span className="hidden border-l border-[#E4E0D8] pl-3 text-[10px] text-[#99938B] sm:inline">
                  Restaurante Demo
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[9px] text-[#99938B]">
                  Vista de administración
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEE9E1] text-[10px] font-bold text-[#625A50]">
                  AD
                </span>
              </div>
            </div>

            <div className="flex min-h-122.5">
              {/* Sidebar de escritorio */}
              <aside className="hidden w-51.25 shrink-0 border-r border-[#EAE7E1] bg-[#FCFBF9] p-4 md:block">
                <p className="mb-3 px-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#AAA39A]">
                  Menú principal
                </p>

                <div className="space-y-1">
                  {[
                    { id: "dashboard", label: "Dashboard" },
                    { id: "orders", label: "Pedidos" },
                    { id: "kitchen", label: "Cocina / KDS" },
                    { id: "inventory", label: "Inventario" },
                  ].map((item) => {
                    const active = activeScreen === item.id;

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setActiveScreen(item.id as Screen)}
                        className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-[10px] font-medium transition-colors duration-200 ${
                          active
                            ? "bg-[#FCEDE6] text-[#B75A37]"
                            : "text-[#77716A] hover:bg-[#F1EEE8]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            active ? "bg-[#E66F43]" : "bg-[#C7C0B7]"
                          }`}
                        />
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 border-t border-[#EAE7E1] pt-5">
                  <p className="mb-3 px-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#AAA39A]">
                    Administración
                  </p>
                  {["Menú digital", "Equipo", "Configuración"].map((item) => (
                    <div
                      key={item}
                      className="px-3 py-2.5 text-[10px] text-[#89837B]"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-10 border-t border-[#EAE7E1] pt-4">
                  <p className="text-[9px] font-semibold text-[#625A50]">
                    Food360 Demo
                  </p>
                  <p className="mt-1 text-[9px] text-[#AAA39A]">
                    Datos de ejemplo
                  </p>
                </div>
              </aside>

              {/* Área de trabajo */}
              <div
                key={activeScreen}
                className="min-w-0 flex-1 bg-[#FAF9F6] p-3 animate-[showcase-enter_220ms_ease-out_both] motion-reduce:animate-none sm:p-5 lg:p-7"
              >
                {activeScreen === "dashboard" && <DashboardView />}
                {activeScreen === "orders" && <OrdersView />}
                {activeScreen === "kitchen" && <KitchenView />}
                {activeScreen === "inventory" && <InventoryView />}
              </div>
            </div>
          </div>

          <p className="mt-3 text-right text-[9px] text-[#A39C92]">
            Interfaz de demostración · Información ilustrativa
          </p>
        </div>
      </section>
    </ScrollReveal>
  );
}
