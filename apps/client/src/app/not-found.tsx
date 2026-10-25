import Link from "next/link";

export default function NotFound() {
  return (
    <main className="public-state">
      <p className="public-eyebrow">Food360</p>
      <h1>No encontramos este restaurante</h1>
      <p>Comprueba que el enlace sea correcto.</p>
      <Link className="public-back-link" href="/">Ir al inicio</Link>
    </main>
  );
}
