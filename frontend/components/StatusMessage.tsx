import { CheckCircle2, XCircle } from "lucide-react";

interface StatusMessageProps {
  type:    "success" | "error";
  message: string;
}

export function StatusMessage({ type, message }: StatusMessageProps) {
  const isError  = type === "error";
  const Icon     = isError ? XCircle : CheckCircle2;
  const colorCls = isError
    ? "bg-red-50 border-red-200 text-red-700"
    : "bg-green-50 border-green-200 text-green-700";
  const iconCls  = isError ? "text-red-500" : "text-green-500";

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium ${colorCls}`}
    >
      <Icon size={16} className={`flex-shrink-0 mt-0.5 ${iconCls}`} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
