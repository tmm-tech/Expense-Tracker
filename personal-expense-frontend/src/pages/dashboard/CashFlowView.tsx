// import { useState } from "react";
// import { useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   ReferenceLine,
//   Legend,
// } from "recharts";
// import { format } from "date-fns";
// import {
//   TrendingUp,
//   TrendingDown,
//   AlertTriangle,
//   CheckCircle2,
//   Calendar,
//   DollarSign,
//   ArrowUpCircle,
//   ArrowDownCircle,
//   Lightbulb,
// } from "lucide-react";
// import { cn } from "@/lib/utils";

// export function CashFlowView() {
//   const [forecastMonths, setForecastMonths] = useState(6);
//   const forecast = useQuery(api.cashFlow.getForecast, { months: forecastMonths });

//   if (!forecast) {
//     return (
//       <div className="space-y-4">
//         <Skeleton className="h-32 w-full" />
//         <Skeleton className="h-96 w-full" />
//       </div>
//     );
//   }

//   const { forecast: forecastData, summary } = forecast;

//   // Prepare chart data
//   const chartData = forecastData.map((point) => ({
//     date: format(point.date, "MMM dd"),
//     fullDate: format(point.date, "MMM dd, yyyy"),
//     balance: point.projectedBalance,
//     income: point.income,
//     expenses: point.expenses,
//     netChange: point.income - point.expenses,
//   }));

//   const hasShortfalls = summary.shortfalls.length > 0;
//   const balanceChange = summary.projectedBalance - summary.currentBalance;
//   const balanceChangePercent =
//     summary.currentBalance !== 0
//       ? (balanceChange / summary.currentBalance) * 100
//       : 0;

//   return (
//     <div className="space-y-4 md:space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between flex-wrap gap-3">
//         <div>
//           <h2 className="text-xl md:text-2xl font-bold">Cash Flow Forecast</h2>
//           <p className="text-sm text-muted-foreground mt-1">
//             Projected income, expenses, and balance over time
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button
//             variant={forecastMonths === 3 ? "default" : "outline"}
//             size="sm"
//             onClick={() => setForecastMonths(3)}
//           >
//             3 Months
//           </Button>
//           <Button
//             variant={forecastMonths === 6 ? "default" : "outline"}
//             size="sm"
//             onClick={() => setForecastMonths(6)}
//           >
//             6 Months
//           </Button>
//           <Button
//             variant={forecastMonths === 12 ? "default" : "outline"}
//             size="sm"
//             onClick={() => setForecastMonths(12)}
//           >
//             12 Months
//           </Button>
//         </div>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
//         <Card className="glass-card border-primary/20">
//           <CardContent className="pt-4 md:pt-6">
//             <div className="flex items-center gap-2 md:gap-3">
//               <div className="p-2 rounded-lg bg-primary/10">
//                 <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-primary" />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-xs md:text-sm text-muted-foreground">Current</p>
//                 <p className="text-base md:text-xl font-bold truncate">
//                   KES {summary.currentBalance.toLocaleString()}
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card
//           className={cn(
//             "glass-card",
//             balanceChange >= 0 ? "border-green-500/20" : "border-red-500/20"
//           )}
//         >
//           <CardContent className="pt-4 md:pt-6">
//             <div className="flex items-center gap-2 md:gap-3">
//               <div
//                 className={cn(
//                   "p-2 rounded-lg",
//                   balanceChange >= 0 ? "bg-green-500/10" : "bg-red-500/10"
//                 )}
//               >
//                 {balanceChange >= 0 ? (
//                   <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
//                 ) : (
//                   <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
//                 )}
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-xs md:text-sm text-muted-foreground">Projected</p>
//                 <p
//                   className={cn(
//                     "text-base md:text-xl font-bold truncate",
//                     balanceChange >= 0 ? "text-green-500" : "text-red-500"
//                   )}
//                 >
//                   KES {summary.projectedBalance.toLocaleString()}
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="glass-card border-blue-500/20">
//           <CardContent className="pt-4 md:pt-6">
//             <div className="flex items-center gap-2 md:gap-3">
//               <div className="p-2 rounded-lg bg-blue-500/10">
//                 <ArrowUpCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-xs md:text-sm text-muted-foreground">Avg Income</p>
//                 <p className="text-base md:text-xl font-bold text-blue-500 truncate">
//                   KES {summary.averageMonthlyIncome.toLocaleString()}
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="glass-card border-orange-500/20">
//           <CardContent className="pt-4 md:pt-6">
//             <div className="flex items-center gap-2 md:gap-3">
//               <div className="p-2 rounded-lg bg-orange-500/10">
//                 <ArrowDownCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
//               </div>
//               <div className="flex-1 min-w-0">
//                 <p className="text-xs md:text-sm text-muted-foreground">Avg Expenses</p>
//                 <p className="text-base md:text-xl font-bold text-orange-500 truncate">
//                   KES {summary.averageMonthlyExpenses.toLocaleString()}
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Projected Balance Chart */}
//       <Card className="glass-card">
//         <CardHeader>
//           <CardTitle className="text-base md:text-lg">Projected Balance</CardTitle>
//           <CardDescription>Your estimated account balance over time</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <ResponsiveContainer width="100%" height={300}>
//             <AreaChart data={chartData}>
//               <defs>
//                 <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
//                   <stop
//                     offset="5%"
//                     stopColor="hsl(var(--primary))"
//                     stopOpacity={0.3}
//                   />
//                   <stop
//                     offset="95%"
//                     stopColor="hsl(var(--primary))"
//                     stopOpacity={0}
//                   />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
//               <XAxis
//                 dataKey="date"
//                 stroke="hsl(var(--muted-foreground))"
//                 fontSize={12}
//                 tickLine={false}
//               />
//               <YAxis
//                 stroke="hsl(var(--muted-foreground))"
//                 fontSize={12}
//                 tickLine={false}
//                 tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
//               />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "hsl(var(--card))",
//                   border: "1px solid hsl(var(--border))",
//                   borderRadius: "8px",
//                 }}
//                 labelStyle={{ color: "hsl(var(--foreground))" }}
//                 formatter={(value: number) => [
//                   `KES ${value.toLocaleString()}`,
//                   "Balance",
//                 ]}
//               />
//               <ReferenceLine
//                 y={0}
//                 stroke="hsl(var(--destructive))"
//                 strokeDasharray="3 3"
//                 label={{ value: "Zero Balance", fill: "hsl(var(--destructive))", fontSize: 12 }}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="balance"
//                 stroke="hsl(var(--primary))"
//                 strokeWidth={3}
//                 fill="url(#balanceGradient)"
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </CardContent>
//       </Card>

//       {/* Income vs Expenses Chart */}
//       <Card className="glass-card">
//         <CardHeader>
//           <CardTitle className="text-base md:text-lg">Income vs Expenses</CardTitle>
//           <CardDescription>Weekly comparison of projected cash flows</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={chartData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
//               <XAxis
//                 dataKey="date"
//                 stroke="hsl(var(--muted-foreground))"
//                 fontSize={12}
//                 tickLine={false}
//               />
//               <YAxis
//                 stroke="hsl(var(--muted-foreground))"
//                 fontSize={12}
//                 tickLine={false}
//                 tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
//               />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "hsl(var(--card))",
//                   border: "1px solid hsl(var(--border))",
//                   borderRadius: "8px",
//                 }}
//                 labelStyle={{ color: "hsl(var(--foreground))" }}
//                 formatter={(value: number, name: string) => [
//                   `KES ${value.toLocaleString()}`,
//                   name === "income" ? "Income" : "Expenses",
//                 ]}
//               />
//               <Legend />
//               <Bar
//                 dataKey="income"
//                 fill="hsl(217, 91%, 60%)"
//                 radius={[8, 8, 0, 0]}
//                 name="Income"
//               />
//               <Bar
//                 dataKey="expenses"
//                 fill="hsl(25, 95%, 53%)"
//                 radius={[8, 8, 0, 0]}
//                 name="Expenses"
//               />
//             </BarChart>
//           </ResponsiveContainer>
//         </CardContent>
//       </Card>

//       {/* Insights & Alerts */}
//       <Card className="glass-card">
//         <CardHeader>
//           <CardTitle className="text-base md:text-lg flex items-center gap-2">
//             <Lightbulb className="w-5 h-5" />
//             Insights & Recommendations
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-3">
//           {summary.insights.map((insight, idx) => {
//             const isWarning = insight.includes("⚠️");
//             const isPositive = insight.includes("✅") || insight.includes("📈") || insight.includes("💰");
//             const isInfo = !isWarning && !isPositive;

//             return (
//               <div
//                 key={idx}
//                 className={cn(
//                   "p-3 rounded-lg border flex items-start gap-3",
//                   isWarning && "bg-yellow-500/5 border-yellow-500/20",
//                   isPositive && "bg-green-500/5 border-green-500/20",
//                   isInfo && "bg-blue-500/5 border-blue-500/20"
//                 )}
//               >
//                 <div className="shrink-0 mt-0.5">
//                   {isWarning && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
//                   {isPositive && <CheckCircle2 className="w-4 h-4 text-green-500" />}
//                   {isInfo && <Lightbulb className="w-4 h-4 text-blue-500" />}
//                 </div>
//                 <p className="text-sm flex-1">{insight}</p>
//               </div>
//             );
//           })}
//         </CardContent>
//       </Card>

//       {/* Shortfalls */}
//       {summary.shortfalls.length > 0 && (
//         <Card className="glass-card border-red-500/20">
//           <CardHeader>
//             <CardTitle className="text-base md:text-lg flex items-center gap-2 text-red-500">
//               <AlertTriangle className="w-5 h-5" />
//               Potential Shortfalls
//             </CardTitle>
//             <CardDescription>
//               Dates when your balance may go negative
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-2">
//               {summary.shortfalls.map((shortfall, idx) => (
//                 <div
//                   key={idx}
//                   className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 flex items-center justify-between gap-3"
//                 >
//                   <div className="flex items-center gap-3">
//                     <Calendar className="w-4 h-4 text-red-500 shrink-0" />
//                     <div>
//                       <p className="text-sm font-semibold">
//                         {format(shortfall.date, "MMM dd, yyyy")}
//                       </p>
//                       <p className="text-xs text-muted-foreground">
//                         {Math.ceil((shortfall.date - Date.now()) / (24 * 60 * 60 * 1000))}{" "}
//                         days from now
//                       </p>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm font-semibold text-red-500">
//                       -KES {shortfall.deficit.toLocaleString()}
//                     </p>
//                     <p className="text-xs text-muted-foreground">deficit</p>
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