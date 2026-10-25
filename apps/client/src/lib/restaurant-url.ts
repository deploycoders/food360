type HeaderReader = {
  get(name: string): string | null;
};

export function getRestaurantUrl(
  slug: string,
  pathname: "" | "/menu",
  isSubdomain: boolean,
  requestHeaders: HeaderReader,
): string {
  const encodedSlug = encodeURIComponent(slug);

  // En las rutas actuales conservamos el comportamiento existente.
  if (!isSubdomain) {
    return `/${encodedSlug}${pathname}`;
  }

  const rootDomain = process.env.FOOD360_ROOT_DOMAIN?.trim().toLowerCase();

  if (!rootDomain) {
    return `/${encodedSlug}${pathname}`;
  }

  const isLocalDomain =
    rootDomain === "localhost" || rootDomain.endsWith(".localhost");

  let port = "";

  // En local conservamos el puerto de Next.js.
  if (isLocalDomain) {
    const host = requestHeaders.get("host");

    if (host) {
      try {
        const parsedHost = new URL(`http://${host}`);
        port = parsedHost.port ? `:${parsedHost.port}` : "";
      } catch {
        port = "";
      }
    }
  }

  const protocol = isLocalDomain ? "http" : "https";

  return `${protocol}://${encodedSlug}.${rootDomain}${port}${pathname}`;
}
