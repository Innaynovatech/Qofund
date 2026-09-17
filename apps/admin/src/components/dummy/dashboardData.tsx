import type { ActivityItem } from "@/Pages/Dashboard/ActivityFeed";
import type { DisbursementPoint } from "@/components/charts/LoanDisbursementChart";
import { FileText, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { SummaryCardData } from "../global/SummaryCard";

export const SUMMARY_CARDS: SummaryCardData[] = [
  {
    id: "total-disbursed",
    label: "Total Loan Disbursed",
    value: "₦2.41B",
    icon: FileText,
    iconClassName: "bg-blue-50 text-blue-600",
    change: { label: "+12.4% vs last month", direction: "up" },
  },
  {
    id: "active-loans",
    label: "Active Loans",
    value: "1,284",
    icon: CheckCircle2,
    iconClassName: "bg-green-50 text-green-600",
    change: { label: "+12.4% vs last month", direction: "up" },
  },
  {
    id: "overdue",
    label: "Overdue",
    value: "38",
    icon: AlertTriangle,
    iconClassName: "bg-orange-50 text-orange-600",
    change: { label: "+12.4% vs last month", direction: "down" },
  },
  {
    id: "upcoming-payment",
    label: "Up coming payment",
    value: "₦2.41B",
    icon: XCircle,
    iconClassName: "bg-red-50 text-red-600",
    change: { label: "+12.4% vs last month", direction: "up" },
  },
];

export const DISBURSEMENT_TREND: DisbursementPoint[] = [
  { month: "Jan", value: 15 },
  { month: "Feb", value: 55 },
  { month: "Mar", value: 20 },
  { month: "Apr", value: 75 },
  { month: "May", value: 100 },
  { month: "Jun", value: 15 },
  { month: "Jul", value: 40 },
  { month: "Aug", value: 60 },
  { month: "Sep", value: 65 },
  { month: "Oct", value: 15 },
  { month: "Nov", value: 15 },
  { month: "Dec", value: 55 },
];

export interface LoanRequest {
  id: string;
  initials: string;
  name: string;
  tier: string;
  amount: string;
  duration: string;
  status: "In Review" | "Escalated" | "Pending";
}

export const LOAN_REQUESTS: LoanRequest[] = [
  { id: "1", initials: "CO", name: "Chinwe Okafor", tier: "Tier 2", amount: "₦450,000", duration: "0h 24m", status: "In Review" },
  { id: "2", initials: "IS", name: "Ibrahim Sule", tier: "Tier 2", amount: "₦450,000", duration: "0h 24m", status: "Escalated" },
  { id: "3", initials: "NE", name: "Ngozi Eze", tier: "Tier 2", amount: "₦450,000", duration: "0h 24m", status: "In Review" },
  { id: "4", initials: "FB", name: "Femi Bakare", tier: "Tier 2", amount: "₦450,000", duration: "0h 24m", status: "Pending" },
];

export const STATUS_TONE: Record<LoanRequest["status"], "blue" | "orange" | "slate"> = {
  "In Review": "blue",
  Escalated: "orange",
  Pending: "slate",
};

export const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "1", actor: "Adaeze O.", action: "approved a ₦450k loan", timestamp: "2m ago" },
  { id: "2", actor: "System", action: "auto-flagged 3 overdue loans", timestamp: "2m ago" },
  { id: "3", actor: "Tunde A.", action: "uploaded KYC for review", timestamp: "2m ago" },
  { id: "4", actor: "Maryam Y.", action: "made repayment of ₦42k", timestamp: "1h ago" },
  { id: "5", actor: "Credit team", action: "escalated loan #LN-3892", timestamp: "1h ago" },
];