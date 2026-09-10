"use client";

import React, { useState } from "react";
import Image from "next/image";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarStatus = "online" | "offline" | "busy" | "away";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const sizeClasses: Record<AvatarSize, { container: string; text: string; status: string; pixelSize: number }> = {
  xs: { container: "h-6 w-6", text: "text-[10px]", status: "h-1.5 w-1.5 ring-1", pixelSize: 24 },
  sm: { container: "h-8 w-8", text: "text-xs", status: "h-2 w-2 ring-1.5", pixelSize: 32 },
  md: { container: "h-10 w-10", text: "text-sm", status: "h-2.5 w-2.5 ring-2", pixelSize: 40 },
  lg: { container: "h-12 w-12", text: "text-base", status: "h-3 w-3 ring-2", pixelSize: 48 },
  xl: { container: "h-16 w-16", text: "text-xl", status: "h-4 w-4 ring-2", pixelSize: 64 },
};

const statusClasses: Record<AvatarStatus, string> = {
  online: "bg-emerald-500",
  offline: "bg-slate-400 dark:bg-slate-500",
  busy: "bg-rose-500",
  away: "bg-amber-500",
};

// Helper for initials
function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ---------------------------------------------------------------------------
// Avatar Component
// ---------------------------------------------------------------------------

export function Avatar({
  src,
  alt = "",
  name,
  size = "md",
  status,
  className = "",
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const { container, text, status: statusSize, pixelSize } = sizeClasses[size];
  const initials = getInitials(name || alt);

  const renderImage = src && !imageError;

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      <div
        className={`relative ${container} overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-medium text-navy dark:text-gold select-none`}
      >
        {renderImage ? (
          <Image
            src={src}
            alt={alt || name || "Avatar"}
            width={pixelSize}
            height={pixelSize}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className={text}>{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-white dark:ring-slate-900 ${statusSize} ${statusClasses[status]}`}
          aria-label={`Status: ${status}`}
          role="status"
        />
      )}
    </div>
  );
}

export default Avatar;
