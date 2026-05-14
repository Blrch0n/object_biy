import React from "react";

type PaginationProps = {
  pageNo: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ pageNo, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) pages.push(i);
  } else {
    pages.push(0);
    if (pageNo > 2) pages.push("…");
    for (let i = Math.max(1, pageNo - 1); i <= Math.min(totalPages - 2, pageNo + 1); i++) pages.push(i);
    if (pageNo < totalPages - 3) pages.push("…");
    pages.push(totalPages - 1);
  }

  return (
    <div className="flex items-center justify-between mt-6 paper px-4 py-3">
      {/* Mobile */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(pageNo - 1)}
          disabled={pageNo === 0}
          className="btn-secondary py-1 px-3 text-sm disabled:opacity-40"
        >
          ← Өмнөх
        </button>
        <span className="text-sm font-bold self-center">{pageNo + 1}/{totalPages}</span>
        <button
          onClick={() => onPageChange(pageNo + 1)}
          disabled={pageNo >= totalPages - 1}
          className="btn-secondary py-1 px-3 text-sm disabled:opacity-40"
        >
          Дараах →
        </button>
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <p className="text-sm font-bold">
          Хуудас <span className="text-[var(--brand-yellow)]">{pageNo + 1}</span> / {totalPages}
        </p>
        <nav className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(pageNo - 1)}
            disabled={pageNo === 0}
            className="btn-secondary py-1 px-3 text-sm disabled:opacity-40"
          >
            ← Өмнөх
          </button>
          {pages.map((p, idx) =>
            p === "…" ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-[var(--text-muted)]">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`py-1 px-3 text-sm font-bold border-2 border-black rounded transition-colors ${
                  p === pageNo
                    ? "bg-[var(--brand-yellow)] text-black"
                    : "bg-white text-black hover:bg-[var(--brand-yellow)]"
                }`}
              >
                {p + 1}
              </button>
            )
          )}
          <button
            onClick={() => onPageChange(pageNo + 1)}
            disabled={pageNo >= totalPages - 1}
            className="btn-secondary py-1 px-3 text-sm disabled:opacity-40"
          >
            Дараах →
          </button>
        </nav>
      </div>
    </div>
  );
}
