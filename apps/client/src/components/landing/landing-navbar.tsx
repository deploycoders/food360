import Link from "next/link";

const links = [
  { label: "Plataforma", href: "#producto" },
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Cómo funciona", href: "#como-funciona" },
];

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E9E5DE] bg-[#FAF9F6]/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-17 w-full max-w-375 items-center justify-between px-5 sm:px-8 lg:px-14 xl:px-16">
        <Link
          href="/"
          aria-label="Food360, inicio"
          className="group flex items-center gap-2.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#E66F43] text-[17px] font-black text-white transition-transform duration-600 group-hover:rotate-[-380deg]">
            f.
          </span>

          <span className="text-[21px] font-extrabold tracking-[-1.2px] text-[#191919]">
            food<span className="text-[#E66F43]">360</span>
          </span>
        </Link>

        <div className="hidden h-full items-center gap-9 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative flex h-full items-center text-[13px] font-medium text-[#716C65] transition-colors duration-200 hover:text-[#E66F43] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[#E66F43] after:transition-transform after:duration-200 hover:after:scale-x-100"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/demo"
            className="hidden text-[13px] font-semibold text-[#49443E] transition-colors duration-200 hover:text-[#E66F43] sm:inline-flex"
          >
            Explorar demo
          </Link>

          <Link
            href="/demo"
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#E66F43] px-4 text-[12px] font-semibold text-white transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#D65F35] hover:shadow-[0_5px_14px_rgba(214,95,53,0.18)] active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E66F43] focus-visible:ring-offset-2"
          >
            Conocer Food360
          </Link>
        </div>
      </nav>
    </header>
  );
}
