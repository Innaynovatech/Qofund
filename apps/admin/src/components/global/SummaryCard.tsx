import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SummaryCardData {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon's background/text — controls the colored box */
  iconClassName?: string;
  change?: {
    label: string; // e.g. "+12.4% vs last month"
    direction: "up" | "down";
  };
}

function SummaryCard({ label, value, icon: Icon, iconClassName, change }: SummaryCardData) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md",
            iconClassName ?? "bg-slate-100 text-slate-500"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>

      {change && (
        <p
          className={cn(
            "mt-1 flex items-center gap-1 text-xs font-medium",
            change.direction === "up" ? "text-green-600" : "text-red-600"
          )}
        >
          {change.direction === "up" ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {change.label}
        </p>
      )}
    </div>
  );
}

/**
 * SummaryCardsGrid
 * Reusable metric-row: pass however many cards you need per page.
 *   <SummaryCardsGrid cards={dashboardMetrics} />
 */
export function SummaryCardsGrid({ cards }: { cards: SummaryCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <SummaryCard key={card.id} {...card} />
      ))}
    </div>
  );
}
