import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  loading?:   boolean;
  fullWidth?: boolean;
}

const variantClass: Record<Variant, string> = {
  primary:   "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-transparent disabled:bg-blue-300",
  secondary: "bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300 disabled:opacity-50",
  danger:    "bg-red-600 hover:bg-red-700 text-white border-transparent disabled:bg-red-300",
  ghost:     "bg-transparent hover:bg-slate-100 text-slate-700 border-transparent disabled:opacity-50",
};

const sizeClass: Record<Size, string> = {
  sm: "text-xs px-2.5 py-1.5 gap-1",
  md: "text-sm px-4 py-2 gap-1.5",
  lg: "text-base px-5 py-2.5 gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, fullWidth, className = "", disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center font-semibold rounded-lg border transition-colors duration-150 cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed",
        variantClass[variant],
        sizeClass[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export { Button };
export type { ButtonProps };
