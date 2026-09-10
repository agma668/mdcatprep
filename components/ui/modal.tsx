"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Callback fired when the modal requests to close */
  onClose: () => void;
  /** Width preset for the dialog panel */
  size?: ModalSize;
  /** Additional class names for the panel */
  className?: string;
  /** Composed content — use ModalHeader, ModalBody, ModalFooter */
  children: React.ReactNode;
}

export interface ModalHeaderProps {
  /** Optional heading rendered inside the header */
  title?: React.ReactNode;
  /** Optional supporting text below the title */
  description?: React.ReactNode;
  /** Show/hide the close button (default true) */
  showClose?: boolean;
  /** Close handler — automatically injected by Modal */
  onClose?: () => void;
  /** Additional class names */
  className?: string;
}

export interface ModalBodyProps {
  /** Body content */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export interface ModalFooterProps {
  /** Footer content (action buttons, links, etc.) */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

export function ModalHeader({
  title,
  description,
  showClose = true,
  onClose,
  className = "",
}: ModalHeaderProps) {
  return (
    <div
      className={`flex items-start justify-between px-6 pt-6 pb-0 ${className}`}
    >
      <div className="flex-1 min-w-0">
        {title && (
          <h2
            id="modal-title"
            className="font-jakarta font-semibold text-lg text-navy dark:text-white"
          >
            {title}
          </h2>
        )}
        {description && (
          <p
            id="modal-description"
            className="mt-1 text-sm text-slate-500 dark:text-slate-400"
          >
            {description}
          </p>
        )}
      </div>
      {showClose && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-4 flex-shrink-0 rounded-md p-1.5 text-slate-400 hover:text-navy hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-navy/20"
          aria-label="Close"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function ModalBody({ children, className = "" }: ModalBodyProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function ModalFooter({ children, className = "" }: ModalFooterProps) {
  return (
    <div
      className={`flex items-center justify-end gap-3 px-6 pb-6 pt-2 ${className}`}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

export function Modal({
  open,
  onClose,
  size = "md",
  className = "",
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // ---- Lock body scroll ----
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // ---- Save / restore focus ----
  useEffect(() => {
    if (open) {
      previousActiveElement.current =
        document.activeElement as HTMLElement | null;
      requestAnimationFrame(() => {
        panelRef.current?.focus();
      });
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus();
      previousActiveElement.current = null;
    }
  }, [open]);

  // ---- Keyboard handling (ESC + focus trap) ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === "Tab" && panelRef.current) {
        const focusable =
          panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  // ---- Backdrop click ----
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  // ---- Inject onClose into ModalHeader children ----
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === ModalHeader) {
      return React.cloneElement(
        child as React.ReactElement<ModalHeaderProps>,
        { onClose },
      );
    }
    return child;
  });

  // SSR guard — portals require a DOM node
  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50"
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            aria-hidden="true"
          />

          {/* Centering wrapper */}
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
          >
            {/* Dialog panel */}
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              aria-describedby="modal-description"
              tabIndex={-1}
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full ${sizeClasses[size]} bg-[#141414] rounded-xl shadow-xl border border-white/10 focus:outline-none ${className}`}
            >
              {enhancedChildren}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export default Modal;
