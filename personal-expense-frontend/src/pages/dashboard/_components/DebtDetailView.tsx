import { format } from "date-fns";
import {
  ArrowLeftIcon,
  CalendarIcon,
  TrendingDownIcon,
  ClockIcon,
  DollarSignIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import type { Debt } from "@/types/debt";
/* =========================
   Types (REST)
========================= */

interface DebtPayment {
  id: string;
  amount: number;
  paymentDate: number;
  notes?: string;
}

interface DebtDetailViewProps {
  debt: Debt;
  onBack: () => void;
}

/* =========================
   Chart Colors
========================= */

const COLORS = {
  chart1: "hsl(var(--chart-1))",
  chart2: "hsl(var(--chart-2))",
  chart3: "hsl(var(--chart-3))",
};

/* =========================
   Component
========================= */

export default function DebtDetailView({ debt, onBack }: DebtDetailViewProps) {
  const {
    data: payments = [],
    isLoading,
    isError,
  } = useQuery<DebtPayment[]>({
    queryKey: ["debtPayments", debt.id],
    queryFn: async () => {
      const res = await fetch(`/debts/${debt.id}/payments`);
      if (!res.ok) throw new Error("Failed to fetch payments");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Debts
        </Button>
        <div className="h-96 glass-card animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}>
          Back to Debts
        </Button>
        <p className="text-destructive">Failed to load payment history.</p>
      </div>
    );
  }

  /* =========================
     Calculations
  ========================= */

  const progress =
    debt.originalAmount > 0
      ? ((debt.originalAmount - debt.currentBalance) / debt.originalAmount) *
        100
      : 0;

  const totalPaid = debt.originalAmount - debt.currentBalance;

  const calculatePayoffTimeline = () => {
    const monthlyRate = debt.interestRate / 100 / 12;
    let balance = debt.currentBalance;
    let months = 0;
    let totalInterest = 0;
    const timeline: {
      month: number;
      balance: number;
      totalInterest: number;
    }[] = [];

    while (balance > 0 && months < 360) {
      const interest = balance * monthlyRate;
      const principal = Math.max(
        Math.min(debt.minimumPayment - interest, balance),
        0
      );

      totalInterest += interest;
      balance -= principal;
      months++;

      if (months % 6 === 0 || balance <= 0) {
        timeline.push({
          month: months,
          balance: Math.max(balance, 0),
          totalInterest,
        });
      }

      if (principal <= 0) break;
    }

    return { months, totalInterest, timeline };
  };

  const payoffData = calculatePayoffTimeline();
  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + payoffData.months);

  const paymentHistory = payments
    .slice(-10)
    .map((p) => ({
      date: format(p.paymentDate, "MMM dd"),
      amount: p.amount,
    }));

  /* =========================
     UI
  ========================= */

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Debts
      </Button>

      {/* Header */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{debt.name}</CardTitle>
              <CardDescription className="mt-1">
                {debt.type} • {debt.creditor}
              </CardDescription>
            </div>
            {debt.status && (
              <Badge variant="outline">{debt.status}</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Balance" value={`KES ${debt.currentBalance.toFixed(2)}`} />
            <Stat label="Interest" value={`${debt.interestRate.toFixed(2)}%`} />
            <Stat label="Min Payment" value={`KES ${debt.minimumPayment.toFixed(2)}`} />
            <Stat label="Due Day" value={`${debt.dueDay}`} />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Payoff Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <SummaryCard
          icon={<CalendarIcon className="h-4 w-4" />}
          label="Payoff Date"
          value={format(payoffDate, "MMM dd, yyyy")}
          sub={`${payoffData.months} months`}
        />
        <SummaryCard
          icon={<TrendingDownIcon className="h-4 w-4" />}
          label="Total Interest"
          value={`KES ${payoffData.totalInterest.toFixed(2)}`}
        />
        <SummaryCard
          icon={<DollarSignIcon className="h-4 w-4" />}
          label="Total Cost"
          value={`KES ${(debt.currentBalance + payoffData.totalInterest).toFixed(
            2
          )}`}
        />
      </div>

      {/* Charts */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Payoff Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={payoffData.timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                dataKey="balance"
                stroke={COLORS.chart1}
                strokeWidth={3}
                name="Balance"
              />
              <Line
                dataKey="totalInterest"
                stroke={COLORS.chart3}
                strokeWidth={3}
                name="Interest"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payments */}
      {payments.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="font-medium">
                    KES {p.amount.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(p.paymentDate, "MMM dd, yyyy")}
                  </div>
                </div>
                <ClockIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {debt.notes && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{debt.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* =========================
   Small UI helpers
========================= */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
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
        <div className="text-lg font-bold">{value}</div>
        {sub && (
          <div className="text-sm text-muted-foreground">{sub}</div>
        )}
      </CardContent>
    </Card>
  );
}