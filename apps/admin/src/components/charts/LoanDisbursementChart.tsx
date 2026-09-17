import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export interface DisbursementPoint {
  month: string;
  value: number;
}

interface LoanDisbursementChartProps {
  data: DisbursementPoint[];
}

export function LoanDisbursementChart({ data }: LoanDisbursementChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#F1F5F9" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#94A3B8" }}
            label={{ value: "Month", position: "insideBottom", offset: -4, fontSize: 11, fill: "#94A3B8" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#94A3B8" }}
            label={{ value: "TOTAL LOAN", angle: -90, position: "insideLeft", fontSize: 10, fill: "#94A3B8" }}
          />
          <Tooltip
            cursor={{ fill: "#F8FAFC" }}
            contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 12 }}
          />
          <Bar dataKey="value" fill="#0F172A" radius={[4, 4, 0, 0]} barSize={20} background={{ fill: "#F1F5F9", radius: 4 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
