type HeaderReader = {
  get(name: string): string | null;
};

export function getRestaurantUrl(
  slug: string,
  pathname: "" | "/menu",
  isSubdomain: boolean,
  requestHeaders: HeaderReader,
  searchParams?: Record<string, string | undefined | null>,
): string {
  const encodedSlug = encodeURIComponent(slug);

  const query = new URLSearchParams();
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value != null && value !== "") {
        query.set(key, value);
      }
    }
  }
  const search = query.toString() ? `?${query.toString()}` : "";

  // En las rutas actuales conservamos el comportamiento existente.
  if (!isSubdomain) {
    return `/${encodedSlug}${pathname}${search}`;
  }

  const rootDomain = process.env.FOOD360_ROOT_DOMAIN?.trim().toLowerCase();

  if (!rootDomain) {
    return `/${encodedSlug}${pathname}${search}`;
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

  return `${protocol}://${encodedSlug}.${rootDomain}${port}${pathname}${search}`;
}
