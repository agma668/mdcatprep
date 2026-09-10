import { motion, AnimatePresence } from "framer-motion";
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import React, { useState } from "react";

export type AlertVariant = "default" | "info" | "success" | "warning" | "danger";

export interface AlertProps {
  /** Variant of the alert determines colors and icon */
  variant?: AlertVariant;
  /** Title of the alert, optional */
  title?: React.ReactNode;
  /** Main message body */
  description?: React.ReactNode;
  /** Callback when the alert is dismissed */
  onDismiss?: () => void;
  /** Additional class names */
  className?: string;
  /** Control visibility externally; if omitted component manages its own state */
  open?: boolean;
}

const variantStyles: Record<AlertVariant, {bg: string; text: string; border: string; icon: React.ReactNode}> = {
  default: {
    bg: "bg-white/[0.06]",
    text: "text-white",
    border: "border-white/10",
    icon: <Info className="h-5 w-5" aria-hidden="true" />,
  },
  info: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    icon: <Info className="h-5 w-5" aria-hidden="true" />,
  },
  success: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    icon: <CheckCircle className="h-5 w-5" aria-hidden="true" />,
  },
  warning: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    icon: <AlertTriangle className="h-5 w-5" aria-hidden="true" />,
  },
  danger: {
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    icon: <AlertCircle className="h-5 w-5" aria-hidden="true" />,
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = "default",
  title,
  description,
  onDismiss,
  className = "",
  open,
}) => {
  const [internalVisible, setInternalVisible] = useState<boolean>(true);

  // Controlled mode: open prop takes precedence; uncontrolled: internal state
  const visible = typeof open === "boolean" ? open : internalVisible;

  const handleDismiss = () => {
    setInternalVisible(false);
    onDismiss?.();
  };

  const { bg, text, border, icon } = variantStyles[variant];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="alert"
          aria-live="assertive"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
          className={`border ${border} rounded-md p-4 flex items-start space-x-3 ${bg} ${text} ${className}`}
        >
          <div className="flex-shrink-0 pt-0.5">{icon}</div>
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="font-medium text-sm mb-1" id="alert-title">
                {title}
              </h4>
            )}
            {description && (
              <p className="text-sm" id="alert-description">
                {description}
              </p>
            )}
          </div>
          {onDismiss && (
            <button
              type="button"
              onClick={handleDismiss}
              className="ml-4 flex-shrink-0 rounded-md inline-flex items-center justify-center p-1 text-current hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;
