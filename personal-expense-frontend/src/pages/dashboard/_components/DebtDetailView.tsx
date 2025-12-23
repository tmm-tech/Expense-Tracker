// import { format } from "date-fns";
// import { useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import {
//   ArrowLeftIcon,
//   CalendarIcon,
//   TrendingDownIcon,
//   ClockIcon,
//   DollarSignIcon,
// } from "lucide-react";
// import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";
// import { Button } from "@/components/ui/button.tsx";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card.tsx";
// import { Badge } from "@/components/ui/badge.tsx";
// import { Progress } from "@/components/ui/progress.tsx";
// import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// type Debt = Doc<"debts">;

// interface DebtDetailViewProps {
//   debt: Debt;
//   onBack: () => void;
// }

// const COLORS = {
//   chart1: "hsl(var(--chart-1))",
//   chart2: "hsl(var(--chart-2))",
//   chart3: "hsl(var(--chart-3))",
//   chart4: "hsl(var(--chart-4))",
//   chart5: "hsl(var(--chart-5))",
// };

// export default function DebtDetailView({ debt, onBack }: DebtDetailViewProps) {
//   const payments = useQuery(api.debts.getPayments, { debtId: debt._id });

//   if (!payments) {
//     return (
//       <div className="space-y-4">
//         <Button variant="ghost" onClick={onBack} className="gap-2">
//           <ArrowLeftIcon className="h-4 w-4" />
//           Back to Debts
//         </Button>
//         <div className="h-96 glass-card animate-pulse" />
//       </div>
//     );
//   }

//   const progress = ((debt.originalAmount - debt.currentBalance) / debt.originalAmount) * 100;
//   const totalPaid = debt.originalAmount - debt.currentBalance;
  
//   // Calculate payoff timeline with minimum payment
//   const calculatePayoffTimeline = () => {
//     const monthlyRate = debt.interestRate / 100 / 12;
//     let balance = debt.currentBalance;
//     let months = 0;
//     let totalInterest = 0;
//     const timeline = [];

//     while (balance > 0 && months < 360) { // Cap at 30 years
//       const interestCharge = balance * monthlyRate;
//       const principalPayment = Math.min(debt.minimumPayment - interestCharge, balance);
      
//       totalInterest += interestCharge;
//       balance -= principalPayment;
//       months++;

//       if (months % 6 === 0 || balance <= 0) { // Record every 6 months
//         timeline.push({
//           month: months,
//           balance: Math.max(0, balance),
//           totalInterest,
//           totalPaid: debt.currentBalance - balance,
//         });
//       }

//       if (balance <= 0) break;
//     }

//     return { months, totalInterest, timeline };
//   };

//   const payoffData = calculatePayoffTimeline();
//   const payoffDate = new Date();
//   payoffDate.setMonth(payoffDate.getMonth() + payoffData.months);

//   // Payment history chart data
//   const paymentHistory = payments.map((p) => ({
//     date: format(p.paymentDate, "MMM dd"),
//     amount: p.amount,
//   })).reverse().slice(-10); // Last 10 payments

//   return (
//     <div className="space-y-6">
//       <Button variant="ghost" onClick={onBack} className="gap-2">
//         <ArrowLeftIcon className="h-4 w-4" />
//         Back to Debts
//       </Button>

//       {/* Header Card */}
//       <Card className="glass-card border-primary/20">
//         <CardHeader>
//           <div className="flex items-start justify-between">
//             <div>
//               <CardTitle className="text-2xl">{debt.name}</CardTitle>
//               <CardDescription className="mt-2 flex items-center gap-2">
//                 <span>{debt.type}</span>
//                 <span>•</span>
//                 <span>{debt.creditor}</span>
//               </CardDescription>
//             </div>
//             <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400">
//               {debt.status}
//             </Badge>
//           </div>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="space-y-1">
//               <div className="text-sm text-muted-foreground">Current Balance</div>
//               <div className="text-2xl font-bold">KES {debt.currentBalance.toFixed(2)}</div>
//             </div>
//             <div className="space-y-1">
//               <div className="text-sm text-muted-foreground">Interest Rate</div>
//               <div className="text-2xl font-bold text-yellow-400">{debt.interestRate.toFixed(2)}%</div>
//             </div>
//             <div className="space-y-1">
//               <div className="text-sm text-muted-foreground">Min Payment</div>
//               <div className="text-2xl font-bold">KES {debt.minimumPayment.toFixed(2)}</div>
//             </div>
//             <div className="space-y-1">
//               <div className="text-sm text-muted-foreground">Due Day</div>
//               <div className="text-2xl font-bold">{debt.dueDay}</div>
//             </div>
//           </div>
//           <div className="space-y-2">
//             <div className="flex items-center justify-between text-sm">
//               <span className="text-muted-foreground">Progress</span>
//               <span className="font-medium">{progress.toFixed(1)}% paid off</span>
//             </div>
//             <Progress value={progress} className="h-3" />
//             <div className="flex items-center justify-between text-xs text-muted-foreground">
//               <span>KES {totalPaid.toFixed(2)} paid</span>
//               <span>KES {debt.currentBalance.toFixed(2)} remaining</span>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Payoff Projections */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <Card className="glass-card border-green-500/20">
//           <CardHeader className="pb-3">
//             <CardDescription className="flex items-center gap-2">
//               <CalendarIcon className="h-4 w-4" />
//               Payoff Date
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <CardTitle className="text-lg font-bold text-green-400">
//               {format(payoffDate, "MMM dd, yyyy")}
//             </CardTitle>
//             <div className="mt-1 text-sm text-muted-foreground">
//               {payoffData.months} months
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="glass-card border-red-500/20">
//           <CardHeader className="pb-3">
//             <CardDescription className="flex items-center gap-2">
//               <TrendingDownIcon className="h-4 w-4" />
//               Total Interest
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <CardTitle className="text-lg font-bold text-red-400">
//               KES {payoffData.totalInterest.toFixed(2)}
//             </CardTitle>
//             <div className="mt-1 text-sm text-muted-foreground">
//               Over {payoffData.months} months
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="glass-card border-blue-500/20">
//           <CardHeader className="pb-3">
//             <CardDescription className="flex items-center gap-2">
//               <DollarSignIcon className="h-4 w-4" />
//               Total Cost
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <CardTitle className="text-lg font-bold text-blue-400">
//               KES {(debt.currentBalance + payoffData.totalInterest).toFixed(2)}
//             </CardTitle>
//             <div className="mt-1 text-sm text-muted-foreground">
//               Principal + Interest
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Payoff Timeline Chart */}
//       <Card className="glass-card">
//         <CardHeader>
//           <CardTitle>Payoff Timeline</CardTitle>
//           <CardDescription>
//             Projected balance and interest with minimum payments
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={payoffData.timeline}>
//               <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
//               <XAxis
//                 dataKey="month"
//                 stroke="hsl(var(--foreground))"
//                 tick={{ fill: "hsl(var(--muted-foreground))" }}
//                 label={{ value: "Months", position: "insideBottom", offset: -5, fill: "hsl(var(--muted-foreground))" }}
//               />
//               <YAxis
//                 stroke="hsl(var(--foreground))"
//                 tick={{ fill: "hsl(var(--muted-foreground))" }}
//                 label={{ value: "Amount (KES)", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))" }}
//               />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "hsl(var(--card))",
//                   border: "1px solid hsl(var(--border))",
//                   borderRadius: "8px",
//                   color: "hsl(var(--foreground))",
//                 }}
//                 formatter={(value: number) => [`KES ${value.toFixed(2)}`, ""]}
//               />
//               <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
//               <Line
//                 type="monotone"
//                 dataKey="balance"
//                 stroke={COLORS.chart1}
//                 strokeWidth={3}
//                 name="Remaining Balance"
//                 dot={{ fill: COLORS.chart1, r: 4 }}
//               />
//               <Line
//                 type="monotone"
//                 dataKey="totalInterest"
//                 stroke={COLORS.chart3}
//                 strokeWidth={3}
//                 name="Total Interest"
//                 dot={{ fill: COLORS.chart3, r: 4 }}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </CardContent>
//       </Card>

//       {/* Payment History */}
//       {payments.length > 0 && (
//         <>
//           <Card className="glass-card">
//             <CardHeader>
//               <CardTitle>Payment History</CardTitle>
//               <CardDescription>
//                 Last {Math.min(payments.length, 10)} payments
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={250}>
//                 <BarChart data={paymentHistory}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
//                   <XAxis
//                     dataKey="date"
//                     stroke="hsl(var(--foreground))"
//                     tick={{ fill: "hsl(var(--muted-foreground))" }}
//                   />
//                   <YAxis
//                     stroke="hsl(var(--foreground))"
//                     tick={{ fill: "hsl(var(--muted-foreground))" }}
//                   />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: "hsl(var(--card))",
//                       border: "1px solid hsl(var(--border))",
//                       borderRadius: "8px",
//                       color: "hsl(var(--foreground))",
//                     }}
//                     formatter={(value: number) => [`KES ${value.toFixed(2)}`, "Payment"]}
//                   />
//                   <Bar dataKey="amount" fill={COLORS.chart2} radius={[8, 8, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           <Card className="glass-card">
//             <CardHeader>
//               <CardTitle>All Payments</CardTitle>
//               <CardDescription>
//                 {payments.length} payment{payments.length !== 1 ? "s" : ""} recorded
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 {payments.map((payment) => (
//                   <div
//                     key={payment._id}
//                     className="flex items-center justify-between p-3 rounded-lg border border-border/50"
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
//                         <ClockIcon className="w-5 h-5 text-primary" />
//                       </div>
//                       <div>
//                         <div className="font-medium">KES {payment.amount.toFixed(2)}</div>
//                         <div className="text-sm text-muted-foreground">
//                           {format(payment.paymentDate, "MMM dd, yyyy")}
//                         </div>
//                         {payment.notes && (
//                           <div className="text-xs text-muted-foreground mt-1">
//                             {payment.notes}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </>
//       )}

//       {debt.notes && (
//         <Card className="glass-card">
//           <CardHeader>
//             <CardTitle>Notes</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-muted-foreground">{debt.notes}</p>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }