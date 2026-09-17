import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  key: string;
  header: string;
  /** Custom cell renderer. Falls back to `row[key]` if omitted. */
  render?: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  /** Set true for columns with their own interactive controls (action menus, etc.)
   *  so clicking inside them doesn't also fire onRowClick. */
  stopRowClick?: boolean;
}

interface CustomTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  /** Optional leading checkbox column, e.g. for bulk actions */
  selectable?: boolean;
  selectedKeys?: string[];
  onToggleRow?: (key: string) => void;
  onToggleAll?: (checked: boolean) => void;
  /** Makes rows clickable, e.g. to open a details drawer */
  onRowClick?: (row: T) => void;
}

export function CustomTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No records found.",
  selectable = false,
  selectedKeys = [],
  onToggleRow,
  onToggleAll,
  onRowClick,
}: CustomTableProps<T>) {
  const allSelected = data.length > 0 && selectedKeys.length === data.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
            {selectable && (
              <th className="w-10 py-3 pr-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onToggleAll?.(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} className={cn("py-3 pr-4 font-medium", col.headerClassName)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-8 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const key = keyExtractor(row);
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b border-slate-50 last:border-0",
                    onRowClick && "cursor-pointer hover:bg-slate-50"
                  )}
                >
                  {selectable && (
                    <td className="py-3 pr-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedKeys.includes(key)}
                        onChange={() => onToggleRow?.(key)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      onClick={col.stopRowClick ? (e) => e.stopPropagation() : undefined}
                      className={cn("py-3 pr-4 text-slate-700", col.className)}
                    >
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
