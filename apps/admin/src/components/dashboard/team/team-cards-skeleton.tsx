"use client";

import React from "react";
import { motion } from "framer-motion";

export function TeamCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.25,
            delay: index * 0.04,
          }}
          className="relative overflow-hidden bg-card border border-border rounded-2xl p-5 shadow-sm"
        >
          {/* Shimmer */}
          <motion.div
            className="absolute inset-y-0 -left-full w-1/2 bg-linear-to-r from-transparent via-white/5 to-transparent"
            animate={{
              x: ["0%", "300%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.12,
            }}
          />

          {/* Header */}
          <div className="relative flex items-start justify-between gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-muted" />

            <div className="flex items-center gap-1">
              <div className="w-7 h-7 rounded-lg bg-muted" />
              <div className="w-7 h-7 rounded-lg bg-muted" />
            </div>
          </div>

          {/* Name */}
          <div className="relative h-4 w-32 rounded-md bg-muted mb-2" />

          {/* Role */}
          <div className="relative h-5 w-24 rounded-md bg-muted" />

          {/* Contact */}
          <div className="relative space-y-2 py-3 my-3 border-y border-border/60">
            <div className="h-3 w-40 rounded bg-muted" />
            <div className="h-3 w-28 rounded bg-muted" />
          </div>

          {/* Footer */}
          <div className="relative flex items-center justify-between">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="h-3 w-12 rounded bg-muted" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
