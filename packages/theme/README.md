# @food360/theme

Tokens de diseño, dark/light mode y componentes de tema compartidos para las apps del monorepo Food360.

## Contenido

- `globals.css` — variables CSS, `@theme` de Tailwind v4, estilos base
- `ThemeProvider` / `useTheme` — contexto de tema con persistencia en `localStorage` (`food360-theme`)
- `ThemeToggle` — botón sol/luna

## Uso en una app Next.js

### 1. Dependencia

```json
"@food360/theme": "workspace:*"
```

### 2. Tailwind v4

Instalar `tailwindcss` y `@tailwindcss/postcss`, configurar PostCSS, e importar en `globals.css`:

```css
@import "@food360/theme/globals.css";
```

### 3. Layout

```tsx
import { ThemeProvider } from "@food360/theme";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("food360-theme")||"light";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

### 4. Tailwind content

Incluir el paquete theme en `tailwind.config.ts`:

```ts
content: [
  "./src/**/*.{js,ts,jsx,tsx,mdx}",
  "../../packages/theme/src/**/*.{js,ts,jsx,tsx}",
],
```

## Clases semánticas

| Clase | Uso |
|-------|-----|
| `bg-background` / `text-foreground` | Fondo y texto principal |
| `bg-card` / `text-card-foreground` | Tarjetas y modales |
| `bg-muted` / `text-muted-foreground` | Superficies y texto secundario |
| `border-border` | Bordes |
| `bg-accent` / `text-accent` | Color de marca (naranja) |
| `text-destructive` | Errores |
| `text-warning` | Advertencias |
| `text-success` | Éxito |
