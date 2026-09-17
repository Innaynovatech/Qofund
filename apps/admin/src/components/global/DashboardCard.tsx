import type { ReactNode } from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  /** Overrides the default "..." button, e.g. a real dropdown menu */
  actions?: ReactNode;
  onMoreClick?: () => void;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/**
 * DashboardCard
 * Generic panel used for anything that needs the "white card with a header
 * row" treatment — the disbursement chart, the loan request table, the
 * activity feed, etc. Reuse this instead of rebuilding the card chrome.
 */
export function DashboardCard({
  title,
  subtitle,
  actions,
  onMoreClick,
  children,
  className,
  bodyClassName,
}: DashboardCardProps) {
  const hasHeader = title || subtitle || actions || onMoreClick;

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white", className)}>
      {hasHeader && (
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
          </div>
          {actions ?? (
            onMoreClick && (
              <button
                type="button"
                onClick={onMoreClick}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            )
          )}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </div>
  );
}
