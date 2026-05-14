type StatusMessageProps = {
  type: "success" | "error";
  message: string;
};

export function StatusMessage({ type, message }: StatusMessageProps) {
  const isSuccess = type === "success";

  return (
    <div
      className={`relative flex items-start gap-3 rounded-md px-4 py-3 text-sm leading-relaxed border-3 border-black shadow-[4px_4px_0px_0px_#111] font-bold ${
        isSuccess
          ? "bg-[var(--brand-green)] text-white"
          : "bg-[var(--brand-red)] text-white"
      }`}
    >
      <span className="mt-0.5 flex-shrink-0 text-base" aria-hidden="true">
        {isSuccess ? "" : ""}
      </span>
      <span>{message}</span>
    </div>
  );
}
