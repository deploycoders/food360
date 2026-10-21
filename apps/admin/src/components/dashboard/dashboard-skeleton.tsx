import { DashboardMasonryItem } from "@/components/dashboard/dashboard-masonry-item";

function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function SkeletonCard({
  size,
  children,
}: {
  size: "small" | "wide";
  children: React.ReactNode;
}) {
  return (
    <DashboardMasonryItem size={size}>
      <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/70 px-4 py-3">
          <SkeletonLine className="h-4 w-32" />
          <SkeletonLine className="mt-2 h-3 w-48 max-w-full" />
        </div>

        <div className="space-y-4 p-4">{children}</div>
      </article>
    </DashboardMasonryItem>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Cargando dashboard">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <SkeletonLine className="h-8 w-60 max-w-full" />
          <SkeletonLine className="h-3 w-80 max-w-full" />
        </div>

        <div className="flex gap-2">
          <SkeletonLine className="h-9 w-24" />
          <SkeletonLine className="h-9 w-28" />
        </div>
      </header>

      <div className="rounded-xl border border-border bg-card p-4">
        <SkeletonLine className="h-4 w-44" />
        <SkeletonLine className="mt-2 h-3 w-72 max-w-full" />
      </div>

      <section
        className="grid grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        style={{ gridAutoRows: "8px" }}
      >
        {[1, 2, 3].map((item) => (
          <SkeletonCard key={item} size="small">
            <SkeletonLine className="h-3 w-24" />
            <SkeletonLine className="h-8 w-36" />
            <SkeletonLine className="mt-8 h-3 w-4/5" />
          </SkeletonCard>
        ))}

        <SkeletonCard size="wide">
          <SkeletonLine className="h-3 w-36" />
          <div className="flex h-44 items-end justify-around gap-3 px-2">
            {[35, 60, 45, 80, 52, 95, 68]
              .map((height, index) => (
                <SkeletonLine key={index} className="w-full max-w-12" />
              ))
              .map((bar, index) => (
                <div key={index} className="flex h-full flex-1 items-end">
                  <div
                    className="w-full animate-pulse rounded-t-md bg-muted"
                    style={{
                      height: `${[35, 60, 45, 80, 52, 95, 68][index]}%`,
                    }}
                  />
                </div>
              ))}
          </div>
          <SkeletonLine className="h-3 w-40" />
        </SkeletonCard>

        <SkeletonCard size="small">
          {[1, 2, 3].map((item) => (
            <div key={item} className="space-y-2">
              <div className="flex justify-between gap-3">
                <SkeletonLine className="h-3 w-24" />
                <SkeletonLine className="h-3 w-6" />
              </div>
              <SkeletonLine className="h-2 w-full" />
            </div>
          ))}
        </SkeletonCard>

        <SkeletonCard size="small">
          <SkeletonLine className="h-9 w-28" />
          <SkeletonLine className="h-3 w-40" />
          <SkeletonLine className="mt-8 h-2 w-full" />
        </SkeletonCard>

        <SkeletonCard size="wide">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 border-b border-border/60 pb-3 last:border-0"
            >
              <SkeletonLine className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <SkeletonLine className="h-3 w-40 max-w-full" />
                <SkeletonLine className="h-3 w-24" />
              </div>
              <SkeletonLine className="h-4 w-16" />
            </div>
          ))}
        </SkeletonCard>

        <SkeletonCard size="wide">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <SkeletonLine className="h-3 w-20" />
              <SkeletonLine className="h-3 flex-1" />
              <SkeletonLine className="h-3 w-16" />
            </div>
          ))}
        </SkeletonCard>
      </section>

      <span className="sr-only">Cargando información del restaurante...</span>
    </div>
  );
}
