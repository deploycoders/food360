import Link from "next/link";
import { ArrowUpRight, Flame } from "lucide-react";

const footerLinks = [
  { label: "Plataforma", href: "#producto" },
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Preguntas frecuentes", href: "#preguntas-frecuentes" },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-(--color-border) bg-(--color-bg-base) px-5 pt-12 sm:px-8 sm:pt-16 lg:px-14">
      <div className="mx-auto max-w-330">
        <div className="grid gap-10 border-b border-(--color-border) pb-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.7fr_0.8fr] lg:gap-16">
          <div className="max-w-115">
            <Link
              href="/"
              aria-label="Food360, volver al inicio"
              className="group inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent-terracotta)"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--color-accent-terracotta) text-white transition-transform duration-200 group-hover:scale-105">
                <Flame className="h-5 w-5 fill-white/20" strokeWidth={1.8} />
              </span>

              <span className="font-sans text-xl font-extrabold tracking-tight text-(--color-text-primary)">
                food
                <span className="text-(--color-accent-terracotta)">360</span>
              </span>
            </Link>

            <p className="mt-5 max-w-100 text-xs leading-[1.9] text-(--color-text-muted) sm:text-[13px]">
              Herramientas para organizar los pedidos, el equipo y la operación
              diaria de tu restaurante desde un mismo lugar.
            </p>
          </div>

          <nav aria-label="Enlaces del pie de página">
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-(--color-text-primary)">
              Explorar
            </p>

            <div className="mt-5 flex flex-col items-start gap-3">
              {footerLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-sm text-xs font-medium text-(--color-text-muted) transition-colors duration-200 hover:text-(--color-accent-terracotta) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent-terracotta)"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="max-w-85">
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-(--color-text-primary)">
              Conoce Food360
            </p>

            <p className="mt-5 text-xs leading-[1.9] text-(--color-text-muted)">
              Descubre cómo funciona la plataforma y conoce sus herramientas
              aplicadas a tu negocio.
            </p>

            <a
              href="#solicitar-demo"
              className="group mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-(--color-accent-terracotta) px-4 text-xs font-bold text-white transition-colors duration-200 hover:bg-(--color-accent-terracotta-hover) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent-terracotta)"
            >
              Solicitar una demo
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3 py-6 text-[10px] text-(--color-text-subtle) sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Food360. Todos los derechos
            reservados.
          </p>

          <a
            href="#inicio"
            className="w-fit rounded-sm font-medium transition-colors hover:text-(--color-accent-terracotta) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent-terracotta)"
          >
            Volver al inicio ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
