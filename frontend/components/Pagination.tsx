import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  pageNo:       number;
  totalPages:   number;
  onPageChange: (page: number) => void;
}

export function Pagination({ pageNo, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) pages.push(i);
  } else {
    pages.push(0);
    if (pageNo > 2) pages.push("...");
    for (let i = Math.max(1, pageNo - 1); i <= Math.min(totalPages - 2, pageNo + 1); i++) pages.push(i);
    if (pageNo < totalPages - 3) pages.push("...");
    pages.push(totalPages - 1);
  }

  return (
    <nav className="flex items-center justify-between gap-2 pt-4" aria-label="Хуудасжилт">
      <button
        onClick={() => onPageChange(pageNo - 1)}
        disabled={pageNo === 0}
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Өмнөх хуудас"
      >
        <ChevronLeft size={16} /> Өмнөх
      </button>

      <div className="hidden sm:flex items-center gap-1">
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e-${i}`} className="px-2 py-1.5 text-sm text-slate-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              aria-current={p === pageNo ? "page" : undefined}
              className={[
                "w-9 h-9 rounded-lg text-sm font-medium transition-colors",
                p === pageNo
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")}
            >
              {(p as number) + 1}
            </button>
          )
        )}
      </div>

      <span className="sm:hidden text-sm text-slate-500">
        {pageNo + 1} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(pageNo + 1)}
        disabled={pageNo === totalPages - 1}
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg hover:bg-slate-100 transition-colors"
        aria-label="Дараах хуудас"
      >
        Дараах <ChevronRight size={16} />
      </button>
    </nav>
  );
}
