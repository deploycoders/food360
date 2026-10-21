import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "360 food | Menú digital",
  description:
    "Menú digital de 360 food: descubre platos, arma tu pedido y disfruta.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased flex flex-col justify-start items-center bg-[#E8E9E3] font-sans">
        <Providers>
          {/* Contenedor centralizado mobile-first con proporción editorial */}
          <div className="w-full max-w-md md:max-w-3xl lg:max-w-6xl min-h-screen bg-(--color-bg-base) flex flex-col shadow-[0_20px_50px_rgba(32,37,31,0.12)] relative md:my-5 md:min-h-[calc(100vh-2.5rem)] md:rounded-4xl md:overflow-hidden">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
