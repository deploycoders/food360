import type { ElementType } from "react";

interface MetricsCardsProps {
  title: string;
  value: string;
  change: string;
  icon: ElementType;
}

export function MetricsCards({
  title,
  value,
  change,
  icon: Icon,
}: MetricsCardsProps) {
  return (
    <div className="flex min-h-32 flex-col justify-between gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-muted p-2.5 text-accent">
          <Icon aria-hidden="true" className="h-4 w-4" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{change}</p>
    </div>
  );
}
