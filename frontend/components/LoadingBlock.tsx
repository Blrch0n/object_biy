type LoadingBlockProps = {
  label?: string;
};

export function LoadingBlock({ label = "Ачаалж байна..." }: LoadingBlockProps) {
  return (
    <div className="paper flex items-center justify-center gap-4 px-5 py-5">
      <span className="loading-spinner" aria-hidden="true" />
      <span className="text-md font-bold text-black uppercase">{label}</span>
    </div>
  );
}
