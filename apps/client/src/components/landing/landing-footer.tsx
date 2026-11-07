import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="bg-[#FAF9F6] px-5 pt-16 sm:px-8 lg:px-14">
      <div className="mx-auto max-w-350">
        <div className="flex flex-col justify-between gap-8 border-b border-[#E5E0D8] pb-12 lg:flex-row lg:items-end">
          <div className="max-w-170">
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#C56542]">
              Food360
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-[1.12] tracking-[-0.06em] text-[#24221F] sm:text-5xl">
              Es momento de conectar tu restaurante.
            </h2>

            <p className="mt-4 max-w-125 text-[13px] leading-7 text-[#77716A]">
              Conoce las herramientas que pueden ayudarte a organizar la
              operación diaria de tu negocio.
            </p>
          </div>

          <Link
            href="/demo"
            className="group inline-flex h-12 shrink-0 items-center justify-center gap-4 self-start rounded-md bg-[#E66F43] px-6 text-[12px] font-semibold text-white transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#D65F35] hover:shadow-[0_6px_18px_rgba(214,95,53,0.18)] active:translate-y-0 active:scale-[0.98] lg:self-auto"
          >
            Explorar Food360
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        <div className="flex flex-col justify-between gap-6 py-8 sm:flex-row sm:items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#E66F43] text-[15px] font-black text-white">
              f.
            </span>

            <span className="text-[19px] font-extrabold tracking-[-1px] text-[#24221F]">
              food<span className="text-[#E66F43]">360</span>
            </span>
          </Link>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[11px] font-medium text-[#77716A]">
            <a
              href="#producto"
              className="transition-colors hover:text-[#E66F43]"
            >
              Plataforma
            </a>
            <a
              href="#funcionalidades"
              className="transition-colors hover:text-[#E66F43]"
            >
              Funcionalidades
            </a>
            <a
              href="#como-funciona"
              className="transition-colors hover:text-[#E66F43]"
            >
              Cómo funciona
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-[#E5E0D8] py-5 text-[10px] text-[#99938B] sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} Food360. Todos los derechos
            reservados.
          </p>
          <p>Gestión inteligente para restaurantes.</p>
        </div>
      </div>
    </footer>
  );
}
