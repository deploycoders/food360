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

  // Preferimos el hostname reenviado por un proxy inverso.
  // En desarrollo local normalmente utilizaremos Host.
  const hostHeader = (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    ""
  )
    .split(",")[0]
    .trim();

  let hostname = request.nextUrl.hostname.toLowerCase();

  // Extraemos el hostname sin puerto.
  if (hostHeader) {
    try {
      hostname = new URL(`http://${hostHeader}`).hostname.toLowerCase();
    } catch {
      console.error("[Food360 Proxy] Hostname inválido:", hostHeader);
      return NextResponse.next();
    }
  }

  console.log("[Food360 Proxy] Incoming request:", {
    url: request.url,
    hostHeader,
    nextUrlHostname: request.nextUrl.hostname,
    resolvedHostname: hostname,
    rootDomain,
  });

  // Si no hay dominio configurado, no cambiamos el enrutamiento.
  if (!rootDomain) {
    console.warn("[Food360 Proxy] FOOD360_ROOT_DOMAIN no está configurado.");
    return NextResponse.next();
  }

  // La raíz del dominio conserva su comportamiento actual.
  if (hostname === rootDomain) {
    return NextResponse.next();
  }

  // Solo resolvemos subdominios directos del dominio de Food360.
  const suffix = `.${rootDomain}`;

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

  // /                         -> /la-cocina-de-mary
  // /menu                     -> /la-cocina-de-mary/menu
  // /menu/producto/123        -> /la-cocina-de-mary/menu/producto/123
  url.pathname =
    pathname === "/" ? `/${subdomain}` : `/${subdomain}${pathname}`;

  console.log("[Food360 Proxy] Rewrite:", {
    from: pathname,
    to: url.pathname,
    tenant: subdomain,
  });

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
