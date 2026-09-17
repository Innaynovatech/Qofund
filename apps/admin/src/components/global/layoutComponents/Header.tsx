import { Bell, Search, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useGetInitials } from "../utils/useGetInitials";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export interface HeaderUser {
  name: string;
  avatarUrl?: string;
}

interface HeaderProps {
  user: HeaderUser;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  hasUnreadNotifications?: boolean;
  onNotificationsClick?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
}

export default function Header({
  user,
  searchPlaceholder = "Search loan, customer, transaction",
  onSearch,
  hasUnreadNotifications = false,
  onNotificationsClick,
  onProfileClick,
  onSettingsClick,
  onLogout,
}: HeaderProps) {
  return (
    <header className="flex h-12 items-center justify-end items-center gap-4 border-b border-[#E7E7E7] bg-white px-6">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className="rounded-full bg-slate-50 pl-9"
        />
      </div>

      {/* Notifications + user menu */}
      <div className="flex shrink-0 items-center gap-4">
        <button
          type="button"
          onClick={onNotificationsClick}
          className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {hasUnreadNotifications && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger >
            <button type="button" className="flex items-center gap-2 rounded-full pr-1">
              <Avatar>
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback>{useGetInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-700">{user?.name}</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onProfileClick}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={onSettingsClick}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
