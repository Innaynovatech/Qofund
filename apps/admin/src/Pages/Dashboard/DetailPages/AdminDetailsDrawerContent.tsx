import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/global/StatusBadge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useGetInitials } from "@/components/global/utils/useGetInitials";


export interface AdminDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  status: "Active" | "Suspended" | "Pending";
}

export interface ActivityLogItem {
  id: string;
  actor: string;
  action: string;
  detail: string;
  timestamp: string;
}

const STATUS_TONE = {
  Active: "green",
  Suspended: "red",
  Pending: "orange",
} as const;

interface AdminDetailsDrawerContentProps {
  admin: AdminDetails;
  activity: ActivityLogItem[];
  onAssignRole?: () => void;
  onViewLogs?: () => void;
  onDeactivate?: () => void;
  onViewAllActivity?: () => void;
}

export function AdminDetailsDrawerContent({
  admin,
  activity,
  onAssignRole,
  onViewLogs,
  onDeactivate,
  onViewAllActivity,
}: AdminDetailsDrawerContentProps) {
  return (
    <div className="space-y-6 px-5 py-5">
      {/* Avatar + name/status flex against the Quick Actions select */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar size='lg'>
                <AvatarImage src={admin?.name} alt={admin?.name} />
                <AvatarFallback>{useGetInitials(admin?.name)}</AvatarFallback>
              </Avatar>
          {/* name and status stacked (block) inside the flex row */}
          <div>
            <p className="text-sm font-semibold text-slate-900">{admin.name}</p>
            <div className="mt-1">
              <StatusBadge label={admin.status} tone={STATUS_TONE[admin.status]} />
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Quick Actions
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onAssignRole}>Assign Role</DropdownMenuItem>
            <DropdownMenuItem onClick={onViewLogs}>View Logs</DropdownMenuItem>
            <DropdownMenuItem onClick={onDeactivate} className="text-red-600 focus:text-red-600">
              Deactivate Admin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* User Details */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">User Details</p>
        <div className="grid grid-cols-2 gap-y-4 text-sm">
          <div>
            <p className="text-xs text-slate-400">AdminID</p>
            <p className="mt-0.5 font-medium text-slate-900">{admin.id}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Name</p>
            <p className="mt-0.5 font-medium text-slate-900">{admin.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Email</p>
            <p className="mt-0.5 font-medium text-slate-900">{admin.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Role</p>
            <p className="mt-0.5 font-medium text-slate-900">{admin.role}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Last Login</p>
            <p className="mt-0.5 font-medium text-slate-900">{admin.lastLogin}</p>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Recent Activities</p>
          <button type="button" onClick={onViewAllActivity} className="text-xs font-medium text-blue-700 hover:underline">
            View All
          </button>
        </div>
        <ul className="space-y-2">
          {activity.map((item) => (
            <li key={item.id} className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.actor}</p>
                  <p className="text-sm text-slate-600">{item.action}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{item.detail}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{item.timestamp}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
