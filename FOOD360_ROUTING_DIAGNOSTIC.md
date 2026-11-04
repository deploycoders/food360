# Diagnóstico técnico de enrutamiento multi-tenant — Food360

**Fecha de inspección:** 2026-11-04  
**Alcance:** estado actual del árbol de trabajo de `J:\Mis proyectos\food360`.  
**Limitación importante:** el árbol ya tenía cambios staged/unstaged y archivos nuevos antes de esta auditoría. Este informe describe los archivos tal como estaban durante la inspección; no atribuye esos cambios a esta auditoría. No se modificó ningún archivo de aplicación. El único archivo añadido es este diagnóstico.

## 1. Resumen y versiones

Food360 es un monorepo pnpm/Turborepo con las aplicaciones `admin`, `api` y `client`. El frontend público es Next.js App Router; el backend independiente es Express y monta el menú público bajo `/api/v1/public/restaurants`.

| Componente | Evidencia inspeccionada |
|---|---|
| Node.js | `v24.18.0` |
| pnpm | `8.15.6` |
| Next.js instalado en `apps/client` | `16.3.4` |
| Next.js declarado por `apps/client` | `16.3.4` |
| React declarado por `apps/client` | `19.2.8` (React 19) |
| TypeScript declarado por `apps/client` | `5.9.3` |
| API | Express `4.21.2` |
| Workspace | pnpm, `apps/*` y `packages/*` |
| Turborepo | `^2.10.11` |

El diagnóstico de ejecución del proceso anterior no es reproducible en esta sesión: no había procesos escuchando en los puertos `3000` ni `3002`. El endpoint público y la respuesta real reportados en el contexto de la solicitud no se volvieron a consultar desde esta sesión.

## 2. Árbol relevante

Árbol de código, sin dependencias ni artefactos generados (`node_modules`, `.next`, `.turbo`, `dist`, `build`):

```text
food360/
├── apps/
│   ├── admin/
│   ├── api/
│   └── client/
├── packages/
├── package.json
├── package-lock.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── turbo.json
├── README.md
├── food360-client-architecture.txt
└── food360-client-flow-review.txt

apps/client/
├── .env
├── package.json
├── next.config.ts
├── tsconfig.json
├── README.md
├── public/
└── src/
    ├── proxy.ts
    ├── app/
    │   ├── [slug]/
    │   │   ├── error.tsx
    │   │   ├── loading.tsx
    │   │   ├── page.tsx
    │   │   └── menu/
    │   │       └── page.tsx
    │   ├── cart/
    │   │   └── page.tsx
    │   ├── menu/
    │   │   └── page.tsx
    │   ├── r/
    │   │   └── [publicId]/
    │   │       └── page.tsx
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── not-found.tsx
    │   ├── page.tsx
    │   └── providers.tsx
    ├── components/
    │   ├── cart/
    │   ├── customer/
    │   ├── home/
    │   ├── menu/
    │   ├── public/
    │   │   ├── restaurant-page.tsx
    │   │   ├── table-origin-binder.tsx
    │   │   ├── theme-toggle.tsx
    │   │   └── wifi-access.tsx
    │   └── shared/
    ├── context/
    │   ├── CartContext.tsx
    │   ├── SessionContext.tsx
    │   └── TenantContext.tsx
    ├── data/
    │   ├── menu.ts
    │   └── restaurant.ts
    ├── lib/
    │   ├── formatters.ts
    │   ├── restaurant-url.ts
    │   └── session-storage.ts
    ├── services/
    │   ├── order.service.ts
    │   ├── public-menu.service.ts
    │   ├── public-restaurant.service.ts
    │   └── public-table.service.ts
    └── types/
        └── index.ts
```

No hay grupos de rutas `(group)` en `apps/client/src/app`. No se encontró un layout anidado bajo `[slug]`, `[slug]/menu`, `menu`, `cart` o `r/[publicId]`; todas estas rutas heredan `src/app/layout.tsx`. En `[slug]` sí existen `loading.tsx` y `error.tsx`.

## 3. Configuración de monorepo y Next.js

### `package.json` (raíz)

```json
{
  "name": "food360",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "clean": "turbo run clean",
    "dev": "turbo run dev",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "check-types": "turbo run check-types"
  },
  "devDependencies": {
    "prettier": "^3.6.0",
    "turbo": "^2.10.11"
  },
  "packageManager": "pnpm@8.15.6",
  "engines": {
    "node": ">=18"
  },
  "dependencies": {
    "@hello-pangea/dnd": "^18.0.1",
    "framer-motion": "^13.1.1",
    "sonner": "^2.0.8",
    "sweetalert2": "^11.26.25"
  }
}
```

Hay un `package-lock.json` además de `pnpm-lock.yaml`; el `packageManager` del monorepo declara pnpm.

### `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### `turbo.json`

```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "ui": "tui",
  "globalEnv": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_API_URL",
    "NEXT_PUBLIC_PUBLIC_APP_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "FOOD360_ADMIN_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET"
  ],
  "tasks": {
    "build": {
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "dependsOn": ["^build"],
      "outputs": [
        "build/**",
        ".vercel/**",
        "dist/**",
        ".next/**",
        "!.next/cache/**",
        "!.next/dev/**"
      ]
    },
    "test": {
      "outputs": ["coverage/**"],
      "dependsOn": []
    },
    "lint": {
      "dependsOn": ["^build", "^lint"]
    },
    "check-types": {
      "dependsOn": ["^build", "^check-types"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

`FOOD360_ROOT_DOMAIN` no figura en `globalEnv`. Next también carga los archivos `.env*` de su raíz de aplicación; por eso esta omisión no demuestra por sí sola que la variable falte durante `next dev`. Sí sería relevante comprobar qué entorno efectivo recibe Turbo cuando la variable se proporciona desde el proceso padre y no desde el `.env` de `apps/client`.

### `apps/client/package.json`

```json
{
  "name": "client",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "next build",
    "dev": "next dev -p 3000",
    "lint": "eslint --max-warnings 0",
    "check-types": "next typegen && tsc --noEmit",
    "start": "next start"
  },
  "dependencies": {
    "@food360/database": "workspace:*",
    "@food360/theme": "workspace:*",
    "@food360/types": "workspace:*",
    "@food360/ui": "workspace:*",
    "@repo/logger": "workspace:*",
    "gsap": "^3.15.0",
    "lucide-react": "^1.34.0",
    "motion": "^12.43.0",
    "next": "16.3.4",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "swiper": "^14.2.0"
  },
  "devDependencies": {
    "@next/eslint-plugin-next": "^16.3.0",
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/node": "^22.15.3",
    "@types/react": "19.1.0",
    "@types/react-dom": "19.1.1",
    "eslint": "^9.39.0",
    "typescript": "5.9.3"
  }
}
```

El script local de Client es `next dev -p 3000`. El README de Client indica ejecutarlo desde la raíz con `pnpm --filter client dev` (y la API con `pnpm --filter api dev`). En ese flujo, pnpm ejecuta el script dentro del paquete Client. El directorio actual de esta inspección era la raíz del monorepo; no había un proceso activo que permitiera afirmar desde dónde se inició la ejecución problemática anterior.

### `apps/client/next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
```

No define `rewrites`, `redirects`, `headers`, `basePath`, `trailingSlash`, `hostname`, `port`, `proxy` ni opciones de resolución de tenant. Tampoco se encontró otro archivo de configuración Next dentro de `apps/client`. `hostname` aparece únicamente como la propiedad de `remotePatterns.images`, no como configuración del host del servidor.

### `apps/client/tsconfig.json`

```json
{
  "exclude": [
    "node_modules"
  ],
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    "strictNullChecks": true
  },
  "include": [
    "src",
    "next.config.ts",
    "next-env.d.ts",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "proxy.ts"
  ]
}
```

La inclusión literal de `"proxy.ts"` apunta a la ubicación antigua en la raíz de `apps/client`; no apunta a `src/proxy.ts` como tal. El patrón `"src"` sí incluye recursivamente el Proxy actual. Esto es una diferencia de configuración del type-check, no evidencia de que Next no detecte `src/proxy.ts`.

### Configuración adicional observada

- Existe `apps/admin/next.config.ts`, que configura `transpilePackages`, `typescript.ignoreBuildErrors` y `allowedDevOrigins`; pertenece a otra aplicación y no se aplica a `apps/client`.
- No se encontró un `next.config.*` en la raíz del monorepo.
- No se encontró un archivo `.env.local` para Client. El archivo presente es `apps/client/.env`.
- Los artefactos `.next`, `dist`, `.turbo` y dependencias se excluyeron del árbol informativo.

## 4. Proxy y resolución por subdominio

### Archivos encontrados

| Ruta | Estado / función |
|---|---|
| `apps/client/src/proxy.ts` | Existe en el árbol actual. Implementa la resolución de hostname para Client. |
| `apps/client/proxy.ts` | No existe actualmente; Git lo reporta como eliminado (`D`). |
| `apps/admin/src/proxy.ts` | Existe, pero es el proxy de autenticación/autorización de Admin; no resuelve subdominios de restaurantes. |
| `middleware.ts` | No se encontró en las aplicaciones inspeccionadas. |

El único resolutor de **hostname a tenant** encontrado para Client es `apps/client/src/proxy.ts`. Las rutas dinámicas resuelven slugs de URL y los contextos client-side persisten el tenant, pero no inspeccionan el hostname.

### Código actual de `apps/client/src/proxy.ts`

```ts
import { NextRequest, NextResponse } from "next/server";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "admin",
  "app",
  "api",
  "dashboard",
  "docs",
  "support",
  "status",
]);

function shouldSkipPath(pathname: string) {
  if (
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/r" ||
    pathname.startsWith("/r/") ||
    pathname === "/cart" ||
    pathname.startsWith("/cart/") ||
    pathname.startsWith("/.well-known/")
  ) {
    return true;
  }

  // Evita reescribir archivos públicos, como iconos e imágenes.
  const lastSegment = pathname.split("/").pop() ?? "";
  return lastSegment.includes(".");
}

export function proxy(request: NextRequest) {
  const rootDomain = process.env.FOOD360_ROOT_DOMAIN?.trim().toLowerCase();

  console.log("[Food360 Proxy]", {
    hostname: request.nextUrl.hostname,
    pathname: request.nextUrl.pathname,
    rootDomain,
  });

  // Si no hay dominio configurado, no cambiamos el enrutamiento.
  if (!rootDomain) {
    return NextResponse.next();
  }

  const hostname = request.nextUrl.hostname.toLowerCase();
  const suffix = `.${rootDomain}`;

  // La raíz del dominio conserva su comportamiento actual.
  if (hostname === rootDomain) {
    return NextResponse.next();
  }

  // Solo resolvemos subdominios directos del dominio de Food360.
  if (!hostname.endsWith(suffix)) {
    return NextResponse.next();
  }

  const subdomain = hostname.slice(0, -suffix.length);
  console.log("[Food360 Proxy] Tenant detectado:", subdomain);

  // No convertir subdominios reservados en restaurantes.
  if (
    !subdomain ||
    subdomain.includes(".") ||
    RESERVED_SUBDOMAINS.has(subdomain)
  ) {
    return NextResponse.next();
  }

  if (shouldSkipPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  const pathname = request.nextUrl.pathname;

  // Ejemplos:
  // /                         -> /la-cocina-de-mary
  // /menu                     -> /la-cocina-de-mary/menu
  // /menu/producto/123        -> /la-cocina-de-mary/menu/producto/123
  url.pathname =
    pathname === "/" ? `/${subdomain}` : `/${subdomain}${pathname}`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-food360-tenant-subdomain", subdomain);

  return NextResponse.rewrite(url, {
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
```

### Convención y condiciones verificables

1. **Ubicación:** el proyecto usa `apps/client/src/app`. En esa estructura Next reconoce `src/proxy.ts`; por ubicación, el archivo actual está donde se espera. El archivo anterior `apps/client/proxy.ts` no está presente en el árbol actual.
2. **Exportación:** la función exportada se llama `proxy`, convención de Next 16.3.4. No depende de una exportación `middleware`.
3. **Matcher:** el patrón excluye `_next/static` y `_next/image`, pero no excluye `/menu`; esa ruta está cubierta por el matcher.
4. **Condiciones que evitan el rewrite:** variable de dominio vacía; hostname igual al root domain; host fuera del sufijo configurado; subdominio vacío, multinivel o reservado; rutas API, Next, `/r`, `/cart`, `.well-known` o cuyo último segmento contenga un punto.
5. **`/menu`:** no cumple ninguna condición de skip indicada. Con `FOOD360_ROOT_DOMAIN=localhost` y el hostname `la-cocina-de-mary.localhost`, el código deriva `la-cocina-de-mary`, reescribe internamente a `/la-cocina-de-mary/menu` y adjunta `x-food360-tenant-subdomain`.
6. **Interferencia de Next config:** no hay `rewrites`, `redirects`, `headers`, `basePath` o `trailingSlash` configurados en Client que expliquen una interferencia adicional. No se observó otro middleware de Client.
7. **Verificación de ejecución:** estáticamente la convención, el matcher y la ruta objetivo son compatibles. No se pudo comprobar si Next cargó este Proxy en el proceso que produjo el síntoma: no había servidor activo y no se generó una petición de prueba. Los `console.log` del Proxy son instrumentación presente en el código, no evidencia de que se ejecutara en esa sesión.

`apps/admin/src/proxy.ts` es un mecanismo aparte que renueva sesión Supabase y valida roles/permisos en Admin; no contiene `FOOD360_ROOT_DOMAIN`, `RESERVED_SUBDOMAINS` ni resolución de tenant por host. No es un proxy adicional de Client.

Código completo de `apps/admin/src/proxy.ts` (incluido para dejar identificado el otro archivo Proxy del monorepo):

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { hasPermission, type AppRole, type Permission } from "@food360/types";

import { ROUTE_PERMISSIONS } from "@/app/lib/permissions/route-permissions";

const ROLE_DEFAULT_REDIRECT: Record<AppRole, string> = {
  owner: "/",
  admin: "/",
  cashier: "/orders",
  waiter: "/orders",
  chef: "/kds",
};

export const ROLE_KDS_BACK_ROUTE: Record<AppRole, string> = {
  owner: "/",
  admin: "/",
  cashier: "/orders",
  waiter: "/orders",
  chef: "/menu",
};

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),

        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value }) => {
            response.cookies.set(name, value);
          });
        },
      },
    },
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const isLoginRoute = path === "/login";
  const isForgotPasswordRoute = path === "/forgot-password";
  const isResetPasswordRoute = path === "/reset-password";
  const isOnboardingRoute =
    path === "/onboarding" || path.startsWith("/onboarding/");
  const isInviteRoute = /^\/invite\/[^/]+$/.test(path);

  const isPublicRoute =
    isLoginRoute ||
    isForgotPasswordRoute ||
    isResetPasswordRoute ||
    isInviteRoute;

  // =========================================================
  // 1. USUARIO NO AUTENTICADO
  // =========================================================

  if (authError || !user) {
    if (isPublicRoute) {
      return response;
    }

    const redirectUrl = new URL("/login", request.url);

    if (path !== "/" && !path.startsWith("/.") && !path.includes(".")) {
      redirectUrl.searchParams.set("redirectTo", path);
    }

    return NextResponse.redirect(redirectUrl);
  }

  // =========================================================
  // 2. USUARIO AUTENTICADO
  // =========================================================

  // Los enlaces de invitación se pueden abrir aunque el usuario
  // aún no tenga una membresía activa.
  if (isInviteRoute) {
    return response;
  }

  // Consultamos todas las membresías. No usamos limit(1), porque
  // el usuario podría tener varias y alguna podría estar inactiva.
  const { data: memberships, error: membershipError } = await supabase
    .from("restaurant_members")
    .select("role, restaurant_id, is_active")
    .eq("user_id", user.id);

  // ---------------------------------------------------------
  // ERROR AL CONSULTAR MEMBRESÍAS
  // ---------------------------------------------------------

  if (membershipError) {
    console.error(
      "Error verificando las membresías del usuario:",
      membershipError,
    );

    // Permitimos que login/onboarding muestren el estado correspondiente.
    // Las rutas de negocio siguen bloqueadas hasta poder verificar acceso.
    if (isLoginRoute || isOnboardingRoute) {
      return response;
    }

    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("error", "membership_check_failed");

    return NextResponse.redirect(redirectUrl);
  }

  const activeMembership = (memberships ?? []).find(
    (membership) => membership.is_active,
  );

  // ---------------------------------------------------------
  // 3. USUARIO SIN NINGUNA MEMBRESÍA
  // ---------------------------------------------------------

  if (!activeMembership) {
    const hasInactiveMembership = (memberships ?? []).length > 0;

    // Tiene registros de membresía, pero ninguno está activo.
    // No debe crear un restaurante nuevo para saltarse la desactivación.
    if (hasInactiveMembership) {
      if (isLoginRoute) {
        return response;
      }

      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("error", "account_disabled");

      return NextResponse.redirect(redirectUrl);
    }

    // No tiene ninguna membresía: onboarding es la ruta permitida.
    if (isOnboardingRoute) {
      return response;
    }

    // Incluye /login: quien ya inició sesión y no tiene restaurante
    // debe continuar con el onboarding, no quedarse en el login.
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // =========================================================
  // 4. USUARIO CON MEMBRESÍA ACTIVA
  // =========================================================

  const role = activeMembership.role as AppRole;

  // Si ya tiene restaurante, no necesita crear otro desde onboarding.
  if (isOnboardingRoute || isLoginRoute) {
    return NextResponse.redirect(
      new URL(ROLE_DEFAULT_REDIRECT[role], request.url),
    );
  }

  // =========================================================
  // 4. VALIDAR PERMISOS DE RUTA
  // =========================================================

  const requiredPermission: Permission | undefined = ROUTE_PERMISSIONS[path];

  if (requiredPermission) {
    const allowed = hasPermission(role, requiredPermission);

    if (!allowed) {
      return NextResponse.redirect(
        new URL(ROLE_DEFAULT_REDIRECT[role], request.url),
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next|api|favicon.ico|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|json)$).*)",
  ],
};
```

## 5. Rutas de Next.js y componentes renderizados

| URL / ruta interna | Archivo de App Router | Componente / comportamiento |
|---|---|---|
| `/` | `src/app/page.tsx` | `HomePage` / hub de demostración. `HubContent` establece `setDemoTenant()` en un efecto. |
| `/menu` | `src/app/menu/page.tsx` | Exporta `MenuPage`, componente client. Sin `initialSlug`, restaurante enlazado ni `?restaurantSlug=...`, selecciona el catálogo demo. |
| `/[slug]` | `src/app/[slug]/page.tsx` | Resuelve perfil público por slug con `getPublicRestaurant`; renderiza `RestaurantPage`. |
| `/[slug]/menu` | `src/app/[slug]/menu/page.tsx` | Resuelve restaurante por slug, renderiza `TenantBinder`, `TableOriginBinder` y `MenuPage` con `initialSlug` y restaurante enlazado. |
| `/cart` | `src/app/cart/page.tsx` | Renderiza `CartPage`; consume `TenantContext`, `CartContext` y `SessionContext`. El Proxy excluye esta ruta. |
| `/r/[publicId]` | `src/app/r/[publicId]/page.tsx` | Resuelve ID público o código de mesa; redirige el código de mesa a la URL pública del restaurante/menú. El Proxy excluye `/r`. |

No existe una carpeta `src/app/[slug]/layout.tsx`; el layout aplicable es el root layout. No se detecta conflicto de precedencia entre `/menu` y `/[slug]/menu`: son patrones de distinta profundidad. La ruta estática `/menu` se selecciona para una petición ordinaria a `/menu`; el Proxy debe reescribir la petición de subdominio a `/<slug>/menu` para seleccionar la ruta dinámica.

### Resultado previsto por URL

- `http://localhost:3000/la-cocina-de-mary/menu`: Next selecciona directamente `/[slug]/menu`, valida el slug, consulta perfil y envía a `MenuPage` `initialSlug` más `restaurant`.
- `http://la-cocina-de-mary.localhost:3000/menu`: si se aplica el Proxy, Next recibe internamente `/la-cocina-de-mary/menu`; se renderiza el mismo archivo dinámico y se conserva la URL pública `/menu`. Si el Proxy no se ejecuta, la ruta que coincide es `/menu` y `MenuPage` no recibe slug salvo que haya query param.

### Código completo de la ruta dinámica de menú

`apps/client/src/app/[slug]/menu/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { Suspense } from "react";

import MenuPage from "@/app/menu/page";
import { TenantBinder } from "@/context/TenantContext";
import { TableOriginBinder } from "@/components/public/table-origin-binder";
import { getRestaurantUrl } from "@/lib/restaurant-url";
import {
  getPublicRestaurant,
  isPublicRestaurantSlug,
} from "@/services/public-restaurant.service";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isPublicRestaurantSlug(slug)) {
    return { title: "Carta no encontrada | Food360" };
  }

  const result = await getPublicRestaurant(slug);

  if (result.status !== "found") {
    return { title: "Carta no encontrada | Food360" };
  }

  return {
    title: `Carta de ${result.restaurant.name} | Food360`,
    description: `Consulta la carta de ${result.restaurant.name}.`,
  };
}

export default async function RestaurantMenuPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const tableCode = firstSearchParam(query.table)?.trim();

  if (!isPublicRestaurantSlug(slug)) {
    notFound();
  }

  const result = await getPublicRestaurant(slug);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "error") {
    throw new Error("No se pudo cargar el restaurante");
  }

  // Si el slug cambió, redirigimos a la URL canónica conservando ?table=.
  if (result.restaurant.slug !== slug) {
    const requestHeaders = await headers();

    const isSubdomain = Boolean(
      requestHeaders.get("x-food360-tenant-subdomain"),
    );

    redirect(
      getRestaurantUrl(
        result.restaurant.slug,
        "/menu",
        isSubdomain,
        requestHeaders,
        { table: tableCode },
      ),
    );
  }

  return (
    <>
      <TenantBinder restaurant={result.restaurant} />
      <Suspense fallback={null}>
        <TableOriginBinder />
      </Suspense>
      <MenuPage
        initialSlug={result.restaurant.slug}
        restaurant={result.restaurant}
      />
    </>
  );
}
```

### Perfil, layout y providers

`apps/client/src/app/[slug]/page.tsx` consulta `getPublicRestaurant(slug)`, valida el slug, usa `x-food360-tenant-subdomain` para escoger URL canónica si hay redirect y renderiza `RestaurantPage`. La página no carga productos. `RestaurantPage` enlaza a `/menu` cuando `isSubdomain=true` y a `/<slug>/menu` en el caso ordinario; también monta `TenantBinder`.

Código completo de `apps/client/src/app/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { getRestaurantUrl } from "@/lib/restaurant-url";
import { RestaurantPage } from "@/components/public/restaurant-page";
import {
  getPublicRestaurant,
  isPublicRestaurantSlug,
} from "@/services/public-restaurant.service";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isPublicRestaurantSlug(slug))
    return { title: "Página no encontrada | Food360" };

  const result = await getPublicRestaurant(slug);
  if (result.status !== "found")
    return { title: "Página no encontrada | Food360" };

  const { restaurant } = result;
  const description = restaurant.address
    ? `${restaurant.name}. Encuentra su información y datos de contacto en Food360.`
    : `${restaurant.name} en Food360.`;

  return {
    title: `${restaurant.name} | Food360`,
    description,
    openGraph: {
      title: `${restaurant.name} | Food360`,
      description,
      type: "website",
    },
  };
}

export default async function RestaurantSlugPage({ params }: PageProps) {
  const { slug } = await params;
  if (!isPublicRestaurantSlug(slug)) notFound();

  const result = await getPublicRestaurant(slug);
  if (result.status === "not-found") notFound();

  if (result.status === "error") {
    throw new Error("No se pudo obtener el perfil público del restaurante");
  }

  const requestHeaders = await headers();

  const isSubdomain = Boolean(requestHeaders.get("x-food360-tenant-subdomain"));

  if (result.restaurant.slug !== slug) {
    redirect(
      getRestaurantUrl(result.restaurant.slug, "", isSubdomain, requestHeaders),
    );
  }

  return (
    <RestaurantPage restaurant={result.restaurant} isSubdomain={isSubdomain} />
  );
}
```

La ruta `/r/[publicId]` también participa en resolución pública y en redirects de QR. Código completo de `apps/client/src/app/r/[publicId]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { RestaurantPage } from "@/components/public/restaurant-page";
import { getRestaurantUrl } from "@/lib/restaurant-url";
import { getPublicRestaurantById } from "@/services/public-restaurant.service";
import {
  getPublicTable,
  isTablePublicCode,
} from "@/services/public-table.service";

type PageProps = { params: Promise<{ publicId: string }> };

const RESTAURANT_PUBLIC_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRestaurantPublicId(value: string): boolean {
  return RESTAURANT_PUBLIC_ID_PATTERN.test(value);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { publicId } = await params;

  if (isTablePublicCode(publicId)) {
    const tableResult = await getPublicTable(publicId);
    if (tableResult.status !== "found") {
      return { title: "Página no encontrada | Food360" };
    }
    return { title: `${tableResult.table.restaurant.name} | Food360` };
  }

  if (isRestaurantPublicId(publicId)) {
    const result = await getPublicRestaurantById(publicId);
    if (result.status !== "found") {
      return { title: "Página no encontrada | Food360" };
    }
    return { title: `${result.restaurant.name} | Food360` };
  }

  return { title: "Página no encontrada | Food360" };
}

export default async function PermanentRestaurantPage({ params }: PageProps) {
  const { publicId } = await params;

  if (isTablePublicCode(publicId)) {
    const tableResult = await getPublicTable(publicId);

    if (tableResult.status === "not-found") notFound();
    if (tableResult.status === "error") {
      throw new Error("No se pudo resolver el código de mesa");
    }

    const requestHeaders = await headers();
    const isSubdomain = Boolean(
      requestHeaders.get("x-food360-tenant-subdomain"),
    );

    redirect(
      getRestaurantUrl(
        tableResult.table.restaurant.slug,
        "/menu",
        isSubdomain,
        requestHeaders,
        { table: tableResult.table.publicCode },
      ),
    );
  }

  if (!isRestaurantPublicId(publicId)) {
    notFound();
  }

  const result = await getPublicRestaurantById(publicId);
  if (result.status === "not-found") notFound();
  if (result.status === "error") {
    throw new Error("No se pudo obtener el perfil público del restaurante");
  }

  const requestHeaders = await headers();
  const isSubdomain = Boolean(requestHeaders.get("x-food360-tenant-subdomain"));

  return (
    <RestaurantPage restaurant={result.restaurant} isSubdomain={isSubdomain} />
  );
}
```

Código de `apps/client/src/app/layout.tsx`:

```tsx
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
          <div className="relative flex min-h-dvh w-full max-w-107.5 flex-col overflow-hidden bg-white shadow-none transition-colors duration-300 dark:bg-zinc-950 sm:max-w-150 sm:rounded-[30px] sm:shadow-[0_25px_90px_rgba(0,0,0,0.16)] lg:max-w-180">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
```

`apps/client/src/app/providers.tsx` envuelve la aplicación con `ThemeProvider > TenantProvider > SessionProvider > CartProvider`. No hay inicializador de tenant basado en `headers()` en el layout; el tenant real llega a los componentes mediante props de las páginas dinámicas y se enlaza en cliente.

## 6. TenantContext, servicios y carga de productos

### Archivos relacionados encontrados

- `src/app/menu/page.tsx` (`MenuPage`): elige demo o API según el slug disponible.
- `src/app/[slug]/menu/page.tsx`: obtiene perfil en servidor y entrega `initialSlug`/`restaurant`.
- `src/services/public-menu.service.ts`: construye endpoint de menú y valida el JSON.
- `src/services/public-restaurant.service.ts`: busca el restaurante y valida su respuesta.
- `src/context/TenantContext.tsx`: `TenantProvider`, `useTenant`, `TenantBinder`, `setTenant` y `setDemoTenant`.
- `src/app/providers.tsx`: monta el provider.
- `src/components/public/table-origin-binder.tsx`: usa tenant resuelto para validar el código QR de mesa; no carga el catálogo.
- `src/context/SessionContext.tsx` y `src/context/CartContext.tsx`: consumen tenant para particionar sesión y carrito por restaurante.
- `src/app/page.tsx`: el hub llama a `setDemoTenant()`.
- `src/app/cart/page.tsx`: lee slug/ID de tenant y forma el enlace de regreso al menú.
- `src/components/public/restaurant-page.tsx`: monta `TenantBinder` y selecciona enlace de menú según `isSubdomain`.
- `src/lib/restaurant-url.ts`: forma URL interna o URL canónica con subdominio; no resuelve el host entrante.

No existe un componente llamado `TenantBinder` en un archivo separado: está exportado desde `TenantContext.tsx`.

Código completo de `apps/client/src/context/TenantContext.tsx`:

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { PublicRestaurant } from "@food360/types";

import {
  readJsonSessionStorage,
  writeJsonSessionStorage,
  removeSessionStorage,
} from "@/lib/session-storage";

export const DEMO_TENANT_SCOPE = "demo";
const LAST_TENANT_KEY = "food360.last-tenant";

export type TenantIdentity = {
  restaurantPublicId: string;
  slug: string;
  name: string;
};

type TenantStatus = "idle" | "ready" | "missing";

interface TenantContextType {
  restaurantPublicId: string | null;
  slug: string | null;
  name: string | null;
  status: TenantStatus;
  isReady: boolean;
  setTenant: (tenant: TenantIdentity) => void;
  setDemoTenant: () => void;
  clearTenant: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenantState] = useState<TenantIdentity | null>(null);
  const [status, setStatus] = useState<TenantStatus>("idle");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const stored = readJsonSessionStorage<TenantIdentity>(LAST_TENANT_KEY);
      if (
        stored &&
        typeof stored.restaurantPublicId === "string" &&
        stored.restaurantPublicId !== DEMO_TENANT_SCOPE &&
        typeof stored.slug === "string" &&
        typeof stored.name === "string"
      ) {
        setTenantState(stored);
        setStatus("ready");
      } else {
        setStatus("missing");
      }
      setIsHydrated(true);
    });
  }, []);

  const setTenant = useCallback((next: TenantIdentity) => {
    setTenantState(next);
    setStatus("ready");
    writeJsonSessionStorage(LAST_TENANT_KEY, next);
  }, []);

  const setDemoTenant = useCallback(() => {
    const demo: TenantIdentity = {
      restaurantPublicId: DEMO_TENANT_SCOPE,
      slug: DEMO_TENANT_SCOPE,
      name: "360 food",
    };
    setTenantState(demo);
    setStatus("ready");
    // Demo must not overwrite a real last-tenant used by /cart.
  }, []);

  const clearTenant = useCallback(() => {
    setTenantState(null);
    setStatus("missing");
    removeSessionStorage(LAST_TENANT_KEY);
  }, []);

  const value: TenantContextType = {
    restaurantPublicId: tenant?.restaurantPublicId ?? null,
    slug: tenant?.slug ?? null,
    name: tenant?.name ?? null,
    status: isHydrated ? status : "idle",
    isReady: isHydrated && status === "ready" && tenant !== null,
    setTenant,
    setDemoTenant,
    clearTenant,
  };

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

export function TenantBinder({
  restaurant,
}: {
  restaurant: PublicRestaurant;
}) {
  const { setTenant } = useTenant();

  useEffect(() => {
    setTenant({
      restaurantPublicId: restaurant.publicId,
      slug: restaurant.slug,
      name: restaurant.name,
    });
  }, [restaurant.publicId, restaurant.slug, restaurant.name, setTenant]);

  return null;
}
```

`TableOriginBinder` es el componente que usa el tenant ya enlazado para resolver un código `?table=...`; no establece el slug ni carga productos. Código completo de `apps/client/src/components/public/table-origin-binder.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { useSession } from "@/context/SessionContext";
import { useTenant } from "@/context/TenantContext";
import {
  getPublicTable,
  isTablePublicCode,
} from "@/services/public-table.service";

/**
 * Reads ?table=t_… from the URL, validates it against the current restaurant,
 * and stores DINE_IN + public_code in the namespaced session.
 */
export function TableOriginBinder() {
  const searchParams = useSearchParams();
  const { restaurantPublicId, isReady: tenantReady } = useTenant();
  const { setTableOrigin, isReady: sessionReady } = useSession();

  useEffect(() => {
    if (!tenantReady || !sessionReady || !restaurantPublicId) return;

    const tableCode = searchParams.get("table")?.trim();
    if (!tableCode || !isTablePublicCode(tableCode)) return;

    let active = true;

    void (async () => {
      const result = await getPublicTable(tableCode);
      if (!active) return;
      if (result.status !== "found") return;
      if (result.table.restaurant.publicId !== restaurantPublicId) return;

      setTableOrigin(result.table.publicCode, result.table.tableNumber);
    })();

    return () => {
      active = false;
    };
  }, [
    searchParams,
    tenantReady,
    sessionReady,
    restaurantPublicId,
    setTableOrigin,
  ]);

  return null;
}
```

### Resolución exacta dentro de `MenuPage`

`src/app/menu/page.tsx` exporta un componente cliente `MenuPage` que acepta props opcionales `initialSlug` y `restaurant` (`boundRestaurant`). El siguiente fragmento corresponde íntegramente al efecto que elige demo o API y mapea los datos. Se omiten los otros efectos de animación y el JSX de presentación, que no seleccionan el origen del catálogo.

```tsx
useEffect(() => {
  let active = true;

  const params = new URLSearchParams(window.location.search);
  const slug =
    boundRestaurant?.slug ||
    initialSlug?.trim() ||
    params.get("restaurantSlug")?.trim();

  async function loadPublicMenu() {
    setIsLoadingPublicMenu(true);
    setPublicMenuError(null);

    try {
      // La ruta antigua /menu conserva su funcionamiento de demostración.
      // Las páginas de restaurantes utilizan exclusivamente datos reales.
      if (!slug) {
        if (!active) return;

        setCategories(demoCategories);
        setMenuItems(demoMenuItems);
        setPopularDishes(demoPopularDishes);
        setMenuRestaurantName(restaurant.name);
        setActiveCategory(demoCategories[0]?.id ?? "summer-bites");
        setIsPublicRestaurantMenu(false);
        return;
      }

      setIsPublicRestaurantMenu(true);

      if (boundRestaurant) {
        const menu = await getPublicMenu(slug);
        if (!active) return;

        const nextCategories: CategoryInfo[] = menu.categories.map(
          (category) => ({
            id: category.id as MenuCategory,
            label: category.label,
          }),
        );

        const nextMenuItems: MenuItem[] = menu.products.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.categoryId as MenuCategory,
          image: product.image || "/food-placeholder.svg",
          available: product.available,
          isPopular: false,
        }));

        setCategories(nextCategories);
        setMenuItems(nextMenuItems);
        setPopularDishes([]);
        setMenuRestaurantName(boundRestaurant.name);
        setActiveCategory(nextCategories[0]?.id ?? "");
        return;
      }

      const [menu, restaurantResult] = await Promise.all([
        getPublicMenu(slug),
        getPublicRestaurant(slug),
      ]);

      if (!active) return;

      if (restaurantResult.status !== "found") {
        throw new Error(
          restaurantResult.status === "not-found"
            ? "El restaurante no existe o su página no está publicada."
            : "No se pudo cargar la información del restaurante.",
        );
      }

      setTenant({
        restaurantPublicId: restaurantResult.restaurant.publicId,
        slug: restaurantResult.restaurant.slug,
        name: restaurantResult.restaurant.name,
      });

      const nextCategories: CategoryInfo[] = menu.categories.map(
        (category) => ({
          id: category.id as MenuCategory,
          label: category.label,
        }),
      );

      const nextMenuItems: MenuItem[] = menu.products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.categoryId as MenuCategory,
        image: product.image || "/food-placeholder.svg",
        available: product.available,
        isPopular: false,
      }));

      setCategories(nextCategories);
      setMenuItems(nextMenuItems);

      // La API pública todavía no proporciona popularidad.
      // No marcamos productos como populares sin información real.
      setPopularDishes([]);

      setMenuRestaurantName(restaurantResult.restaurant.name);
      setActiveCategory(nextCategories[0]?.id ?? "");
    } catch (error: unknown) {
      if (!active) return;

      setCategories([]);
      setMenuItems([]);
      setPopularDishes([]);

      setPublicMenuError(
        error instanceof Error
          ? error.message
          : "No se pudo cargar la carta del restaurante.",
      );
    } finally {
      if (active) {
        setIsLoadingPublicMenu(false);
      }
    }
  }

  void loadPublicMenu();

  return () => {
    active = false;
  };
}, [initialSlug, boundRestaurant, setTenant]);
```

El efecto anterior es el selector de fuente: **la única rama explícita que llena productos demo es `if (!slug)`**, que usa `categories`, `menuItems` y `popularDishes` importados desde `src/data/menu.ts`. Con slug, los errores vacían los productos y muestran el estado de error; no hay fallback al demo. Otro efecto de `MenuPage` invoca `setDemoTenant()` si no encuentra `boundRestaurant`, `initialSlug` ni `?restaurantSlug=...`; eso cambia el contexto, no la condición del catálogo.

En `/[slug]/menu`, el servidor valida y resuelve el restaurante antes de montar `MenuPage`, y pasa ambas props; por tanto ese componente entra en su rama de menú público enlazado y llama a `getPublicMenu(slug)`. En el `/menu` estático sin query, `initialSlug` y `boundRestaurant` son `undefined`; la rama demo se cumple.

`TenantContext` restaura en `sessionStorage` el último tenant válido. Esa restauración no selecciona productos por sí sola: no cambia `initialSlug` ni `boundRestaurant`. `setDemoTenant` usa el ID/slug `"demo"` y no persiste encima del último tenant real. `TenantBinder` escribe el tenant real tras el montaje cliente.

### Servicios frontend

`public-menu.service.ts` espera `{ success: true, data: { categories: [...], products: [...] } }`. La URL es `${NEXT_PUBLIC_API_URL}/public/restaurants/<slug>/menu`, añadiendo `/api/v1` solo si falta. Lanza error por respuesta HTTP no exitosa, JSON inválido o esquema inválido; no transforma fallos de red en demo. Implementación inspeccionada: [`apps/client/src/services/public-menu.service.ts`](apps/client/src/services/public-menu.service.ts).

`public-restaurant.service.ts` usa el mismo `NEXT_PUBLIC_API_URL`, valida el slug con `^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$` (y excluye `menu`, `cart`, `r`), y devuelve `found`, `not-found` o `error`. El servicio server-side es quien obtiene el perfil antes de servir `/[slug]/menu`.

Código completo de `apps/client/src/services/public-menu.service.ts`:

```ts
export interface PublicMenuCategory {
  id: string;
  label: string;
  sortOrder: number;
}

export interface PublicMenuProduct {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
}

export interface PublicMenu {
  categories: PublicMenuCategory[];
  products: PublicMenuProduct[];
}

interface PublicMenuResponse {
  success: boolean;
  data?: PublicMenu;
  error?: string;
}

function getPublicMenuEndpoint(slug: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!apiUrl) {
    throw new Error(
      "Falta configurar NEXT_PUBLIC_API_URL para cargar la carta.",
    );
  }

  const baseUrl = apiUrl.replace(/\/+$/, "");

  const apiBase = baseUrl.endsWith("/api/v1") ? baseUrl : `${baseUrl}/api/v1`;

  return `${apiBase}/public/restaurants/${encodeURIComponent(slug)}/menu`;
}

function isPublicMenuResponse(
  value: unknown,
): value is PublicMenuResponse & { data: PublicMenu } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as PublicMenuResponse;
  const data = response.data;

  if (
    response.success !== true ||
    !data ||
    !Array.isArray(data.categories) ||
    !Array.isArray(data.products)
  ) {
    return false;
  }

  const validCategories = data.categories.every(
    (category) =>
      typeof category.id === "string" &&
      typeof category.label === "string" &&
      typeof category.sortOrder === "number",
  );

  const validProducts = data.products.every(
    (product) =>
      typeof product.id === "string" &&
      typeof product.categoryId === "string" &&
      typeof product.name === "string" &&
      typeof product.description === "string" &&
      typeof product.price === "number" &&
      Number.isFinite(product.price) &&
      typeof product.image === "string" &&
      typeof product.available === "boolean",
  );

  return validCategories && validProducts;
}

export async function getPublicMenu(slug: string): Promise<PublicMenu> {
  if (!slug.trim()) {
    throw new Error("No se especificó el restaurante.");
  }

  const endpoint = getPublicMenuEndpoint(slug);

  let response: Response;

  try {
    response = await fetch(endpoint, {
      cache: "no-store",
    });
  } catch {
    throw new Error("No se pudo conectar con el servicio de la carta.");
  }

  if (response.status === 404) {
    throw new Error(
      "No encontramos la carta de este restaurante o su página no está publicada.",
    );
  }

  if (!response.ok) {
    throw new Error(
      `No se pudo cargar la carta del restaurante (${response.status}).`,
    );
  }

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new Error("El servicio de la carta devolvió una respuesta inválida.");
  }

  if (!isPublicMenuResponse(result)) {
    throw new Error("La estructura de la carta recibida no es válida.");
  }

  return result.data;
}
```

Código completo de `apps/client/src/services/public-restaurant.service.ts`:

```ts
import type {
  PublicRestaurant,
  PublicRestaurantResponse,
} from "@food360/types";

export type PublicRestaurantResult =
  | { status: "found"; restaurant: PublicRestaurant }
  | { status: "not-found" }
  | { status: "error" };

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

export function isPublicRestaurantSlug(value: string): boolean {
  return SLUG_PATTERN.test(value) && !["menu", "cart", "r"].includes(value);
}

async function fetchPublicRestaurant(
  path: string,
): Promise<PublicRestaurantResult> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

  if (!baseUrl) return { status: "error" };

  const endpoint = baseUrl.endsWith("/api/v1")
    ? `${baseUrl}/public/restaurants/${path}`
    : `${baseUrl}/api/v1/public/restaurants/${path}`;

  try {
    const response = await fetch(endpoint, { cache: "no-store" });
    if (response.status === 404) return { status: "not-found" };
    if (!response.ok) return { status: "error" };

    const result: unknown = await response.json();
    if (!isPublicRestaurantResponse(result)) {
      return { status: "error" };
    }

    return { status: "found", restaurant: result.data };
  } catch {
    return { status: "error" };
  }
}

function isPublicRestaurantResponse(
  value: unknown,
): value is PublicRestaurantResponse & { data: PublicRestaurant } {
  if (!value || typeof value !== "object") return false;
  const response = value as Partial<PublicRestaurantResponse>;
  const data = response.data;
  if (!response.success || !data || typeof data !== "object") return false;
  return (
    typeof data.publicId === "string" &&
    typeof data.name === "string" &&
    typeof data.slug === "string" &&
    (typeof data.phone === "string" || data.phone === null) &&
    (typeof data.address === "string" || data.address === null) &&
    (typeof data.currency === "string" || data.currency === null) &&
    [data.instagramUrl, data.tiktokUrl, data.whatsappUrl, data.googleBusinessUrl].every(
      (value) => value === undefined || typeof value === "string" || value === null,
    ) &&
    !!data.wifi &&
    (typeof data.wifi.ssid === "string" || data.wifi.ssid === null) &&
    (typeof data.wifi.password === "string" || data.wifi.password === null)
  );
}

export async function getPublicRestaurant(
  slug: string,
): Promise<PublicRestaurantResult> {
  if (!isPublicRestaurantSlug(slug)) return { status: "not-found" };
  return fetchPublicRestaurant(encodeURIComponent(slug));
}

export async function getPublicRestaurantById(
  publicId: string,
): Promise<PublicRestaurantResult> {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      publicId,
    )
  ) {
    return { status: "not-found" };
  }
  return fetchPublicRestaurant(`id/${encodeURIComponent(publicId)}`);
}
```

## 7. Contrato de la API pública

### Montaje y CORS

`apps/api/src/server.ts` aplica `cors()` global sin opciones adicionales y monta:

```ts
.use("/api/v1/public/restaurants", publicRestaurantsRouter)
```

La ruta es pública (no lleva `verifyAuth`), a diferencia de las rutas privadas. El script de API es `cross-env PORT=3002 tsx watch src/index.ts`; `src/index.ts` carga `dotenv/config` y escucha en `process.env.PORT || 3002`.

Como `MenuPage` es client component y `getPublicMenu` se llama desde un `useEffect`, la petición al endpoint del API puede ser cross-origin desde el navegador. El middleware Express `cors()` predeterminado es el ajuste CORS comprobado en el servidor. La disponibilidad real de la respuesta CORS no se pudo verificar sin API escuchando.

### Ruta y datos

`apps/api/src/routes/public-restaurants.routes.ts` implementa `GET /:slug/menu`, montado como:

```text
GET /api/v1/public/restaurants/:slug/menu
```

La ruta valida slug, busca un restaurante publicado por slug y luego alias si el slug actual no existe; consulta categorías activas y productos activos que pertenecen a categorías activas. Incluye agotados y establece `available` como `!is_out_of_stock`. Accede a Supabase mediante `supabaseAdmin`, importado de `@food360/database`; la lectura del archivo de configuración/servicio no requirió ni expuso credenciales.

Forma de respuesta producida:

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "string",
        "label": "string",
        "sortOrder": 0
      }
    ],
    "products": [
      {
        "id": "string",
        "categoryId": "string",
        "name": "string",
        "description": "string",
        "price": 0,
        "image": "string",
        "available": true
      }
    ]
  }
}
```

En el mapper Express, `description` e `image` se vuelven `""` cuando DB entrega null; `price` se convierte con `Number(...)`; `id` y `categoryId` conservan sus identificadores. El frontend valida precisamente esos nombres y tipos en `isPublicMenuResponse`. Por contrato fuente, la estructura coincide. No se verificaron en vivo las cantidades (4 categorías / 8 productos) ni los UUID reportados en el contexto, porque el API local no estaba activo.

El mismo router también expone `GET /:slug` para perfil y `GET /id/:publicId`; el archivo `apps/api/src/lib/public-restaurant.ts` es el helper del perfil, no el repositorio del menú. El handler del menú consulta directamente Supabase desde `public-restaurants.routes.ts`.

Handler completo de `GET /:slug/menu` en `apps/api/src/routes/public-restaurants.routes.ts`:

```ts
publicRestaurantsRouter.get("/:slug/menu", async (req, res) => {
  res.set("Cache-Control", "no-store");

  const rawSlug = req.params.slug;
  const slug = typeof rawSlug === "string" ? rawSlug : "";

  if (!slug || !SLUG_PATTERN.test(slug) || RESERVED_SLUGS.has(slug)) {
    return res.status(400).json({
      success: false,
      error: "El slug no es válido",
    });
  }

  try {
    // 1. Buscar el restaurante por su slug actual.
    const { data: currentRestaurant, error: restaurantError } =
      await supabaseAdmin
        .from("restaurants")
        .select("id")
        .eq("slug", slug)
        .eq("public_page_published", true)
        .maybeSingle();

    if (restaurantError) {
      console.error(
        "Error buscando restaurante para menú público:",
        restaurantError.code,
      );

      if (isSchemaNotReady(restaurantError.code)) {
        return sendSchemaError(res);
      }

      return res.status(500).json({
        success: false,
        error: "No se pudo cargar la carta",
      });
    }

    let restaurantId = currentRestaurant?.id ?? null;

    // 2. Si el slug es antiguo, resolver el alias.
    if (!restaurantId) {
      const { data: alias, error: aliasError } = await supabaseAdmin
        .from("restaurant_slug_aliases")
        .select("restaurant_id")
        .eq("slug", slug)
        .maybeSingle();

      if (aliasError) {
        console.error(
          "Error buscando alias para menú público:",
          aliasError.code,
        );

        if (isSchemaNotReady(aliasError.code)) {
          return sendSchemaError(res);
        }

        return res.status(500).json({
          success: false,
          error: "No se pudo resolver la carta",
        });
      }

      if (alias) {
        const { data: aliasedRestaurant, error: aliasedRestaurantError } =
          await supabaseAdmin
            .from("restaurants")
            .select("id")
            .eq("id", alias.restaurant_id)
            .eq("public_page_published", true)
            .maybeSingle();

        if (aliasedRestaurantError) {
          console.error(
            "Error buscando restaurante por alias:",
            aliasedRestaurantError.code,
          );

          return res
            .status(isSchemaNotReady(aliasedRestaurantError.code) ? 503 : 500)
            .json({
              success: false,
              error: "No se pudo cargar la carta",
            });
        }

        restaurantId = aliasedRestaurant?.id ?? null;
      }
    }

    if (!restaurantId) {
      return res.status(404).json({
        success: false,
        error: "No se encontró la carta de un restaurante publicado",
      });
    }

    // 3. Obtener las categorías activas del restaurante.
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from("categories")
      .select("id, name, sort_order")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (categoriesError) {
      console.error(
        "Error consultando categorías públicas:",
        categoriesError.code,
      );

      if (isSchemaNotReady(categoriesError.code)) {
        return sendSchemaError(res);
      }

      return res.status(500).json({
        success: false,
        error: "No se pudieron cargar las categorías",
      });
    }

    // 4. Obtener productos activos que pertenecen a categorías activas.
    // Los productos agotados se incluyen para que Client pueda indicarlo.
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select(
        `
        id,
        category_id,
        name,
        description,
        price,
        image_url,
        is_out_of_stock,
        category:categories!inner (
          id,
          is_active
        )
      `,
      )
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .eq("categories.is_active", true)
      .order("name", { ascending: true });

    if (productsError) {
      console.error(
        "Error consultando productos públicos:",
        productsError.code,
      );

      if (isSchemaNotReady(productsError.code)) {
        return sendSchemaError(res);
      }

      return res.status(500).json({
        success: false,
        error: "No se pudieron cargar los productos",
      });
    }

    // 5. Devolver únicamente los campos que necesita la carta pública.
    return res.json({
      success: true,
      data: {
        categories: (categories ?? []).map((category) => ({
          id: category.id,
          label: category.name,
          sortOrder: category.sort_order,
        })),

        products: (products ?? []).map((product) => ({
          id: product.id,
          categoryId: product.category_id,
          name: product.name,
          description: product.description ?? "",
          price: Number(product.price),
          image: product.image_url ?? "",
          available: !product.is_out_of_stock,
        })),
      },
    });
  } catch (error) {
    console.error("Error en GET /public/restaurants/:slug/menu:", error);

    return res.status(500).json({
      success: false,
      error: "No se pudo cargar la carta",
    });
  }
});
```

## 8. Variables de entorno (saneadas)

Se enumeran las variables declaradas en archivos `.env` encontrados. Para variables diferentes a `FOOD360_ROOT_DOMAIN` y `NEXT_PUBLIC_API_URL`, se omiten valores deliberadamente.

### `apps/client/.env`

| Variable | Definida | Valor permitido |
|---|---:|---|
| `NEXT_PUBLIC_API_URL` | Sí | `http://localhost:3002/api/v1` |
| `FOOD360_ROOT_DOMAIN` | Sí | `localhost` |

`apps/client/.env.local`, `.env.development`, `.env.development.local` y `.env.production` no existen en el árbol inspeccionado. No se encontró `.env` en la raíz.

### Otros archivos `.env` hallados

- `apps/api/.env`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT`, `FOOD360_ADMIN_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_NAME`, `SMTP_FROM_EMAIL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. No se muestran valores.
- `apps/admin/.env`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`. No se muestran valores.

## 9. Diagnóstico de ejecución y Git

- Directorio actual de inspección: raíz `J:\Mis proyectos\food360`.
- Comando de Client definido: `next dev -p 3000`; README: `pnpm --filter client dev` desde la raíz.
- Comando de API definido: `cross-env PORT=3002 tsx watch src/index.ts`.
- No había listener en `3000` ni `3002` durante la inspección; no se ejecutaron migraciones, no se instalaron dependencias ni se inició otro servidor.
- La detección de raíz Next se configura por paquete: `apps/client/next.config.ts` está junto a `apps/client/package.json`; la estructura App Router está en `apps/client/src/app`. No hay `outputFileTracingRoot` ni `turbopack.root` en el `next.config.ts` inspeccionado.
- La ejecución real previa y el comando exacto usado para producir el síntoma no se pueden comprobar con los archivos del repo.

`git status --short` capturado antes de crear este informe:

```text
 M apps/api/package.json
 M apps/api/src/__tests__/server.test.ts
 M apps/api/src/routes/public-restaurants.routes.ts
 M apps/api/src/server.ts
 M apps/client/next-env.d.ts
 D apps/client/proxy.ts
 M apps/client/src/app/[slug]/menu/page.tsx
 M apps/client/src/app/cart/page.tsx
 M apps/client/src/app/globals.css
 M apps/client/src/app/layout.tsx
 M apps/client/src/app/menu/page.tsx
 M apps/client/src/app/page.tsx
 M apps/client/src/app/providers.tsx
 M apps/client/src/app/r/[publicId]/page.tsx
 M apps/client/src/components/cart/cart-floating-bar.tsx
 M apps/client/src/components/cart/order-summary.tsx
 M apps/client/src/components/home/header.tsx
 M apps/client/src/components/menu/menu-top-header.tsx
 M apps/client/src/components/public/restaurant-page.tsx
 M apps/client/src/context/CartContext.tsx
 M apps/client/src/context/SessionContext.tsx
 M apps/client/src/data/restaurant.ts
 M apps/client/src/lib/formatters.ts
 M apps/client/src/lib/restaurant-url.ts
 M apps/client/src/services/order.service.ts
 M apps/client/src/types/index.ts
 M apps/client/tsconfig.json
 M packages/types/src/public-restaurant.ts
?? apps/api/sql/20261101_tables_public_code_unique.sql
?? apps/api/sql/20261103_create_public_order_rpc.sql
?? apps/api/src/__tests__/public-orders.test.ts
?? apps/api/src/lib/public-order.ts
?? apps/api/src/lib/public-restaurant.ts
?? apps/api/src/lib/rate-limiter.ts
?? apps/api/src/routes/public-orders.routes.ts
?? apps/api/src/routes/public-tables.routes.ts
?? apps/client/src/components/public/table-origin-binder.tsx
?? apps/client/src/context/TenantContext.tsx
?? apps/client/src/lib/session-storage.ts
?? apps/client/src/proxy.ts
?? apps/client/src/services/public-table.service.ts
?? food360-client-architecture.txt
?? food360-client-flow-review.txt
```

## 10. Hechos comprobados e hipótesis

### Hechos del código actual

1. El menú estático `/menu` conserva deliberadamente el modo demo. Si no recibe `boundRestaurant`, `initialSlug` ni `?restaurantSlug=...`, asigna `demoCategories`, `demoMenuItems` y `demoPopularDishes` desde `src/data/menu.ts`.
2. `/[slug]/menu` resuelve el perfil en servidor, luego invoca el mismo `MenuPage` con `initialSlug` y `restaurant`; esa ruta no cae en la condición `if (!slug)`.
3. El Proxy actual sí contiene una reescritura que transforma `/menu` en `/<subdominio>/menu`, y `/menu` pasa sus condiciones de matcher y `shouldSkipPath`.
4. La variable que el Proxy necesita está definida actualmente como `FOOD360_ROOT_DOMAIN=localhost` en `apps/client/.env`.
5. Existe un cambio pendiente que elimina `apps/client/proxy.ts` e incorpora `apps/client/src/proxy.ts`; esta última es la ubicación compatible con la estructura `src/app`.
6. No existe otra configuración de rewrites/redirects de Client que transforme esas rutas.
7. El endpoint de API y su payload coinciden estructuralmente con lo que valida el servicio frontend.
8. En esta sesión no se probó la reescritura real ni el endpoint HTTP porque no había procesos locales activos.

### Hipótesis que explicarían el síntoma, sin dar ninguna por confirmada

1. **El Proxy no está cargado en el proceso Next que atiende la petición.** Si ocurre, `/menu` selecciona la página estática y, sin slug/prop/query, el catálogo demo es el resultado esperado del código. La ubicación presente es correcta por convención, pero falta la observación de ejecución (logs del Proxy o petición a servidor activo).
2. **El servidor se inició antes de mover el archivo o conserva otro build/proceso.** El estado actual del disco no acredita qué archivos cargó un proceso anterior. No había servidor que permitiera contrastarlo.
3. **El host recibido o el entorno efectivo difiere del esperado.** El Proxy hace comparación de sufijo literal con el `request.nextUrl.hostname` y necesita `FOOD360_ROOT_DOMAIN`. No se obtuvo el hostname de una petición real. La variable existe en `.env`, pero no se verificó el entorno del proceso.
4. **Invocación indirecta de Turbo con variable de shell filtrada.** `FOOD360_ROOT_DOMAIN` no aparece en `turbo.json:globalEnv`. Puede importar si el valor se exporta solo en el proceso padre y Turbo lo filtra; el `.env` específico de Client sí está presente, por lo que este punto no prueba una ausencia efectiva.
5. **Una URL de menú con slug en query** evita la demo de `/menu` y usa el servicio público, pero el escenario descrito no indica ese query param y no sustituye al rewrite requerido.

### Conclusión técnica

La selección del catálogo demo queda explicada exactamente por esta condición de `MenuPage`: llegar a la página estática `/menu` sin slug, restaurante enlazado ni `restaurantSlug` de query. A la inversa, el flujo real del subdominio depende de que el Proxy transforme internamente `/menu` a `/<slug>/menu`; el árbol actual contiene la implementación esperada para hacerlo y su matcher no excluye `/menu`. Por tanto, el indicio principal a resolver es la **ejecución/carga efectiva del Proxy**, no una incompatibilidad de respuesta API ni una ruta que designe el catálogo demo dentro de `/[slug]/menu`.

Para cerrar el diagnóstico de runtime se deben contrastar en el proceso iniciado: hostname/path de `[Food360 Proxy]`, existencia del header `x-food360-tenant-subdomain` al entrar en la página dinámica, y petición del navegador a `http://localhost:3002/api/v1/public/restaurants/<slug>/menu`. Esos datos no están disponibles en esta inspección.

### Archivos prioritarios para revisar al resolver

1. `apps/client/src/proxy.ts` y el log que confirma su ejecución.
2. `apps/client/package.json`, `apps/client/tsconfig.json` y directorio efectivo de ejecución de Next.
3. `apps/client/.env` / entorno efectivo del proceso (`FOOD360_ROOT_DOMAIN`).
4. `apps/client/src/app/[slug]/menu/page.tsx` (props que deben llegar a `MenuPage`).
5. `apps/client/src/app/menu/page.tsx` (decisión demo/API y estado de carga).
6. `apps/client/src/services/public-menu.service.ts` y `apps/api/src/routes/public-restaurants.routes.ts` (endpoint, CORS y payload).
7. `apps/client/src/app/cart/page.tsx`: el enlace de retorno usa `/<slug>/menu` cuando existe slug, sin comprobar si el navegador sigue en subdominio; en ese host el Proxy volvería a prefijar la ruta. Es un posible problema separado del primer acceso a `/menu`, no se reprodujo.
