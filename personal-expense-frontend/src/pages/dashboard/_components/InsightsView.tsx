import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, Wallet, PiggyBank, DollarSign } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { startOfMonth, endOfMonth, format, subMonths } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

import type { Transaction } from "@/types/transaction";
import type { Budget } from "@/types/budget";
import type { Investment } from "@/types/investment";
import type { Account } from "@/types/account";
import type { Category } from "@/types/category";

/* ---------------- HELPERS ---------------- */

const formatKES = (value: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(isNaN(value) ? 0 : value);

/* ---------------- COMPONENT ---------------- */

export function InsightsView() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => apiFetch<Transaction[]>("/transactions"),
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => apiFetch<Budget[]>("/budgets"),
  });

  const { data: investments = [] } = useQuery({
    queryKey: ["investments"],
    queryFn: () => apiFetch<Investment[]>("/investments"),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch<Category[]>("/categories"),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => apiFetch<Account[]>("/accounts"),
  });

  /* ---------- LOADING ---------- */
  if (isLoading) {
    return <div className="h-40 animate-pulse bg-muted rounded-xl" />;
  }

  /* ---------- METRICS ---------- */

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const cashBalance = totalIncome - totalExpenses;

  const totalInvested = investments.reduce((s, i) => s + (i?.principal || 0), 0);

  const currentInvestmentValue = investments.reduce(
    (s, i) => s + (i?.currentValue || 0),
    0,
  );

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);

  const investmentGains = currentInvestmentValue - totalInvested;
  const netWorth = totalBalance + currentInvestmentValue;

  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const healthScore = Math.min(
    100,
    Math.max(0, savingsRate * 1.2 + (investmentGains > 0 ? 10 : 0)),
  );

  /* ---------- NET WORTH TREND ---------- */

  const getDateTs = (date: string | number) =>
    typeof date === "string" ? new Date(date).getTime() : date;

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    return {
      label: format(date, "MMM"),
      end: endOfMonth(date).getTime(),
    };
  });

  const netWorthData = last6Months.map((month) => {
    const income = transactions
      .filter((t) => getDateTs(t.date) <= month.end && t.type === "income")
      .reduce((s, t) => s + t.amount, 0);

    const expenses = transactions
      .filter((t) => getDateTs(t.date) <= month.end && t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

    const cash = income - expenses;

    const investmentsValue = investments.reduce(
      (s, i) => s + (i.currentValue || 0),
      0,
    );

    return {
      month: month.label,
      Cash: cash,
      Investments: investmentsValue,
      NetWorth: cash + investmentsValue,
    };
  });

  const netWorthGrowth =
    netWorthData.length > 1
      ? netWorthData[netWorthData.length - 1].NetWorth -
        netWorthData[0].NetWorth
      : 0;

  /* ---------- CATEGORY ---------- */

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  const categoryTotals = transactions
    .filter((t) => t.type === "expense" && t.categoryId)
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.categoryId!] = (acc[t.categoryId!] || 0) + t.amount;
      return acc;
    }, {});

  const categoryChartData = Object.entries(categoryTotals)
    .map(([id, value]) => ({
      name: categoryMap[id] ?? "Unknown",
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const topCategory = categoryChartData[0];
  const COLORS = {
    cash: "#22c55e", // green
    investments: "#6366f1", // indigo
    pie: ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#14b8a6"],
  };
  /* ---------- UI ---------- */

  return (
    <div className="space-y-6">
      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Wallet} label="Net Worth" value={netWorth} />
        <MetricCard icon={DollarSign} label="Cash" value={cashBalance} />
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

      {/* NET WORTH CHART */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Net Worth Breakdown</CardTitle>
          <CardDescription>Cash vs Investments over time</CardDescription>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={netWorthData}>
              <defs>
                <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.05}
                  />
                </linearGradient>

                <linearGradient id="investGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="hsl(var(--border))" opacity={0.15} />

              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />

              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "10px",
                  backdropFilter: "blur(10px)",
                }}
                formatter={(value: number) => formatKES(value)}
              />

              {/* CASH */}
              <Area
                type="monotone"
                dataKey="Cash"
                stackId="1"
                stroke={COLORS.cash}
                fill={COLORS.cash}
                fillOpacity={0.2}
                strokeWidth={2}
                isAnimationActive
              />

              {/* INVESTMENTS */}
              <Area
                type="monotone"
                dataKey="Investments"
                stackId="1"
                stroke={COLORS.investments}
                fill={COLORS.investments}
                fillOpacity={0.2}
                strokeWidth={2}
                isAnimationActive
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* QUICK INSIGHTS */}
      <div className="grid md:grid-cols-3 gap-4">
        <InsightCard
          title="Top Spending"
          value={topCategory?.name ?? "N/A"}
          sub={formatKES(topCategory?.value ?? 0)}
        />
        <InsightCard
          title="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
        />
        <InsightCard
          title="Investment Growth"
          value={formatKES(investmentGains)}
        />
      </div>

      {/* CATEGORY CHART */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryChartData.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              No spending data
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {categoryChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS.pie[i % COLORS.pie.length]} />
                  ))}
                </Pie>

                <Tooltip formatter={(value: number) => formatKES(value)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function MetricCard({ icon: Icon, label, value, delta, suffix = "" }: any) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <Icon className="w-4 h-4" /> {label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-2xl font-bold">
          {formatKES(value)}
          {suffix}
        </CardTitle>
        {delta !== undefined && (
          <p className={delta >= 0 ? "text-green-400" : "text-red-400"}>
            {delta >= 0 ? "+" : ""}
            {formatKES(delta)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function InsightCard({ title, value, sub }: any) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold">{value}</p>
        {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}
