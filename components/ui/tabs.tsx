"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useId,
  createContext,
  useContext,
} from "react";
import { motion } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TabsSize = "sm" | "md" | "lg";
export type TabsVariant = "underline" | "pills";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
  size: TabsSize;
  variant: TabsVariant;
  baseId: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("Tabs compound components must be used within <Tabs>");
  }
  return ctx;
}

export interface TabsProps {
  /** Currently active tab value (controlled mode) */
  value?: string;
  /** Default active tab value (uncontrolled mode) */
  defaultValue?: string;
  /** Callback when the active tab changes */
  onChange?: (value: string) => void;
  /** Size variant */
  size?: TabsSize;
  /** Visual style variant */
  variant?: TabsVariant;
  /** Additional class names */
  className?: string;
  /** Children — TabsList and TabsContent elements */
  children: React.ReactNode;
}

export interface TabsListProps {
  /** TabsTrigger elements */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export interface TabsTriggerProps {
  /** Unique value identifying this tab */
  value: string;
  /** Whether this trigger is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Trigger label */
  children: React.ReactNode;
}

export interface TabsContentProps {
  /** Value matching a TabsTrigger */
  value: string;
  /** Additional class names */
  className?: string;
  /** Panel content */
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const sizeConfig: Record<TabsSize, { trigger: string; text: string }> = {
  sm: { trigger: "px-3 py-1.5", text: "text-xs" },
  md: { trigger: "px-4 py-2", text: "text-sm" },
  lg: { trigger: "px-5 py-2.5", text: "text-base" },
};

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

export function Tabs({
  value,
  defaultValue,
  onChange,
  size = "md",
  variant = "underline",
  className = "",
  children,
}: TabsProps) {
  const baseId = useId();
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");

  const isControlled = typeof value === "string";
  const activeTab = isControlled ? value : internalValue;

  const setActiveTab = useCallback(
    (val: string) => {
      if (!isControlled) setInternalValue(val);
      onChange?.(val);
    },
    [isControlled, onChange],
  );

  return (
    <TabsContext.Provider
      value={{ activeTab, setActiveTab, size, variant, baseId }}
    >
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// TabsList
// ---------------------------------------------------------------------------

export function TabsList({ children, className = "" }: TabsListProps) {
  const { variant } = useTabsContext();
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const triggers = listRef.current?.querySelectorAll<HTMLButtonElement>(
      'button[role="tab"]:not([disabled])',
    );
    if (!triggers || triggers.length === 0) return;

    const currentIndex = Array.from(triggers).findIndex(
      (el) => el === document.activeElement,
    );
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;

    switch (e.key) {
      case "ArrowRight": {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % triggers.length;
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;
        break;
      }
      case "Home": {
        e.preventDefault();
        nextIndex = 0;
        break;
      }
      case "End": {
        e.preventDefault();
        nextIndex = triggers.length - 1;
        break;
      }
    }

    if (nextIndex !== null) {
      triggers[nextIndex].focus();
      triggers[nextIndex].click();
    }
  };

  const borderClass =
    variant === "underline"
      ? "border-b border-slate-200 dark:border-slate-700"
      : "";

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={`flex gap-1 ${borderClass} ${className}`}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TabsTrigger
// ---------------------------------------------------------------------------

export function TabsTrigger({
  value,
  disabled = false,
  className = "",
  children,
}: TabsTriggerProps) {
  const { activeTab, setActiveTab, size, variant, baseId } = useTabsContext();
  const isActive = activeTab === value;
  const { trigger, text } = sizeConfig[size];

  const handleClick = () => {
    if (!disabled) setActiveTab(value);
  };

  const baseClasses = `${trigger} ${text} relative font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/20 dark:focus-visible:ring-slate-400/20 rounded-md`;

  const variantClasses =
    variant === "underline"
      ? disabled
        ? "text-slate-300 cursor-not-allowed dark:text-slate-600"
        : isActive
          ? "text-navy dark:text-white"
          : "text-slate-500 hover:text-navy dark:text-slate-400 dark:hover:text-white"
      : disabled
        ? "text-slate-300 cursor-not-allowed dark:text-slate-600"
        : isActive
          ? "bg-navy text-white dark:bg-gold dark:text-navy-deep"
          : "text-slate-500 hover:bg-slate-100 hover:text-navy dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white";

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={isActive}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
      {variant === "underline" && isActive && (
        <motion.div
          layoutId={`${baseId}-underline`}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy dark:bg-gold -mb-px"
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// TabsContent
// ---------------------------------------------------------------------------

export function TabsContent({
  value,
  className = "",
  children,
}: TabsContentProps) {
  const { activeTab, baseId } = useTabsContext();

  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      tabIndex={0}
      className={`mt-4 focus:outline-none ${className}`}
    >
      {children}
    </div>
  );
}

export default Tabs;
