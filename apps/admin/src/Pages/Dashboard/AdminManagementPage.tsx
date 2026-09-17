import { useState } from "react";
import { Search, ShieldCheck, Users, UserPlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "../../components/global/PageHeader";
import { SummaryCardsGrid, type SummaryCardData } from "../../components/global/SummaryCard";
import { CustomTable, type ColumnDef } from "../../components/global/CustomTable";
import { StatusBadge } from "../../components/global/StatusBadge";
import { Tabs, type TabItem } from "../../components/global/Tabs";
import { Pagination } from "../../components/global/Pagination";
import { RowActionsMenu } from "../../components/global/RowActionsMenu";
import { useDrawer } from "@/components/global/CustomDrawer";
import { type ActivityLogItem, AdminDetailsDrawerContent } from "./DetailPages/AdminDetailsDrawerContent";


// --- Mock data — replace with real API calls ---

const TABS: TabItem[] = [
  { key: "admin", label: "Admin" },
  { key: "roles", label: "Roles" },
  { key: "permissions", label: "Permissions" },
];

const SUMMARY_CARDS: SummaryCardData[] = [
  {
    id: "total-roles",
    label: "Total Roles",
    value: "12",
    icon: ShieldCheck,
    iconClassName: "bg-purple-50 text-purple-600",
    change: { label: "+6% from last month", direction: "up" },
  },
  {
    id: "total-admins",
    label: "Total Admins",
    value: "15",
    icon: Users,
    iconClassName: "bg-purple-50 text-purple-600",
    change: { label: "+6% from last month", direction: "up" },
  },
  {
    id: "pending-invites",
    label: "Pending Invites",
    value: "6",
    icon: UserPlus2,
    iconClassName: "bg-orange-50 text-orange-600",
    change: { label: "+6% from last month", direction: "up" },
  },
];

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  status: "Active" | "Suspended" | "Pending";
}

const ADMINS: Admin[] = [
  { id: "Admin-001", name: "John Adam", email: "john12@gmail.com", role: "Super-Admin", lastLogin: "Sep, 2025, 2:30:48 PM", status: "Active" },
  { id: "Admin-002", name: "Peter Isaac", email: "peter12@gmail.com", role: "Finance-Admin", lastLogin: "Sep, 2025, 2:30:48 PM", status: "Suspended" },
  { id: "Admin-003", name: "Carol Davis", email: "Carol12@gmail.com", role: "Finance-Admin", lastLogin: "Sep, 2025, 2:30:48 PM", status: "Active" },
  { id: "Admin-004", name: "David Kim", email: "david12@gmail.com", role: "Super-Admin", lastLogin: "Sep, 2025, 2:30:48 PM", status: "Pending" },
  { id: "Admin-005", name: "Eva Johnson", email: "eva12@gmail.com", role: "Super-Admin", lastLogin: "Sep, 2025, 2:30:48 PM", status: "Active" },
];

const STATUS_TONE: Record<Admin["status"], "green" | "red" | "orange"> = {
  Active: "green",
  Suspended: "red",
  Pending: "orange",
};

// Mock — swap for a per-admin activity fetch keyed off admin.id
const MOCK_ACTIVITY: ActivityLogItem[] = [
  { id: "1", actor: "John Adam", action: "Loan Application Approved", detail: "₦150,000 loan approved for Michael Johnson by Head of Credit", timestamp: "2 mins ago" },
  { id: "2", actor: "John Adam", action: "Loan Marked Overdue", detail: "Sarah Ahmed submitted a new 90-day loan request", timestamp: "2 mins ago" },
  { id: "3", actor: "John Adam", action: "Repayment Received", detail: "₦25,000 repayment received from David Okafor", timestamp: "2 mins ago" },
  { id: "4", actor: "John Adam", action: "Loan Marked Overdue", detail: "Loan account for Esther Williams is now 3 days overdue", timestamp: "2 hours ago" },
];

export default function AdminManagementPage() {
  const [activeTab, setActiveTab] = useState("admin");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>(["Admin-001", "Admin-002"]);
  const [page, setPage] = useState(1);
  const { openDrawer } = useDrawer();

  function handleRowClick(admin: Admin) {
    openDrawer(
      <AdminDetailsDrawerContent
        admin={admin}
        activity={MOCK_ACTIVITY}
        onAssignRole={() => {}}
        onViewLogs={() => {}}
        onDeactivate={() => {}}
        onViewAllActivity={() => {}}
      />,
      { title: "Admin details" }
    );
  }

  const columns: ColumnDef<Admin>[] = [
    { key: "id", header: "Admin ID" },
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role" },
    { key: "lastLogin", header: "Last Login" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge label={row.status} tone={STATUS_TONE[row.status]} />,
    },
    {
      key: "action",
      header: "Action",
      stopRowClick: true,
      render: (_row) => (
        <RowActionsMenu
          actions={[
            { label: "Edit admin", onClick: () => {} },
            { label: "Suspend", onClick: () => {} },
            { label: "Remove admin", onClick: () => {}, destructive: true },
          ]}
        />
      ),
    },
  ];

  const filteredAdmins = ADMINS.filter((admin) => {
    const matchesSearch =
      search.trim() === "" ||
      admin.name.toLowerCase().includes(search.toLowerCase()) ||
      admin.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || admin.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      <PageHeader
        title="Admin Management"
        description={`${ADMINS.filter((a) => a.status === "Active").length} Active Admin`}
        actions={
          <Button className="bg-blue-900 hover:bg-blue-800">
            <UserPlus2 className="mr-1.5 h-4 w-4" />
            Invite Admin
          </Button>
        }
      />

      <SummaryCardsGrid cards={SUMMARY_CARDS} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search  Name Admin ID......."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600"
        >
          <option value="all">Status</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-5">
        <CustomTable
          columns={columns}
          data={filteredAdmins}
          keyExtractor={(row) => row.id}
          selectable
          selectedKeys={selectedIds}
          onToggleRow={(key) =>
            setSelectedIds((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
          }
          onToggleAll={(checked) => setSelectedIds(checked ? filteredAdmins.map((a) => a.id) : [])}
          onRowClick={handleRowClick}
        />
        <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />
      </div>
    </div>
  );
}
