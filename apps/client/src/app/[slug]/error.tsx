"use client";

export default function RestaurantPageError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="public-state" role="alert">
      <p className="public-eyebrow">Food360</p>
      <h1>No pudimos cargar esta página</h1>
      <p>Inténtalo de nuevo más tarde.</p>
      <button className="public-retry" type="button" onClick={reset}>
        Reintentar
      </button>
    </main>
  );
}
