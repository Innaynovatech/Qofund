import { useState } from "react";
import { Landmark, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarNavLink } from "./SidebarNavLink";
import { DEFAULT_NAV_SECTIONS, type NavSection } from "./nav-config";

interface SidebarProps {
  sections?: NavSection[];
  brandName?: string;
  /** Controlled collapse state. Omit to let the sidebar manage its own state. */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({
  sections = DEFAULT_NAV_SECTIONS,
  brandName = "ALMS",
  collapsed: collapsedProp,
  onCollapsedChange,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = collapsedProp ?? internalCollapsed;

  function toggleCollapsed() {
    const next = !collapsed;
    onCollapsedChange?.(next);
    if (collapsedProp === undefined) setInternalCollapsed(next);
  }

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-slate-200 bg-[#FAF7F2] transition-all",
        collapsed ? "w-[72px]" : "w-60"
      )}
    >
      {/* Brand + collapse toggle */}
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-900 text-white">
            <Landmark className="h-4 w-4" />
          </div>
          {!collapsed && (
            <span className="truncate text-sm font-semibold text-blue-900">{brandName}</span>
          )}
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={toggleCollapsed}
          className="mx-auto mb-2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Expand sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      )}

      {/* Nav sections */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {sections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarNavLink key={item.href} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
