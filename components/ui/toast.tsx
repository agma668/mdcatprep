"use client";

import React, { createContext, useContext, useState, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ToastVariant = "success" | "error" | "warning" | "info";
export type ToastPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-center"
  | "bottom-center";

export interface ToastOptions {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
}

export interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

export interface ToastProviderProps {
  position?: ToastPosition;
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const variantStyles: Record<
  ToastVariant,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-950/80",
    text: "text-emerald-800 dark:text-emerald-200",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: <CheckCircle className="h-5 w-5 text-emerald-500" aria-hidden="true" />,
  },
  error: {
    bg: "bg-rose-50 dark:bg-rose-950/80",
    text: "text-rose-800 dark:text-rose-200",
    border: "border-rose-200 dark:border-rose-800",
    icon: <AlertCircle className="h-5 w-5 text-rose-500" aria-hidden="true" />,
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/80",
    text: "text-amber-800 dark:text-amber-200",
    border: "border-amber-200 dark:border-amber-800",
    icon: <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />,
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/80",
    text: "text-blue-800 dark:text-blue-200",
    border: "border-blue-200 dark:border-blue-800",
    icon: <Info className="h-5 w-5 text-blue-500" aria-hidden="true" />,
  },
};

const positionClasses: Record<ToastPosition, string> = {
  "top-left": "top-4 left-4 flex-col",
  "top-right": "top-4 right-4 flex-col",
  "top-center": "top-4 left-1/2 -translate-x-1/2 flex-col items-center",
  "bottom-left": "bottom-4 left-4 flex-col-reverse",
  "bottom-right": "bottom-4 right-4 flex-col-reverse",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 flex-col-reverse items-center",
};

// ---------------------------------------------------------------------------
// Toast Component & Provider
// ---------------------------------------------------------------------------

export function ToastProvider({
  position = "bottom-right",
  children,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const baseId = useId();

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ id, duration = 4000, onClose, ...rest }: ToastOptions): string => {
      const toastId = id || `${baseId}-${Date.now()}-${Math.random()}`;

      const newItem: ToastItem = {
        id: toastId,
        duration,
        onClose,
        ...rest,
      };

      setToasts((prev) => [...prev, newItem]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(toastId);
          onClose?.();
        }, duration);
      }

      return toastId;
    },
    [baseId, dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className={`fixed z-50 flex gap-2 pointer-events-none ${positionClasses[position]}`}
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const { bg, text, border, icon } = variantStyles[t.variant || "info"];

            return (
              <motion.div
                key={t.id}
                role="status"
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg ${bg} ${border} ${text}`}
              >
                <div className="flex-shrink-0 pt-0.5">{icon}</div>
                <div className="flex-1 min-w-0">
                  {t.title && (
                    <h5 className="font-semibold text-sm leading-tight mb-1">
                      {t.title}
                    </h5>
                  )}
                  {t.description && (
                    <p className="text-xs opacity-90 leading-relaxed">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    dismiss(t.id);
                    t.onClose?.();
                  }}
                  className="flex-shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-navy/20 dark:focus:ring-white/20"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
