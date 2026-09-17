import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-green-50 text-green-700",
  orange: "bg-orange-50 text-orange-700",
  red: "bg-red-50 text-red-700",
  slate: "bg-slate-100 text-slate-600",
} as const;

interface StatusBadgeProps {
  label: string;
  tone?: keyof typeof TONE_CLASSES;
}

export function StatusBadge({ label, tone = "slate" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        TONE_CLASSES[tone]
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
