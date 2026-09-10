"use client";

import React, { useState, useRef, useEffect, useId, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TooltipPosition = "top" | "right" | "bottom" | "left";

export interface TooltipProps {
  content: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  disabled?: boolean;
  className?: string;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const positionClasses: Record<TooltipPosition, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowClasses: Record<TooltipPosition, string> = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-slate-900 dark:border-t-slate-800 border-x-transparent border-b-transparent border-4",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-slate-900 dark:border-b-slate-800 border-x-transparent border-t-transparent border-4",
  left: "left-full top-1/2 -translate-y-1/2 border-l-slate-900 dark:border-l-slate-800 border-y-transparent border-r-transparent border-4",
  right: "right-full top-1/2 -translate-y-1/2 border-r-slate-900 dark:border-r-slate-800 border-y-transparent border-l-transparent border-4",
};

const motionVariants = {
  hidden: (pos: TooltipPosition) => {
    switch (pos) {
      case "top":
        return { opacity: 0, y: 4, scale: 0.95 };
      case "bottom":
        return { opacity: 0, y: -4, scale: 0.95 };
      case "left":
        return { opacity: 0, x: 4, scale: 0.95 };
      case "right":
        return { opacity: 0, x: -4, scale: 0.95 };
    }
  },
  visible: { opacity: 1, x: 0, y: 0, scale: 1 },
};

// ---------------------------------------------------------------------------
// Tooltip Component
// ---------------------------------------------------------------------------

export function Tooltip({
  content,
  position = "top",
  delay = 200,
  disabled = false,
  className = "",
  children,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState<TooltipPosition>(position);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  const handleShow = useCallback(() => {
    if (disabled || !content) return;
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [delay, disabled, content]);

  const handleHide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
  }, []);

  // Simple viewport boundary / collision detection adjustment
  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let newPos = position;

      if (position === "top" && rect.top < 0) newPos = "bottom";
      else if (position === "bottom" && rect.bottom > windowHeight) newPos = "top";
      else if (position === "left" && rect.left < 0) newPos = "right";
      else if (position === "right" && rect.right > windowWidth) newPos = "left";

      setActualPosition(newPos);
    }
  }, [isVisible, position]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleHide();
    }
  };

  return (
    <span
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleShow}
      onMouseLeave={handleHide}
      onFocus={handleShow}
      onBlur={handleHide}
      onKeyDown={handleKeyDown}
    >
      {React.cloneElement(children, {
        "aria-describedby": isVisible ? id : undefined,
      })}
      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            ref={tooltipRef}
            id={id}
            role="tooltip"
            custom={actualPosition}
            variants={motionVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute z-50 pointer-events-none whitespace-nowrap rounded bg-slate-900 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-white shadow-md ${positionClasses[actualPosition]} ${className}`}
          >
            {content}
            <span className={`absolute w-0 h-0 ${arrowClasses[actualPosition]}`} aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

export default Tooltip;
