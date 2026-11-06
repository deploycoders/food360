import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
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
      <body className="flex min-h-dvh w-full justify-center bg-stone-100 font-sans antialiased text-stone-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
        <Providers>
          <div
            className="
              relative flex min-h-dvh w-full max-w-180
              flex-col overflow-hidden bg-white shadow-none
              transition-colors duration-300 dark:bg-zinc-950
              lg:my-4 lg:min-h-[calc(100dvh-2rem)]
              lg:rounded-[30px]
              lg:shadow-[0_25px_90px_rgba(0,0,0,0.16)]
            "
          >
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
