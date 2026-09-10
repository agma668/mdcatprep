"use client";

import React from "react";
import { motion } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProgressSize = "sm" | "md" | "lg";
export type ProgressVariant = "default" | "success" | "warning" | "danger";

export interface ProgressProps {
  /** Current value between 0 and 100 */
  value?: number;
  /** Size variant */
  size?: ProgressSize;
  /** Color variant */
  variant?: ProgressVariant;
  /** Label rendered above the bar */
  label?: React.ReactNode;
  /** Whether to display the numeric percentage */
  showValue?: boolean;
  /** Show an indeterminate animation instead of a fixed value */
  indeterminate?: boolean;
  /** Additional class names */
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const sizeConfig: Record<ProgressSize, { track: string; text: string }> = {
  sm: { track: "h-1.5", text: "text-xs" },
  md: { track: "h-2.5", text: "text-sm" },
  lg: { track: "h-4", text: "text-sm" },
};

const variantConfig: Record<ProgressVariant, string> = {
  default: "bg-navy dark:bg-gold",
  success: "bg-emerald-500 dark:bg-emerald-400",
  warning: "bg-amber-500 dark:bg-amber-400",
  danger: "bg-rose-500 dark:bg-rose-400",
};

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export function Progress({
  value = 0,
  size = "md",
  variant = "default",
  label,
  showValue = false,
  indeterminate = false,
  className = "",
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const { track, text } = sizeConfig[size];
  const barColor = variantConfig[variant];

  return (
    <div
      className={`flex flex-col gap-1.5 ${className}`}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={typeof label === "string" ? label : undefined}
    >
      {(label || showValue) && (
        <div className={`flex items-center justify-between ${text}`}>
          {label && (
            <span className="font-medium text-navy dark:text-white">
              {label}
            </span>
          )}
          {showValue && !indeterminate && (
            <span className="text-slate-500 dark:text-slate-400 tabular-nums">
              {clamped}%
            </span>
          )}
        </div>
      )}

      <div
        className={`${track} w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden`}
      >
        {indeterminate ? (
          <motion.div
            className={`h-full w-1/3 rounded-full ${barColor}`}
            animate={{ x: ["-100%", "400%"] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ) : (
          <motion.div
            className={`h-full rounded-full ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${clamped}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </div>
    </div>
  );
}

export default Progress;
