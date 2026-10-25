import { UserRound } from "lucide-react";

export function ProfilePageSkeleton() {
  return (
    <div
      className="w-full min-w-0 animate-pulse space-y-6"
      aria-label="Cargando perfil"
      aria-busy="true"
    >
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card">
          <UserRound className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-6 w-40 rounded-lg bg-muted" />
          <div className="h-3 w-72 max-w-full rounded bg-muted" />
        </div>
      </header>

      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        {/* Banner */}
        <div className="h-36 bg-muted sm:h-44 lg:h-52" />

        <div className="px-4 pb-6 sm:px-7 sm:pb-7 lg:px-9">
          {/* Avatar superpuesto */}
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end">
            <div className="h-24 w-24 rounded-full bg-muted ring-4 ring-card sm:h-28 sm:w-28" />

            <div className="mb-2 flex-1 space-y-3">
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-7 w-52 max-w-full rounded bg-muted" />
              <div className="h-4 w-64 max-w-full rounded bg-muted" />
            </div>
          </div>

          {/* Campos del formulario */}
          <div className="mt-8 space-y-4">
            <div className="h-4 w-36 rounded bg-muted" />

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="h-11 rounded-xl bg-muted" />
              <div className="h-11 rounded-xl bg-muted" />
              <div className="h-11 rounded-xl bg-muted sm:col-span-2" />
            </div>

            <div className="h-11 w-36 rounded-xl bg-muted sm:ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
