import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  DollarSign,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { startOfMonth, endOfMonth, format, subMonths } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Transaction } from "@/types/transaction";
import type { Budget } from "@/types/budget";
import type { Investment } from "@/types/investment";

/* ---------------- COLORS ---------------- */

const COLORS = {
  primary: "hsl(var(--primary))",
  accent: "hsl(var(--accent))",
  secondary: "hsl(var(--secondary))",
  destructive: "hsl(var(--destructive))",
  chart1: "hsl(var(--chart-1))",
  chart2: "hsl(var(--chart-2))",
  chart3: "hsl(var(--chart-3))",
  chart4: "hsl(var(--chart-4))",
  chart5: "hsl(var(--chart-5))",
};

/* ---------------- COMPONENT ---------------- */

export function InsightsView() {
  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => apiFetch<Transaction[]>("/api/transactions"),
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => apiFetch<Budget[]>("/api/budgets"),
  });

  const { data: investments = [] } = useQuery({
    queryKey: ["investments"],
    queryFn: () => apiFetch<Investment[]>("/api/investments"),
  });

  /* ---------- Loading ---------- */
  if (txLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Metrics ---------- */

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const cashBalance = totalIncome - totalExpenses;

  const totalInvested = investments.reduce(
    (s, i) => s + i.quantity * i.purchasePrice,
    0,
  );

  const currentInvestmentValue = investments.reduce(
    (s, i) => s + i.quantity * i.currentPrice,
    0,
  );

  const investmentGains = currentInvestmentValue - totalInvested;
  const netWorth = cashBalance + currentInvestmentValue;

  const savingsRate =
    totalIncome > 0
      ? ((totalIncome - totalExpenses) / totalIncome) * 100
      : 0;

  /* ---------- Charts ---------- */

  // Spending by category
  const categoryChartData = Object.entries(
    transactions
      .filter((t) => t.type === "expense")
      .reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Last 6 months
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const start = startOfMonth(date).getTime();
    const end = endOfMonth(date).getTime();

    const monthTx = transactions.filter(
      (t) => t.date >= start && t.date <= end,
    );

    return {
      month: format(date, "MMM"),
      Income: monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      Expenses: monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  });

  // Investment allocation
  const investmentChartData = Object.entries(
    investments.reduce<Record<string, number>>((acc, i) => {
      acc[i.type] = (acc[i.type] || 0) + i.quantity * i.currentPrice;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  // Budget utilization
const budgetUtilization = budgets.map((b) => {
  const spent = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        b.categoryIds.includes(t.category) &&
        t.date >= b.startDate
    )
    .reduce((s, t) => s + t.amount, 0);

  return {
    categoryIds: b.categoryIds,
    used: spent,
    limit: b.limit,
  };
});


  /* ---------- UI ---------- */

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Wallet} label="Net Worth" value={netWorth} />
        <MetricCard icon={DollarSign} label="Cash Balance" value={cashBalance} />
        <MetricCard
          icon={TrendingUp}
          label="Investments"
          value={currentInvestmentValue}
          delta={investmentGains}
        />
        <MetricCard
          icon={PiggyBank}
          label="Savings Rate"
          value={savingsRate}
          suffix="%"
        />
      </div>

      {/* Charts */}
      {/* (Your existing chart JSX stays unchanged below this point) */}
      {/* KEEP everything else as-is */}
    </div>
  );
}

/* ---------------- SMALL HELPER ---------------- */

function MetricCard({
  icon: Icon,
  label,
  value,
  delta,
  suffix = "",
}: {
  icon: any;
  label: string;
  value: number;
  delta?: number;
  suffix?: string;
}) {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardDescription className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-3xl font-bold">
          KES {value.toFixed(2)}{suffix}
        </CardTitle>
        {delta !== undefined && (
          <p
            className={`text-sm mt-1 ${
              delta >= 0 ? "text-accent" : "text-destructive"
            }`}
          >
            {delta >= 0 ? "+" : ""}KES {delta.toFixed(2)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}