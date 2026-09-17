import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { NavItem } from "./nav-config";

interface SidebarNavLinkProps {
  item: NavItem;
  collapsed: boolean;
}

export function SidebarNavLink({ item, collapsed }: SidebarNavLinkProps) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-1 text-[12px] font-medium transition-colors",
          isActive
            ? "bg-blue-50 text-blue-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          collapsed && "justify-center px-2"
        )
      }
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge !== undefined && (
        <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
          {item.badge}
        </span>
      )}
    </NavLink>
  );
}
