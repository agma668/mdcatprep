import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  // The primary action is the one deep, saturated fill on the page: white on
  // the --cta-from/--cta-to steel-blue gradient (#2A62B8 → #1D4A90 ≈ 5.9:1 at
  // the light end, so the label passes AA at every point of the ramp). The old
  // button was a gold fill with dark text; gold now belongs to the insignia,
  // not to controls.
  primary:
    "bg-[linear-gradient(180deg,var(--cta-from)_0%,var(--cta-to)_100%)] text-[var(--on-cta)] shadow-[var(--shadow-cta),inset_0_1px_0_rgba(255,255,255,0.16)] hover:brightness-110 hover:-translate-y-px",
  secondary:
    "bg-[var(--srf-2)] text-[var(--steel-100)] border border-[var(--line-3)] hover:bg-[var(--srf-3)] hover:border-[var(--line-signal)]",
  outline:
    "bg-transparent border-2 border-[var(--signal-400)] text-[var(--signal-300)] hover:bg-[var(--signal-300)] hover:text-[var(--color-text-inverse)] hover:border-[var(--signal-300)]",
  ghost:
    "bg-transparent text-[var(--steel-400)] hover:bg-[var(--srf-2)] hover:text-[var(--steel-100)]",
};

// sm is 36px tall for visual density on desktop toolbars; .tap-44 in the base
// classes grows every button's *hit area* to 44px with a centred ::after, so
// small controls stay finger-sized without changing a single layout.
const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm rounded-[var(--radius-sm)]",
  md: "h-11 px-6 text-base rounded-[var(--radius-md)]",
  lg: "h-13 px-8 text-lg rounded-[var(--radius-md)]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={[
          "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold",
          "tap-44 transition-all duration-[var(--transition-fast)] ease-[var(--ease-out-quart)]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--signal-300)] focus-visible:outline-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none select-none",
          // Press feedback answers the tap rather than decorating it, so it
          // stays on under prefers-reduced-motion.
          "cursor-pointer active:translate-y-0 active:scale-[0.985]",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
