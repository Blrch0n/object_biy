import { Loader2 } from "lucide-react";

interface LoadingBlockProps {
  label?:     string;
  className?: string;
}

export function LoadingBlock({ label = "Ачаалж байна...", className = "" }: LoadingBlockProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 gap-3 ${className}`}>
      <Loader2 size={28} className="animate-spin text-blue-500" aria-hidden="true" />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}
