import { ScrollReveal } from "./scroll-reveal";

const capabilities = [
  {
    number: "01",
    title: "Pedidos y comandas",
    description:
      "Centraliza las órdenes de tus clientes, organiza su atención y conoce el estado de cada pedido.",
    detail: "Local · Retiro · Domicilio",
  },
  {
    number: "02",
    title: "Menú digital",
    description:
      "Administra categorías, productos, precios y disponibilidad. Mantén la carta pública conectada con tu operación.",
    detail: "Productos · Categorías · Disponibilidad",
  },
  {
    number: "03",
    title: "Cocina y KDS",
    description:
      "Visualiza las comandas que deben prepararse y organiza el trabajo de cocina mediante estados.",
    detail: "Comandas · Preparación · Entregas",
  },
  {
    number: "04",
    title: "Inventario y equipo",
    description:
      "Controla existencias y administra los integrantes de tu restaurante desde el mismo entorno.",
    detail: "Stock · Personal · Permisos",
  },
];

export function BenefitsSection() {
  return (
    <>
      <ScrollReveal className="w-full" stagger={0.1}>
        <section
          id="funcionalidades"
          className="border-t border-[#E8E3DB] bg-white px-5 py-20 sm:px-8 lg:px-14 lg:py-24"
        >
          <div className="mx-auto max-w-350">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              <div data-reveal-item>
                <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#C56542]">
                  Todo conectado
                </p>

                <h2 className="mt-4 max-w-125 text-3xl font-bold leading-[1.12] tracking-[-0.06em] text-[#24221F] sm:text-5xl">
                  Menos procesos dispersos.
                  <span className="text-[#E66F43]"> Más control.</span>
                </h2>

                <p className="mt-5 max-w-105 text-[13px] leading-7 text-[#77716A]">
                  Tu restaurante necesita que las distintas áreas trabajen
                  coordinadas. Food360 reúne las herramientas necesarias para
                  organizar esa operación.
                </p>
              </div>

              <div className="border-t border-[#EAE6DF]">
                {capabilities.map((item) => (
                  <article
                    key={item.number}
                    data-reveal-item
                    className="group grid gap-3 border-b border-[#EAE6DF] py-6 sm:grid-cols-[42px_1fr] sm:gap-5"
                  >
                    <span className="pt-1 text-[11px] font-semibold tabular-nums text-[#C66A44]">
                      {item.number}
                    </span>

                    <div>
                      <h3 className="text-[17px] font-bold tracking-tight text-[#292723] transition-colors duration-200 group-hover:text-[#C56542] sm:text-[19px]">
                        {item.title}
                      </h3>

                      <p className="mt-2 max-w-140 text-[12px] leading-6 text-[#827B72]">
                        {item.description}
                      </p>

                      <p className="mt-3 text-[9px] font-semibold tracking-[0.025em] text-[#A29A90]">
                        {item.detail}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal className="w-full" stagger={0.12}>
        <section
          id="como-funciona"
          className="bg-[#24231F] px-5 py-20 text-white sm:px-8 lg:px-14 lg:py-24"
        >
          <div className="mx-auto max-w-350">
            <div
              data-reveal-item
              className="mb-12 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#E68B67]">
                  El flujo de trabajo
                </p>

                <h2 className="mt-4 max-w-162.5 text-3xl font-bold leading-[1.12] tracking-[-0.055em] sm:text-5xl">
                  Cada pedido sigue su camino.
                  <span className="text-[#E68B67]"> Tu equipo también.</span>
                </h2>
              </div>

              <p className="max-w-85 text-[12px] leading-6 text-white/55">
                Desde que el cliente realiza su orden hasta que cocina completa
                la preparación, todos trabajan con la misma información.
              </p>
            </div>

            <div className="grid border-y border-white/15 md:grid-cols-3 md:divide-x md:divide-white/15">
              {[
                {
                  number: "01",
                  title: "El cliente ordena",
                  description:
                    "Consulta el menú digital y envía su pedido desde su dispositivo.",
                },
                {
                  number: "02",
                  title: "El sistema organiza",
                  description:
                    "La orden se registra y queda disponible para el equipo del restaurante.",
                },
                {
                  number: "03",
                  title: "Cocina prepara",
                  description:
                    "El equipo gestiona la comanda y avanza su estado hasta completar el servicio.",
                },
              ].map((step) => (
                <article
                  key={step.number}
                  data-reveal-item
                  className="group py-7 md:px-7 md:py-9 lg:px-10"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-[#E68B67]">
                      {step.number}
                    </span>

                    <span className="h-px w-12 bg-white/20 transition-all duration-300 group-hover:w-20 group-hover:bg-[#E68B67]" />
                  </div>

                  <h3 className="mt-9 text-[18px] font-bold tracking-tight text-white sm:text-xl">
                    {step.title}
                  </h3>

                  <p className="mt-3 max-w-77.5 text-[12px] leading-6 text-white/55">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
