import { useState } from "react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  WalletIcon,
  BarChart3Icon,
  CreditCardIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty.tsx";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";

const COLORS = {
  chart1: "hsl(var(--chart-1))",
  chart2: "hsl(var(--chart-2))",
  chart3: "hsl(var(--chart-3))",
  chart4: "hsl(var(--chart-4))",
  chart5: "hsl(var(--chart-5))",
};

type Period = "1M" | "3M" | "6M" | "1Y" | "ALL";

interface NetWorthSnapshot {
  id: string;
  timestamp: number;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  notes?: string;
}

interface NetWorthCurrent {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  breakdown: {
    cash: number;
    investments: number;
    debts: number;
  };
}

const snapshotSchema = z.object({
  notes: z.string().optional(),
});

type SnapshotFormData = z.infer<typeof snapshotSchema>;

export default function NetWorthView() {
  const [period, setPeriod] = useState<Period>("6M");
  const [isSnapshotDialogOpen, setIsSnapshotDialogOpen] = useState(false);
  const { session, loading } = useAuth();
  const qc = useQueryClient();

  const currentNetWorthQuery = useQuery<NetWorthCurrent>({
    queryKey: ["net-worth-current"],
    enabled: !!session,
    queryFn: () => apiFetch("/net-worth/current"),
  });

  const snapshotsQuery = useQuery<NetWorthSnapshot[]>({
    queryKey: ["net-worth-snapshots"],
    enabled: !!session,
    queryFn: () => apiFetch("/net-worth/snapshots"),
  });

  const trendDataQuery = useQuery<NetWorthSnapshot[]>({
    queryKey: ["net-worth-trend", period],
    enabled: !!session,
    queryFn: () => apiFetch(`/net-worth/trend?period=${period}`),
  });

  const createSnapshot = useMutation({
    mutationFn: (data: { notes?: string }) =>
      apiFetch("/net-worth/snapshots", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("Snapshot created successfully");
      qc.invalidateQueries({ queryKey: ["net-worth-snapshots"] });
      qc.invalidateQueries({ queryKey: ["net-worth-current"] });
      qc.invalidateQueries({ queryKey: ["net-worth-trend"] });
      setIsSnapshotDialogOpen(false);
    },
    onError: () => toast.error("Failed to create snapshot"),
  });

  const deleteSnapshot = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/net-worth/snapshots/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Snapshot deleted");
      qc.invalidateQueries({ queryKey: ["net-worth-snapshots"] });
      qc.invalidateQueries({ queryKey: ["net-worth-trend"] });
    },
    onError: () => toast.error("Failed to delete snapshot"),
  });

  const form = useForm<SnapshotFormData>({
    resolver: zodResolver(snapshotSchema),
    defaultValues: {
      notes: "",
    },
  });

  const onSubmit = async (data: SnapshotFormData) => {
    try {
      createSnapshot.mutate({ notes: data.notes });
      toast.success("Snapshot created successfully");
      form.reset();
      setIsSnapshotDialogOpen(false);
    } catch (error) {
      toast.error("Failed to create snapshot");
    }
  };

  const handleDeleteSnapshot = async (id: string) => {
    try {
      deleteSnapshot.mutate(id);
      toast.success("Snapshot deleted");
    } catch (error) {
      toast.error("Failed to delete snapshot");
    }
  };
  const currentNetWorth = currentNetWorthQuery.data ?? {
    netWorth: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    breakdown: { cash: 0, investments: 0, debts: 0 },
  };
  const snapshots = snapshotsQuery.data ?? [];
  const trendData = trendDataQuery.data ?? [];

  const isLoading =
    currentNetWorthQuery.isLoading ||
    snapshotsQuery.isLoading ||
    trendDataQuery.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 glass-card animate-pulse" />
          ))}
        </div>
        <div className="h-96 glass-card animate-pulse" />
      </div>
    );
  }

  // Calculate change from previous snapshot
  const latestSnapshot = snapshots[0] ? snapshots[0] : undefined;;
  const previousSnapshot = snapshots[1] ? snapshots[1] : undefined;;
  const change =
    latestSnapshot && previousSnapshot
      ? latestSnapshot.netWorth - previousSnapshot.netWorth
      : 0;
  const changePercent = previousSnapshot
    ? (change / previousSnapshot.netWorth) * 100
    : 0;

  // Format chart data
  const chartData = trendData.map((snapshot: NetWorthSnapshot) => ({
    date: format(snapshot.timestamp, "MMM dd"),
    fullDate: format(snapshot.timestamp, "MMM dd, yyyy"),
    netWorth: snapshot.netWorth,
    assets: snapshot.totalAssets,
    liabilities: snapshot.totalLiabilities,
  }));

  return (
    <div className="space-y-6">
      {/* Header with Create Snapshot Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Net Worth Tracking</h2>
          <p className="text-muted-foreground">
            Monitor your financial health over time
          </p>
        </div>
        <Button onClick={() => setIsSnapshotDialogOpen(true)} className="gap-2">
          <PlusIcon className="h-4 w-4" />
          Create Snapshot
        </Button>
      </div>

      {/* Current Net Worth Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-primary/20">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <BarChart3Icon className="h-4 w-4" />
              Current Net Worth
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <CardTitle className="text-3xl font-bold text-primary">
              KES {currentNetWorth.netWorth.toFixed(2)}
            </CardTitle>
            {change !== 0 && (
              <div className="flex items-center gap-2">
                {change > 0 ? (
                  <TrendingUpIcon className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4 text-red-400" />
                )}
                <span
                  className={`text-sm font-medium ${
                    change > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {change > 0 ? "+" : ""}
                  {change.toFixed(2)} ({changePercent > 0 ? "+" : ""}
                  {changePercent.toFixed(1)}%)
                </span>
                <span className="text-xs text-muted-foreground">
                  since last snapshot
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-green-500/20">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <WalletIcon className="h-4 w-4" />
              Total Assets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold text-green-400">
              KES {currentNetWorth.totalAssets.toFixed(2)}
            </CardTitle>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Cash:</span>
                <span>KES {currentNetWorth.breakdown.cash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Investments:</span>
                <span>
                  KES {currentNetWorth.breakdown.investments.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-red-500/20">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CreditCardIcon className="h-4 w-4" />
              Total Liabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold text-red-400">
              KES {currentNetWorth.totalLiabilities.toFixed(2)}
            </CardTitle>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Debts:</span>
                <span>KES {currentNetWorth.breakdown.debts.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Selector and Chart */}
      {chartData.length > 0 ? (
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Net Worth Trend</CardTitle>
                <CardDescription>
                  Historical net worth over time
                </CardDescription>
              </div>
              <Tabs
                value={period}
                onValueChange={(v) => setPeriod(v as Period)}
              >
                <TabsList className="glass">
                  <TabsTrigger value="1M">1M</TabsTrigger>
                  <TabsTrigger value="3M">3M</TabsTrigger>
                  <TabsTrigger value="6M">6M</TabsTrigger>
                  <TabsTrigger value="1Y">1Y</TabsTrigger>
                  <TabsTrigger value="ALL">ALL</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="netWorthGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={COLORS.chart1}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.chart1}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullDate;
                    }
                    return label;
                  }}
                  formatter={(value: number) => [`KES ${value.toFixed(2)}`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="netWorth"
                  stroke={COLORS.chart1}
                  strokeWidth={3}
                  fill="url(#netWorthGradient)"
                  name="Net Worth"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card">
          <CardContent className="pt-6">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BarChart3Icon />
                </EmptyMedia>
                <EmptyTitle>No snapshots yet</EmptyTitle>
                <EmptyDescription>
                  Create your first snapshot to start tracking net worth trends
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button size="sm" onClick={() => setIsSnapshotDialogOpen(true)}>
                  Create Snapshot
                </Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      )}

      {/* Assets vs Liabilities Chart */}
      {chartData.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Assets vs Liabilities</CardTitle>
            <CardDescription>Breakdown over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullDate;
                    }
                    return label;
                  }}
                  formatter={(value: number) => [`KES ${value.toFixed(2)}`, ""]}
                />
                <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
                <Line
                  type="monotone"
                  dataKey="assets"
                  stroke={COLORS.chart2}
                  strokeWidth={3}
                  name="Assets"
                  dot={{ fill: COLORS.chart2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="liabilities"
                  stroke={COLORS.chart3}
                  strokeWidth={3}
                  name="Liabilities"
                  dot={{ fill: COLORS.chart3, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Snapshot History */}
      {snapshots.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Snapshot History</CardTitle>
            <CardDescription>
              {snapshots.length} snapshot{snapshots.length !== 1 ? "s" : ""}{" "}
              recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {snapshots.map((snapshot) => (
                <div
                  key={snapshot.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold">
                        KES {snapshot.netWorth.toFixed(2)}
                      </div>
                      <Badge variant="outline">
                        {format(snapshot.timestamp, "MMM dd, yyyy")}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Assets: KES {snapshot.totalAssets.toFixed(2)} •
                      Liabilities: KES {snapshot.totalLiabilities.toFixed(2)}
                    </div>
                    {snapshot.notes && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {snapshot.notes}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSnapshot(snapshot.id)}
                  >
                    <Trash2Icon className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Snapshot Dialog */}
      <Dialog
        open={isSnapshotDialogOpen}
        onOpenChange={setIsSnapshotDialogOpen}
      >
        <DialogContent className="glass">
          <DialogHeader>
            <DialogTitle>Create Net Worth Snapshot</DialogTitle>
            <DialogDescription>
              Capture your current net worth for historical tracking
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="rounded-lg border border-border/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Net Worth</span>
                <span className="text-xl font-bold">
                  KES {currentNetWorth.netWorth.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Total Assets
                </span>
                <span className="text-sm font-medium text-green-400">
                  KES {currentNetWorth.totalAssets.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Total Liabilities
                </span>
                <span className="text-sm font-medium text-red-400">
                  KES {currentNetWorth.totalLiabilities.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any notes about this snapshot..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSnapshotDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Snapshot</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
