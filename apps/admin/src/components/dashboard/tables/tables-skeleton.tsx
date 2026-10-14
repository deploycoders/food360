"use client";

import React from "react";

interface TablesSkeletonProps {
  count?: number;
}

export function TablesSkeleton({ count = 8 }: TablesSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-40 animate-pulse rounded-2xl border border-border bg-card"
        />
      ))}
    </div>
  );
}
