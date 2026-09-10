"use client";

import React, { useRef, useEffect, useState, useId } from "react";
import { Check, Minus } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CheckboxSize = "sm" | "md" | "lg";

export interface CheckboxProps {
  /** Current checked state (controlled mode) */
  checked?: boolean;
  /** Initial checked state (uncontrolled mode) */
  defaultChecked?: boolean;
  /** Callback fired when the checked state changes */
  onChange?: (checked: boolean) => void;
  /** Size variant */
  size?: CheckboxSize;
  /** Label text displayed beside the checkbox */
  label?: React.ReactNode;
  /** Supporting text rendered below the label */
  description?: React.ReactNode;
  /** Error message rendered below the description */
  error?: React.ReactNode;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Whether the checkbox displays an indeterminate state */
  indeterminate?: boolean;
  /** HTML name attribute */
  name?: string;
  /** HTML value attribute */
  value?: string;
  /** Additional class names for the root element */
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const sizeConfig: Record<
  CheckboxSize,
  { box: string; icon: string; label: string; desc: string }
> = {
  sm: {
    box: "h-4 w-4 rounded",
    icon: "h-2.5 w-2.5",
    label: "text-sm",
    desc: "text-xs",
  },
  md: {
    box: "h-5 w-5 rounded-md",
    icon: "h-3 w-3",
    label: "text-sm",
    desc: "text-xs",
  },
  lg: {
    box: "h-6 w-6 rounded-md",
    icon: "h-3.5 w-3.5",
    label: "text-base",
    desc: "text-sm",
  },
};

// ---------------------------------------------------------------------------
// Checkbox
// ---------------------------------------------------------------------------

export function Checkbox({
  checked,
  defaultChecked,
  onChange,
  size = "md",
  label,
  description,
  error,
  disabled = false,
  indeterminate = false,
  name,
  value,
  className = "",
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [internalChecked, setInternalChecked] = useState(
    defaultChecked ?? false,
  );

  const isControlled = typeof checked === "boolean";
  const isChecked = isControlled ? checked : internalChecked;
  const showIcon = indeterminate || isChecked;

  // Sync the indeterminate DOM property (no HTML attribute equivalent)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(e.target.checked);
    }
    onChange?.(e.target.checked);
  };

  const { box, icon, label: labelCls, desc: descCls } = sizeConfig[size];

  const descriptionId = description ? `${id}-desc` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const ariaDescribedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  const Icon = indeterminate ? Minus : Check;

  // -- Box colors --
  const boxColors = disabled
    ? showIcon
      ? "border-slate-300 bg-slate-200 dark:border-slate-600 dark:bg-slate-700"
      : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
    : showIcon
      ? "border-navy bg-navy dark:border-gold dark:bg-gold"
      : error
        ? "border-rose-400 bg-white/[0.06]"
        : "border-white/15 bg-white/[0.06] hover:border-white/25";

  // -- Focus ring --
  const focusRing = error
    ? "peer-focus-visible:ring-2 peer-focus-visible:ring-rose-200 dark:peer-focus-visible:ring-rose-800"
    : "peer-focus-visible:ring-2 peer-focus-visible:ring-navy/20 dark:peer-focus-visible:ring-slate-400/20";

  // -- Icon color --
  const iconColor = disabled
    ? "text-slate-400 dark:text-slate-500"
    : "text-white dark:text-navy-deep";

  return (
    <label
      htmlFor={id}
      className={`inline-flex items-start gap-3 ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
    >
      <span className="relative flex-shrink-0 flex items-center justify-center pt-0.5">
        <input
          ref={inputRef}
          type="checkbox"
          id={id}
          name={name}
          value={value}
          checked={isControlled ? checked : undefined}
          defaultChecked={!isControlled ? defaultChecked : undefined}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={ariaDescribedBy}
          className="peer sr-only"
        />
        <span
          className={`${box} border-2 flex items-center justify-center transition-all duration-150 ${boxColors} ${
            disabled ? "" : focusRing
          }`}
          aria-hidden="true"
        >
          {showIcon && (
            <Icon
              className={`${icon} ${iconColor} transition-opacity duration-150`}
              strokeWidth={3}
              aria-hidden="true"
            />
          )}
        </span>
      </span>
      {(label || description || error) && (
        <span className="flex flex-col gap-0.5 min-w-0">
          {label && (
            <span
              className={`${labelCls} font-medium ${
                disabled
                  ? "text-slate-400 dark:text-slate-500"
                  : "text-navy dark:text-white"
              }`}
            >
              {label}
            </span>
          )}
          {description && (
            <span
              id={descriptionId}
              className={`${descCls} text-slate-500 dark:text-slate-400`}
            >
              {description}
            </span>
          )}
          {error && (
            <span
              id={errorId}
              className="text-xs text-rose-500 dark:text-rose-400"
            >
              {error}
            </span>
          )}
        </span>
      )}
    </label>
  );
}

export default Checkbox;
