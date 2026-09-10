"use client";

import React from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SkeletonVariant = "rectangle" | "circle" | "text";
export type SkeletonAnimation = "pulse" | "wave" | "none";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
}

// ---------------------------------------------------------------------------
// Skeleton Component
// ---------------------------------------------------------------------------

export function Skeleton({
  variant = "rectangle",
  animation = "pulse",
  width,
  height,
  lines = 1,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const animationClasses = {
    pulse: "animate-pulse",
    wave: "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 dark:before:via-white/10 before:to-transparent",
    none: "",
  }[animation];

  const baseClasses = `bg-slate-200 dark:bg-slate-800 ${animationClasses}`;

  const getVariantClasses = (v: SkeletonVariant) => {
    switch (v) {
      case "circle":
        return "rounded-full";
      case "text":
        return "rounded h-4 my-1 w-full";
      case "rectangle":
      default:
        return "rounded-md";
    }
  };

  const inlineStyle: React.CSSProperties = {
    width: width !== undefined ? (typeof width === "number" ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === "number" ? `${height}px` : height) : undefined,
    ...style,
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={`flex flex-col gap-2 w-full ${className}`} role="status" aria-label="Loading..." {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${getVariantClasses("text")}`}
            style={{
              ...inlineStyle,
              width: i === lines - 1 && !width ? "80%" : inlineStyle.width,
            }}
          />
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Loading..."
      className={`${baseClasses} ${getVariantClasses(variant)} ${className}`}
      style={inlineStyle}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default Skeleton;
