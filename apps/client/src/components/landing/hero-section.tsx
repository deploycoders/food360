import Link from "next/link";
import { ScrollReveal } from "./scroll-reveal";

const modules = [
  "Pedidos y comandas",
  "Menú digital",
  "Cocina en tiempo real",
  "Inventario",
  "Gestión de equipo",
];

export function HeroSection() {
  return (
    <ScrollReveal className="w-full" stagger={0.12}>
      <section className="px-5 pb-12 pt-19 sm:px-8 sm:pb-16 sm:pt-24 lg:px-14 lg:pt-28">
        <div className="mx-auto max-w-287.5 text-center">
          <p
            data-reveal-item
            className="mb-7 text-[11px] font-bold uppercase tracking-[0.19em] text-[#C56542]"
          >
            Tecnología para la industria gastronómica
          </p>

          <h1
            data-reveal-item
            className="mx-auto max-w-275 text-[clamp(2.8rem,6.5vw,5.9rem)] font-bold leading-[1.03] tracking-[-0.075em] text-[#20201E]"
          >
            La operación de tu restaurante,
            <span className="block text-[#E66F43]">en un solo lugar.</span>
          </h1>

          <p
            data-reveal-item
            className="mx-auto mt-6 max-w-175 text-[15px] leading-[1.8] text-[#77716A] sm:text-[17px]"
          >
            Administra pedidos, menú digital, cocina, inventario y equipo desde
            una plataforma diseñada para que cada parte de tu restaurante
            trabaje en sincronía.
          </p>

          <div
            data-reveal-item
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/demo"
              className="group inline-flex h-12.5 w-full items-center justify-center gap-3 rounded-md bg-[#E66F43] px-7 text-[13px] font-semibold text-white transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#D65F35] hover:shadow-[0_7px_18px_rgba(214,95,53,0.20)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E66F43] focus-visible:ring-offset-2 sm:w-auto"
            >
              Explorar la plataforma
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>

            <a
              href="#producto"
              className="inline-flex h-12.5 w-full items-center justify-center rounded-md border border-[#DCD6CC] bg-transparent px-7 text-[13px] font-semibold text-[#38342F] transition-[background-color,border-color,transform] duration-200 hover:border-[#BBB1A4] hover:bg-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E66F43] focus-visible:ring-offset-2 sm:w-auto"
            >
              Conocer la plataforma
            </a>
          </div>

          <div
            data-reveal-item
            className="mx-auto mt-12 flex max-w-262.5 flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t border-[#E8E3DB] pt-5 sm:gap-x-8"
          >
            {modules.map((module, index) => (
              <div key={module} className="flex items-center gap-5 sm:gap-8">
                <span className="whitespace-nowrap text-[10px] font-semibold tracking-[0.025em] text-[#77716A] sm:text-[11px]">
                  {module}
                </span>

                {index !== modules.length - 1 && (
                  <span className="h-1 w-1 shrink-0 rounded-full bg-[#C9BDB0]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
