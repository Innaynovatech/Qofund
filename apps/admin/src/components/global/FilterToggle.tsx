import { useState, type ReactNode } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared open/closed state for a filter toggle. Keep it in the parent page
 * so the button (usually in a header's actions slot) and the panel (usually
 * full-width below the header) can be positioned independently but stay in sync.
 *
 *   const filter = useFilterToggle();
 *   <PageHeader actions={<FilterButton {...filter} />} />
 *   {filter.open && <FilterPanel>...</FilterPanel>}
 */
export function useFilterToggle(defaultOpen = false) {
  const [open, setOpen] = useState(defaultOpen);
  return { open, toggle: () => setOpen((v) => !v) };
}

interface FilterButtonProps {
  open: boolean;
  toggle: () => void;
  label?: string;
}

export function FilterButton({ open, toggle, label = "Filter" }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      aria-expanded={open}
    >
      <Filter className="h-4 w-4" />
      {label}
      <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
    </button>
  );
}

export function FilterPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3", className)}>
      {children}
    </div>
  );
}
