import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { Account } from "@/types/account";
import type { Category } from "@/types/category";
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
  const accountsQuery = useQuery<Account[]>({
    queryKey: ["accounts"],
    queryFn: () => apiFetch<Account[]>(`/accounts`),
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
  const accounts = Array.isArray(accountsQuery.data) ? accountsQuery.data : [];

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );
  const investmentGains = currentInvestmentValue - totalInvested;
  const netWorth = totalBalance + currentInvestmentValue;

  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  /* ---------- Charts ---------- */

  // Spending by category
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  const categoryTotals = transactions
    .filter((t) => t.type === "expense" && t.categoryId)
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.categoryId!] = (acc[t.categoryId!] || 0) + t.amount;
      return acc;
    }, {});

  const categoryChartData = Object.entries(categoryTotals)
    .map(([categoryId, value]) => ({
      name: categoryMap[categoryId] ?? "Unknown",
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const getDateTs = (date: string | number) =>
    typeof date === "string" ? new Date(date).getTime() : date;

  // Income vs Expenses over last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    return {
      month: format(date, "MMM"),
      startDate: startOfMonth(date).getTime(),
      endDate: endOfMonth(date).getTime(),
    };
  });
  const monthlyData = last6Months.map((month) => {
    const monthTransactions = transactions.filter((t) => {
      const ts = getDateTs(t.date);
      return ts >= month.startDate && ts <= month.endDate;
    });

    return {
      month: month.month,
      Income: monthTransactions
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0),
      Expenses: monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0),
    };
  });

  // Investment breakdown by type
  const investmentsByType = investments.reduce(
    (acc, inv) => {
      const currentValue = inv.quantity * inv.currentPrice;
      acc[inv.type] = (acc[inv.type] || 0) + currentValue;
      return acc;
    },
    {} as Record<string, number>,
  );

  const investmentChartData = Object.entries(investmentsByType).map(
    ([name, value]) => ({
      name,
      value,
    }),
  );

  // Budget utilization
  const now = Date.now();
  const budgetUtilization = budgets.map((budget) => {
    const categoryExpenses = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.categoryId === budget.categoryId &&
          getDateTs(t.date) >= budget.startDate,
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = (categoryExpenses / budget.limit) * 100;
    return {
      category: budget.categoryId,
      used: categoryExpenses,
      limit: budget.limit,
      percentage: Math.min(percentage, 100),
    };
  });
  /* ---------- UI ---------- */

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Wallet} label="Net Worth" value={netWorth} />
        <MetricCard
          icon={DollarSign}
          label="Cash Balance"
          value={cashBalance}
        />
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
      {monthlyData.some((d) => d.Income > 0 || d.Expenses > 0) && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>...</LineChart>
        </ResponsiveContainer>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Last 6 months trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <defs>
                  <linearGradient
                    id="incomeGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={COLORS.chart2}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.chart2}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient
                    id="expenseGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={COLORS.chart5}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.chart5}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.3}
                />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => `KES ${value.toFixed(2)}`}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
                <Line
                  type="monotone"
                  dataKey="Income"
                  stroke={COLORS.chart2}
                  strokeWidth={3}
                  dot={{ fill: COLORS.chart2, r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="Expenses"
                  stroke={COLORS.chart5}
                  strokeWidth={3}
                  dot={{ fill: COLORS.chart5, r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Spending by Category */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Top expense categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                    name,
                  }) => {
                    const radius =
                      innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x =
                      cx + radius * Math.cos((-midAngle * Math.PI) / 180);
                    const y =
                      cy + radius * Math.sin((-midAngle * Math.PI) / 180);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        style={{ fontWeight: "bold", fontSize: "12px" }}
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={2}
                  stroke="hsl(var(--background))"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        [
                          COLORS.chart1,
                          COLORS.chart2,
                          COLORS.chart3,
                          COLORS.chart4,
                          COLORS.chart5,
                          COLORS.accent,
                        ][index % 6]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number) => [
                    `KES ${value.toFixed(2)}`,
                    "Amount",
                  ]}
                  labelStyle={{
                    color: "hsl(var(--foreground))",
                    fontWeight: "bold",
                  }}
                />
                <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Utilization */}
        {budgetUtilization.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Budget Utilization</CardTitle>
              <CardDescription>Current spending vs limits</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetUtilization}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="category"
                    stroke="hsl(var(--muted-foreground))"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => `KES ${value.toFixed(2)}`}
                    labelStyle={{
                      color: "hsl(var(--foreground))",
                      fontWeight: "bold",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
                  <Bar
                    dataKey="used"
                    fill={COLORS.chart5}
                    name="Spent"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="limit"
                    fill={COLORS.chart1}
                    name="Budget"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Investment Allocation */}
        {investmentChartData.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Investment Allocation</CardTitle>
              <CardDescription>Portfolio distribution by type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={investmentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                      name,
                    }) => {
                      const radius =
                        innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x =
                        cx + radius * Math.cos((-midAngle * Math.PI) / 180);
                      const y =
                        cy + radius * Math.sin((-midAngle * Math.PI) / 180);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="white"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                          style={{ fontWeight: "bold", fontSize: "12px" }}
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={2}
                    stroke="hsl(var(--background))"
                  >
                    {investmentChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          [
                            COLORS.chart3,
                            COLORS.chart1,
                            COLORS.chart2,
                            COLORS.chart4,
                            COLORS.chart5,
                            COLORS.primary,
                            COLORS.accent,
                          ][index % 7]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [
                      `KES ${value.toFixed(2)}`,
                      "Value",
                    ]}
                    labelStyle={{
                      color: "hsl(var(--foreground))",
                      fontWeight: "bold",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Financial Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
          <CardDescription>Overview of your financial health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-accent">
                KES {totalIncome.toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-destructive">
                KES {totalExpenses.toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Invested</p>
              <p className="text-2xl font-bold">
                KES {totalInvested.toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Budgets</p>
              <p className="text-2xl font-bold">{budgets.length}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Total Transactions
              </p>
              <p className="text-2xl font-bold">{transactions.length}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Investment Holdings
              </p>
              <p className="text-2xl font-bold">{investments.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
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
          KES {value.toFixed(2)}
          {suffix}
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
