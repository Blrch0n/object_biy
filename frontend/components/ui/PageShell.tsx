import { HTMLAttributes } from "react";

interface PageShellProps extends HTMLAttributes<HTMLDivElement> {
  title?:       string;
  description?: string;
  actions?:     React.ReactNode;
}

export function PageShell({ title, description, actions, className = "", children, ...props }: PageShellProps) {
  return (
    <div className={`space-y-6 animate-fade-in-up ${className}`} {...props}>
      {(title || actions) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>}
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
