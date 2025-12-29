import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  ActivityIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, subMonths } from "date-fns";

const COLORS = {
  chart1: "hsl(var(--chart-1))",
  chart2: "hsl(var(--chart-2))",
  chart3: "hsl(var(--chart-3))",
};

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

type DateRange = "7d" | "30d" | "3m" | "6m" | "1y" | "all";

interface ReportSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
}

interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

function resolveRange(range: DateRange) {
  const now = Date.now();
  switch (range) {
    case "7d":
      return { startDate: subDays(now, 7).getTime(), endDate: now };
    case "30d":
      return { startDate: subDays(now, 30).getTime(), endDate: now };
    case "3m":
      return { startDate: subMonths(now, 3).getTime(), endDate: now };
    case "6m":
      return { startDate: subMonths(now, 6).getTime(), endDate: now };
    case "1y":
      return { startDate: subMonths(now, 12).getTime(), endDate: now };
    default:
      return { startDate: 0, endDate: now };
  }
}

export function ReportsView() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const { startDate, endDate } = resolveRange(dateRange);

  const summary = useQuery<ReportSummary>({
    queryKey: ["report-summary", startDate, endDate],
    queryFn: () =>
      apiFetch(`/reports/summary?startDate=${startDate}&endDate=${endDate}`),
  });

  const incomeTrends = useQuery({
    queryKey: ["income-trends", startDate, endDate],
    queryFn: () =>
      apiFetch(
        `/reports/category-trends?type=income&startDate=${startDate}&endDate=${endDate}`
      ),
  });

  const expenseTrends = useQuery({
    queryKey: ["expense-trends", startDate, endDate],
    queryFn: () =>
      apiFetch(
        `/reports/category-trends?type=expense&startDate=${startDate}&endDate=${endDate}`
      ),
  });

  const monthlyTrends = useQuery<MonthlyTrend[]>({
    queryKey: ["monthly-trends", startDate, endDate],
    queryFn: () =>
      apiFetch(
        `/reports/monthly-trends?startDate=${startDate}&endDate=${endDate}`
      ),
  });

  const budgetPerformance = useQuery({
    queryKey: ["budget-performance"],
    queryFn: () => apiFetch("/reports/budget-performance"),
  });

  const goalProgress = useQuery({
    queryKey: ["goal-progress"],
    queryFn: () => apiFetch("/reports/goal-progress"),
  });

  if (
    summary.isLoading ||
    incomeTrends.isLoading ||
    expenseTrends.isLoading ||
    monthlyTrends.isLoading
  ) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-96 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Reports</h2>
        <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.data && (
          <>
            <StatCard
              icon={<DollarSignIcon className="h-4 w-4" />}
              label="Total Income"
              value={`KES ${summary.data.totalIncome.toLocaleString()}`}
              accent="text-accent"
            />
            <StatCard
              icon={<TrendingDownIcon className="h-4 w-4" />}
              label="Total Expenses"
              value={`KES ${summary.data.totalExpenses.toLocaleString()}`}
              accent="text-destructive"
            />
            <StatCard
              icon={<TrendingUpIcon className="h-4 w-4" />}
              label="Net Income"
              value={`KES ${summary.data.netIncome.toLocaleString()}`}
              accent={
                summary.data.netIncome >= 0 ? "text-accent" : "text-destructive"
              }
            />
            <StatCard
              icon={<ActivityIcon className="h-4 w-4" />}
              label="Savings Rate"
              value={`${summary.data.savingsRate.toFixed(1)}%`}
            />
          </>
        )}
      </div>

      {/* Monthly Trends */}
      {(monthlyTrends.data?.length ?? 0) > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(v) => {
                    const [y, m] = v.split("-");
                    return format(new Date(+y, +m - 1), "MMM yy");
                  }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey="income" stroke={COLORS.chart1} />
                <Line dataKey="expenses" stroke={COLORS.chart2} />
                <Line dataKey="net" stroke={COLORS.chart3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2">
          {icon}
          {label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${accent ?? ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
