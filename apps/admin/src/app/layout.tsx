import { ThemeProvider } from "@food360/theme";
import "@food360/theme/globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "Food360 - Admin Panel",
  description: "Panel de administración",
};

const themeScript = `(function(){try{var t=localStorage.getItem("food360-theme")||"light";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-background text-foreground antialiased transition-colors duration-200">
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            duration={3000}
            toastOptions={{
              style: {
                background: "var(--card)",
                color: "var(--foreground)",
                borderColor: "var(--border)",
                borderRadius: "14px",
                fontSize: "13px",
                boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.12)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
