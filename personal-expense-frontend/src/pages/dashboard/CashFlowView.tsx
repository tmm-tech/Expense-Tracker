import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";

import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Lightbulb,
} from "lucide-react";

export function CashFlowView() {
  const [forecastMonths, setForecastMonths] = useState(6);
  type CashFlowForecastResponse = {
    forecast: {
      date: number;
      projectedBalance: number;
      income: number;
      expenses: number;
    }[];
    summary: {
      currentBalance: number;
      projectedBalance: number;
      averageMonthlyIncome: number;
      averageMonthlyExpenses: number;
      insights: string[];
      shortfalls: {
        date: number;
        deficit: number;
      }[];
    };
  };

  const { data, isLoading } = useQuery<CashFlowForecastResponse>({
    queryKey: ["cash-flow-forecast", forecastMonths],
    queryFn: () => apiFetch(`/cash-flow/forecast?months=${forecastMonths}`),
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const { forecast: forecastData, summary } = data;

  const chartData = forecastData.map((point: any) => ({
    date: format(point.date, "MMM dd"),
    fullDate: format(point.date, "MMM dd, yyyy"),
    balance: point.projectedBalance,
    income: point.income,
    expenses: point.expenses,
    netChange: point.income - point.expenses,
  }));

  const balanceChange = summary.projectedBalance - summary.currentBalance;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Cash Flow Forecast</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Projected income, expenses, and balance over time
          </p>
        </div>
        <div className="flex gap-2">
          {[3, 6, 12].map((m) => (
            <Button
              key={m}
              size="sm"
              variant={forecastMonths === m ? "default" : "outline"}
              onClick={() => setForecastMonths(m)}
            >
              {m} Months
            </Button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <SummaryCard
          label="Current"
          value={summary.currentBalance}
          icon={<DollarSign />}
        />
        <SummaryCard
          label="Projected"
          value={summary.projectedBalance}
          positive={balanceChange >= 0}
          icon={balanceChange >= 0 ? <TrendingUp /> : <TrendingDown />}
        />
        <SummaryCard
          label="Avg Income"
          value={summary.averageMonthlyIncome}
          color="text-blue-500"
          icon={<ArrowUpCircle />}
        />
        <SummaryCard
          label="Avg Expenses"
          value={summary.averageMonthlyExpenses}
          color="text-orange-500"
          icon={<ArrowDownCircle />}
        />
      </div>

      {/* Balance Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Projected Balance</CardTitle>
          <CardDescription>Estimated balance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="balanceGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopOpacity={0.55} />
                  <stop offset="95%" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(v: number) => `KES ${v.toLocaleString()}`} />
              <ReferenceLine y={0} stroke="red" strokeDasharray="3 3" />
              <Area
                dataKey="balance"
                stroke="hsl(var(--primary))"
                fill="url(#balanceGradient)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Lightbulb />
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary.insights.map((text: string, i: number) => (
            <div
              key={i}
              className="p-3 rounded-lg border bg-muted/40 flex gap-2"
            >
              {text.includes("⚠️") && (
                <AlertTriangle className="text-yellow-500" />
              )}
              {text.includes("✅") && (
                <CheckCircle2 className="text-green-500" />
              )}
              <p className="text-sm">{text}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Shortfalls */}
      {summary.shortfalls.length > 0 && (
        <Card className="glass-card border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-500 flex gap-2">
              <AlertTriangle />
              Potential Shortfalls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary.shortfalls.map((s: any, i: number) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-red-500/20 flex justify-between"
              >
                <div className="flex gap-2">
                  <Calendar className="text-red-500" />
                  <span>{format(s.date, "MMM dd, yyyy")}</span>
                </div>
                <span className="text-red-500">
                  -KES {s.deficit.toLocaleString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ------------------ helpers ------------------ */

function SummaryCard({
  label,
  value,
  icon,
  positive,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  positive?: boolean;
  color?: string;
}) {
  return (
    <Card className="glass-card">
      <CardContent className="pt-6 flex gap-3 items-center">
        <div className="p-2 rounded-lg bg-muted">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p
            className={cn(
              "text-lg font-bold",
              color,
              positive === false && "text-red-500",
              positive === true && "text-green-500",
            )}
          >
            KES {value.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
