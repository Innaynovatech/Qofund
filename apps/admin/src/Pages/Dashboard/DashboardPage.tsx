//import { FileText, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

import { ActivityFeed } from "./ActivityFeed";
import { type ColumnDef, CustomTable } from "@/components/global/CustomTable";
import { DashboardCard } from "@/components/global/DashboardCard";
// import { useFilterToggle, FilterButton, FilterPanel } from "@/components/global/FilterToggle";
import { PageHeader } from "@/components/global/PageHeader";
import { StatusBadge } from "@/components/global/StatusBadge";
import {  SummaryCardsGrid } from "@/components/global/SummaryCard";
import {  LoanDisbursementChart } from "../../components/charts/LoanDisbursementChart";
import { type LoanRequest, STATUS_TONE, SUMMARY_CARDS, DISBURSEMENT_TREND, LOAN_REQUESTS, RECENT_ACTIVITY } from "@/components/dummy/dashboardData";

// --- Mock data — replace with real API calls ---



const loanRequestColumns: ColumnDef<LoanRequest>[] = [
  {
    key: "name",
    header: "Borrower",
    render: (row) => (
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
          {row.initials}
        </span>
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-400">{row.tier}</p>
        </div>
      </div>
    ),
  },
  { key: "amount", header: "Amount" },
  { key: "duration", header: "Duration" },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge label={row.status} tone={STATUS_TONE[row.status]} />,
  },
];

// --- Page ---

export default function DashboardPage() {
  //const filter = useFilterToggle();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Live snapshot of your loan portfolio — ${today}`}
        // actions={<FilterButton {...filter} />}
      />

      {/* {filter.open && (
        <FilterPanel>
          <input
            type="search"
            placeholder="Search..."
            className="w-56 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          <select className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            <option>All statuses</option>
            <option>In Review</option>
            <option>Escalated</option>
            <option>Pending</option>
          </select>
          <select className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            <option>Last 12 weeks</option>
            <option>Last 4 weeks</option>
            <option>This year</option>
          </select>
        </FilterPanel>
      )} */}

      <SummaryCardsGrid cards={SUMMARY_CARDS} />

      <DashboardCard title="Loan Disbursement Trend" subtitle="Last 12 weeks" onMoreClick={() => {}}>
        <LoanDisbursementChart data={DISBURSEMENT_TREND} />
      </DashboardCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashboardCard title="Loan Request" className="lg:col-span-2" bodyClassName="px-5 py-2">
          <CustomTable
            columns={loanRequestColumns}
            data={LOAN_REQUESTS}
            keyExtractor={(row) => row.id}
          />
        </DashboardCard>

        <DashboardCard title="Recent Activity">
          <ActivityFeed items={RECENT_ACTIVITY} />
        </DashboardCard>
      </div>
    </div>
  );
}
