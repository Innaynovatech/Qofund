import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageList(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "ellipsis")[] = [1, 2, 3];
  if (current > 4) pages.push("ellipsis");
  pages.push(total - 2, total - 1, total);
  return Array.from(new Set(pages)).sort((a, b) => (a === "ellipsis" || b === "ellipsis" ? 0 : a - b));
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = getPageList(currentPage, totalPages);

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page, i) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-sm text-slate-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={cn(
                "h-8 w-8 rounded-md text-sm font-medium",
                page === currentPage ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
