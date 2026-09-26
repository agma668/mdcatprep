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
  // The primary action is the one saturated fill on the page: the
  // --cta-from/--cta-to brass gradient, carrying --on-cta (dark ink on the
  // gold palette, white on the three deep ones — see the token's comment in
  // app/globals.css). The ink never goes hardcoded to white here, because
  // white on --signal-600 measures 2.1:1.
  primary:
    "bg-[linear-gradient(180deg,var(--cta-from)_0%,var(--cta-to)_100%)] text-[var(--on-cta)] shadow-[var(--shadow-cta),inset_0_1px_0_rgba(255,255,255,0.16)] hover:brightness-110 hover:-translate-y-px hover:shadow-[0_10px_30px_rgba(var(--rgb-signal),0.55),inset_0_1px_0_rgba(255,255,255,0.2)] active:shadow-[0_2px_6px_rgba(var(--rgb-signal),0.35),inset_0_1px_0_rgba(255,255,255,0.08)]",
  secondary:
    "bg-[var(--srf-2)] text-[var(--steel-100)] border border-[var(--line-3)] hover:bg-[var(--srf-3)] hover:border-[var(--line-signal)]",
  // Hover inverts the outline button to a solid accent fill, so its label
  // takes the same ink the CTA uses — not --color-text-inverse, which is
  // white and would disappear on gold.
  outline:
    "bg-transparent border-2 border-[var(--signal-400)] text-[var(--signal-300)] hover:bg-[var(--signal-300)] hover:text-[var(--on-cta)] hover:border-[var(--signal-300)]",
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
