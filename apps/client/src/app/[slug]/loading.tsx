export default function LoadingRestaurantPage() {
  return (
    <main className="public-page" aria-busy="true" aria-label="Cargando restaurante">
      <div className="public-skeleton public-skeleton-avatar" />
      <div className="public-skeleton public-skeleton-title" />
      <div className="public-skeleton public-skeleton-action" />
      <div className="public-skeleton public-skeleton-action" />
    </main>
  );
}
