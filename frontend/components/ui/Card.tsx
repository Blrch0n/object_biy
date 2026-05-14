import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClass = {
  none: "",
  sm:   "p-4",
  md:   "p-5",
  lg:   "p-6 sm:p-8",
};

export function Card({ padding = "md", className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl shadow-xs ${paddingClass[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`border-b border-slate-200 pb-4 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-base font-semibold text-slate-900 ${className}`} {...props}>
      {children}
    </h3>
  );
}
