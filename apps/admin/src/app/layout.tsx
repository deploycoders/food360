import { ThemeProvider } from "@food360/theme";
import { AuthProvider } from "@/context/AuthContext";
import { RestaurantProvider } from "@/context/RestaurantContext";
import "@food360/theme/globals.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "Food360 - Admin Panel",
  description: "Panel de administración",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <RestaurantProvider>
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
            </RestaurantProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
