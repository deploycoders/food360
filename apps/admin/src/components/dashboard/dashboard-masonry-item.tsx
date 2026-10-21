"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

const ROW_HEIGHT = 8;
const GRID_GAP = 16;

interface DashboardMasonryItemProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "style"> {
  size: "small" | "wide";
  children: ReactNode;
  style?: CSSProperties;
}

export function DashboardMasonryItem({
  size,
  children,
  className = "",
  style,
  ...props
}: DashboardMasonryItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [rowSpan, setRowSpan] = useState(1);

  useEffect(() => {
    const element = contentRef.current;

    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const updateHeight = () => {
      const height = element.getBoundingClientRect().height;

      const nextSpan = Math.max(
        1,
        Math.ceil((height + GRID_GAP) / (ROW_HEIGHT + GRID_GAP)),
      );

      setRowSpan((current) => (current === nextSpan ? current : nextSpan));
    };

    const observer = new ResizeObserver(updateHeight);

    observer.observe(element);
    updateHeight();

    return () => observer.disconnect();
  }, []);

  return (
    <div
      {...props}
      className={[
        "min-w-0",
        size === "wide" ? "sm:col-span-2 xl:col-span-2" : "",
        className,
      ].join(" ")}
      style={{
        ...style,
        gridRowEnd: `span ${rowSpan}`,
      }}
    >
      <div ref={contentRef} className="min-w-0">
        {children}
      </div>
    </div>
  );
}
