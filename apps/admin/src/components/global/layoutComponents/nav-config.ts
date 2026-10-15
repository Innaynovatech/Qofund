import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  GitBranch,
  Users,
  //Wallet,
  //Repeat,
  //ShieldCheck,
  UserCog,
  FileText,
  //Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Default nav config matching the current screens (Operations / System).
 * Pass your own via <Sidebar sections={...} /> if this needs to differ per role.
 */
export const DEFAULT_NAV_SECTIONS: NavSection[] = [
  {
    title: "Operations",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Customers", href: "/loan-pipeline", icon: GitBranch },
      { label: "Transactions", href: "/customers", icon: Users },
    ],
  },
  {
    title: "System",
    items: [
      { label: "User Management", href: "/user-management", icon: UserCog },
      { label: "Report", href: "/report", icon: FileText },
    ],
  },
];
