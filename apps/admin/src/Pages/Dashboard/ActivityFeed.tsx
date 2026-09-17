export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  timestamp: string; // pre-formatted, e.g. "2m ago"
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
          <div className="flex-1 text-sm">
            <p className="text-slate-700">
              <span className="font-medium text-slate-900">{item.actor}</span>{" "}
              {item.action}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">{item.timestamp}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
