import { HTMLAttributes } from "react";

type BadgeColor = "blue" | "green" | "red" | "yellow" | "orange" | "slate" | "purple";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
}

const colorClass: Record<BadgeColor, string> = {
  blue:   "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  green:  "bg-green-50 text-green-700 ring-1 ring-green-100",
  red:    "bg-red-50 text-red-700 ring-1 ring-red-100",
  yellow: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  orange: "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
  slate:  "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  purple: "bg-purple-50 text-purple-700 ring-1 ring-purple-100",
};

export function Badge({ color = "slate", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass[color]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
