// import { useQuery } from "convex/react";
// import { api } from "@/convex/generated/api.js";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card.tsx";
// import { Skeleton } from "@/components/ui/skeleton.tsx";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select.tsx";
// import {
//   TrendingUpIcon,
//   TrendingDownIcon,
//   DollarSignIcon,
//   ActivityIcon,
//   TargetIcon,
//   PieChartIcon,
// } from "lucide-react";
// import { useState } from "react";
// import {
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";

// const COLORS = {
//   chart1: "hsl(var(--chart-1))",
//   chart2: "hsl(var(--chart-2))",
//   chart3: "hsl(var(--chart-3))",
//   chart4: "hsl(var(--chart-4))",
//   chart5: "hsl(var(--chart-5))",
// };

// const CHART_COLORS = [
//   COLORS.chart1,
//   COLORS.chart2,
//   COLORS.chart3,
//   COLORS.chart4,
//   COLORS.chart5,
//   "#8b5cf6",
//   "#ec4899",
//   "#f59e0b",
//   "#10b981",
//   "#3b82f6",
// ];

// type DateRange = "7d" | "30d" | "3m" | "6m" | "1y" | "all";

// export function ReportsView() {
//   const [dateRange, setDateRange] = useState<DateRange>("30d");

//   const getDateRange = (): { startDate: number; endDate: number } => {
//     const now = Date.now();
//     switch (dateRange) {
//       case "7d":
//         return { startDate: subDays(now, 7).getTime(), endDate: now };
//       case "30d":
//         return { startDate: subDays(now, 30).getTime(), endDate: now };
//       case "3m":
//         return { startDate: subMonths(now, 3).getTime(), endDate: now };
//       case "6m":
//         return { startDate: subMonths(now, 6).getTime(), endDate: now };
//       case "1y":
//         return { startDate: subMonths(now, 12).getTime(), endDate: now };
//       case "all":
//         return { startDate: 0, endDate: now };
//     }
//   };

//   const { startDate, endDate } = getDateRange();

//   const summary = useQuery(api.reports.getFinancialSummary, { startDate, endDate });
//   const incomeTrends = useQuery(api.reports.getCategoryTrends, {
//     startDate,
//     endDate,
//     type: "income",
//   });
//   const expenseTrends = useQuery(api.reports.getCategoryTrends, {
//     startDate,
//     endDate,
//     type: "expense",
//   });
//   const monthlyTrends = useQuery(api.reports.getMonthlyTrends, { startDate, endDate });
//   const budgetPerformance = useQuery(api.reports.getBudgetPerformance, {});
//   const goalProgress = useQuery(api.reports.getGoalProgress, {});

//   if (
//     summary === undefined ||
//     incomeTrends === undefined ||
//     expenseTrends === undefined ||
//     monthlyTrends === undefined ||
//     budgetPerformance === undefined ||
//     goalProgress === undefined
//   ) {
//     return (
//       <div className="space-y-6">
//         {Array.from({ length: 4 }).map((_, i) => (
//           <Skeleton key={i} className="h-96 w-full" />
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Date Range Selector */}
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold">Financial Reports & Analytics</h2>
//         <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
//           <SelectTrigger className="w-40">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="7d">Last 7 Days</SelectItem>
//             <SelectItem value="30d">Last 30 Days</SelectItem>
//             <SelectItem value="3m">Last 3 Months</SelectItem>
//             <SelectItem value="6m">Last 6 Months</SelectItem>
//             <SelectItem value="1y">Last Year</SelectItem>
//             <SelectItem value="all">All Time</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Card className="glass-card">
//           <CardHeader className="pb-3">
//             <CardDescription className="flex items-center gap-2">
//               <DollarSignIcon className="h-4 w-4" />
//               Total Income
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-accent">
//               KES {summary.totalIncome.toLocaleString()}
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="glass-card">
//           <CardHeader className="pb-3">
//             <CardDescription className="flex items-center gap-2">
//               <TrendingDownIcon className="h-4 w-4" />
//               Total Expenses
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-destructive">
//               KES {summary.totalExpenses.toLocaleString()}
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="glass-card">
//           <CardHeader className="pb-3">
//             <CardDescription className="flex items-center gap-2">
//               <TrendingUpIcon className="h-4 w-4" />
//               Net Income
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div
//               className={`text-2xl font-bold ${
//                 summary.netIncome >= 0 ? "text-accent" : "text-destructive"
//               }`}
//             >
//               KES {summary.netIncome.toLocaleString()}
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="glass-card">
//           <CardHeader className="pb-3">
//             <CardDescription className="flex items-center gap-2">
//               <ActivityIcon className="h-4 w-4" />
//               Savings Rate
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {summary.savingsRate.toFixed(1)}%
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Monthly Trends */}
//       {monthlyTrends.length > 0 && (
//         <Card className="glass-card">
//           <CardHeader>
//             <CardTitle>Monthly Trends</CardTitle>
//             <CardDescription>Income vs Expenses over time</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={monthlyTrends}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                 <XAxis
//                   dataKey="month"
//                   stroke="hsl(var(--muted-foreground))"
//                   tickFormatter={(value) => {
//                     const [year, month] = value.split("-");
//                     return format(new Date(parseInt(year), parseInt(month) - 1), "MMM yy");
//                   }}
//                 />
//                 <YAxis stroke="hsl(var(--muted-foreground))" />
//                 <Tooltip
//                   contentStyle={{
//                     backgroundColor: "hsl(var(--popover))",
//                     border: "1px solid hsl(var(--border))",
//                     borderRadius: "8px",
//                   }}
//                   formatter={(value: number) => `KES ${value.toLocaleString()}`}
//                 />
//                 <Legend />
//                 <Line
//                   type="monotone"
//                   dataKey="income"
//                   stroke={COLORS.chart1}
//                   strokeWidth={2}
//                   name="Income"
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="expenses"
//                   stroke={COLORS.chart2}
//                   strokeWidth={2}
//                   name="Expenses"
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="net"
//                   stroke={COLORS.chart3}
//                   strokeWidth={2}
//                   name="Net"
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       )}

//       {/* Category Breakdown */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Income by Category */}
//         {incomeTrends.length > 0 && (
//           <Card className="glass-card">
//             <CardHeader>
//               <CardTitle>Income by Category</CardTitle>
//               <CardDescription>Top income sources</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={incomeTrends}
//                     dataKey="amount"
//                     nameKey="category"
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={100}
//                     label={(entry) => `${entry.category}: KES ${entry.amount.toLocaleString()}`}
//                   >
//                     {incomeTrends.map((_, index) => (
//                       <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: "hsl(var(--popover))",
//                       border: "1px solid hsl(var(--border))",
//                       borderRadius: "8px",
//                     }}
//                     formatter={(value: number) => `KES ${value.toLocaleString()}`}
//                   />
//                 </PieChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         )}

//         {/* Expenses by Category */}
//         {expenseTrends.length > 0 && (
//           <Card className="glass-card">
//             <CardHeader>
//               <CardTitle>Expenses by Category</CardTitle>
//               <CardDescription>Top spending categories</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={expenseTrends.slice(0, 8)}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                   <XAxis
//                     dataKey="category"
//                     stroke="hsl(var(--muted-foreground))"
//                     angle={-45}
//                     textAnchor="end"
//                     height={80}
//                   />
//                   <YAxis stroke="hsl(var(--muted-foreground))" />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: "hsl(var(--popover))",
//                       border: "1px solid hsl(var(--border))",
//                       borderRadius: "8px",
//                     }}
//                     formatter={(value: number) => `KES ${value.toLocaleString()}`}
//                   />
//                   <Bar dataKey="amount" fill={COLORS.chart2} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         )}
//       </div>

//       {/* Budget Performance */}
//       {budgetPerformance.length > 0 && (
//         <Card className="glass-card">
//           <CardHeader>
//             <CardTitle>Budget Performance</CardTitle>
//             <CardDescription>How well you're sticking to your budgets</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {budgetPerformance.map((budget, index) => (
//                 <div key={index} className="space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span className="font-medium">{budget.category}</span>
//                     <span className={budget.percentage > 100 ? "text-destructive" : ""}>
//                       {budget.percentage.toFixed(0)}% of budget
//                     </span>
//                   </div>
//                   <div className="h-2 bg-muted rounded-full overflow-hidden">
//                     <div
//                       className={`h-full ${
//                         budget.percentage > 100
//                           ? "bg-destructive"
//                           : budget.percentage > 80
//                             ? "bg-orange-500"
//                             : "bg-accent"
//                       }`}
//                       style={{ width: `${Math.min(budget.percentage, 100)}%` }}
//                     />
//                   </div>
//                   <div className="flex justify-between text-xs text-muted-foreground">
//                     <span>Spent: KES {budget.spent.toLocaleString()}</span>
//                     <span>Limit: KES {budget.limit.toLocaleString()}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Goal Progress */}
//       {goalProgress.length > 0 && (
//         <Card className="glass-card">
//           <CardHeader>
//             <CardTitle>Goal Progress</CardTitle>
//             <CardDescription>Track your savings goals</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {goalProgress.map((goal, index) => (
//                 <div key={index} className="space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span className="font-medium">{goal.name}</span>
//                     <span>
//                       {goal.percentage.toFixed(0)}% ({goal.daysRemaining} days left)
//                     </span>
//                   </div>
//                   <div className="h-2 bg-muted rounded-full overflow-hidden">
//                     <div
//                       className="h-full bg-accent"
//                       style={{ width: `${Math.min(goal.percentage, 100)}%` }}
//                     />
//                   </div>
//                   <div className="flex justify-between text-xs text-muted-foreground">
//                     <span>Current: KES {goal.currentAmount.toLocaleString()}</span>
//                     <span>Target: KES {goal.targetAmount.toLocaleString()}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }