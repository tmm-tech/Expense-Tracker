// import { useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
// import { TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard, BarChart3, DollarSign } from "lucide-react";
// import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
// import { startOfMonth, endOfMonth, format, subMonths } from "date-fns";

// const COLORS = {
//   primary: "hsl(var(--primary))",
//   accent: "hsl(var(--accent))",
//   secondary: "hsl(var(--secondary))",
//   destructive: "hsl(var(--destructive))",
//   chart1: "hsl(var(--chart-1))",
//   chart2: "hsl(var(--chart-2))",
//   chart3: "hsl(var(--chart-3))",
//   chart4: "hsl(var(--chart-4))",
//   chart5: "hsl(var(--chart-5))",
// };

// export function InsightsView() {
//   const transactions = useQuery(api.transactions.list);
//   const budgets = useQuery(api.budgets.list);
//   const investments = useQuery(api.investments.list);

//   if (!transactions || !budgets || !investments) {
//     return (
//       <div className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           {[1, 2, 3, 4].map((i) => (
//             <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
//           ))}
//         </div>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {[1, 2, 3, 4].map((i) => (
//             <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   // Calculate metrics
//   const totalIncome = transactions
//     .filter((t) => t.type === "income")
//     .reduce((sum, t) => sum + t.amount, 0);

//   const totalExpenses = transactions
//     .filter((t) => t.type === "expense")
//     .reduce((sum, t) => sum + t.amount, 0);

//   const cashBalance = totalIncome - totalExpenses;

//   const totalInvested = investments.reduce(
//     (sum, inv) => sum + inv.quantity * inv.purchasePrice,
//     0
//   );

//   const currentInvestmentValue = investments.reduce(
//     (sum, inv) => sum + inv.quantity * inv.currentPrice,
//     0
//   );

//   const investmentGains = currentInvestmentValue - totalInvested;

//   const netWorth = cashBalance + currentInvestmentValue;

//   const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

//   // Spending by category
//   const spendingByCategory = transactions
//     .filter((t) => t.type === "expense")
//     .reduce((acc, t) => {
//       acc[t.category] = (acc[t.category] || 0) + t.amount;
//       return acc;
//     }, {} as Record<string, number>);

//   const categoryChartData = Object.entries(spendingByCategory)
//     .map(([name, value]) => ({ name, value }))
//     .sort((a, b) => b.value - a.value)
//     .slice(0, 6);

//   // Income vs Expenses over last 6 months
//   const last6Months = Array.from({ length: 6 }, (_, i) => {
//     const date = subMonths(new Date(), 5 - i);
//     return {
//       month: format(date, "MMM"),
//       startDate: startOfMonth(date).getTime(),
//       endDate: endOfMonth(date).getTime(),
//     };
//   });

//   const monthlyData = last6Months.map((month) => {
//     const monthTransactions = transactions.filter(
//       (t) => t.date >= month.startDate && t.date <= month.endDate
//     );

//     const income = monthTransactions
//       .filter((t) => t.type === "income")
//       .reduce((sum, t) => sum + t.amount, 0);

//     const expenses = monthTransactions
//       .filter((t) => t.type === "expense")
//       .reduce((sum, t) => sum + t.amount, 0);

//     return {
//       month: month.month,
//       Income: income,
//       Expenses: expenses,
//     };
//   });

//   // Investment breakdown by type
//   const investmentsByType = investments.reduce((acc, inv) => {
//     const currentValue = inv.quantity * inv.currentPrice;
//     acc[inv.type] = (acc[inv.type] || 0) + currentValue;
//     return acc;
//   }, {} as Record<string, number>);

//   const investmentChartData = Object.entries(investmentsByType).map(([name, value]) => ({
//     name,
//     value,
//   }));

//   // Budget utilization
//   const now = Date.now();
//   const budgetUtilization = budgets.map((budget) => {
//     const categoryExpenses = transactions
//       .filter(
//         (t) =>
//           t.type === "expense" &&
//           t.category === budget.category &&
//           t.date >= budget.startDate
//       )
//       .reduce((sum, t) => sum + t.amount, 0);

//     const percentage = (categoryExpenses / budget.limit) * 100;
//     return {
//       category: budget.category,
//       used: categoryExpenses,
//       limit: budget.limit,
//       percentage: Math.min(percentage, 100),
//     };
//   });

//   return (
//     <div className="space-y-6">
//       {/* Key Metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Card className="border-primary/30 bg-gradient-to-br from-card to-primary/10">
//           <CardHeader className="pb-3">
//             <CardDescription className="flex items-center gap-2">
//               <Wallet className="w-4 h-4" />
//               Net Worth
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <CardTitle className="text-3xl font-bold">KES {netWorth.toFixed(2)}</CardTitle>
//             <p className="text-sm text-muted-foreground mt-1">
//               Cash + Investments
//             </p>
//           </CardContent>
//         </Card>

//         <Card className="border-accent/30 bg-gradient-to-br from-card to-accent/10">
//           <CardHeader className="pb-3">
//             <CardDescription className="flex items-center gap-2">
//               <DollarSign className="w-4 h-4" />
//               Cash Balance
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <CardTitle className="text-3xl font-bold">KES {cashBalance.toFixed(2)}</CardTitle>
//             <p className="text-sm text-muted-foreground mt-1">
//               Available liquidity
//             </p>
//           </CardContent>
//         </Card>

//         <Card className="border-secondary/30 bg-gradient-to-br from-card to-secondary/10">
//           <CardHeader className="pb-3">
//             <CardDescription className="flex items-center gap-2">
//               <TrendingUp className="w-4 h-4" />
//               Investment Value
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <CardTitle className="text-3xl font-bold">
//               KES {currentInvestmentValue.toFixed(2)}
//             </CardTitle>
//             <p className={`text-sm mt-1 flex items-center gap-1 ${investmentGains >= 0 ? "text-accent" : "text-destructive"}`}>
//               {investmentGains >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
//               {investmentGains >= 0 ? "+" : ""}KES {investmentGains.toFixed(2)}
//             </p>
//           </CardContent>
//         </Card>

//         <Card className="border-chart-4/30 bg-gradient-to-br from-card to-chart-4/10">
//           <CardHeader className="pb-3">
//             <CardDescription className="flex items-center gap-2">
//               <PiggyBank className="w-4 h-4" />
//               Savings Rate
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <CardTitle className="text-3xl font-bold">{savingsRate.toFixed(1)}%</CardTitle>
//             <p className="text-sm text-muted-foreground mt-1">
//               Of total income
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Charts Row 1 */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Income vs Expenses */}
//         <Card className="glass-card">
//           <CardHeader>
//             <CardTitle>Income vs Expenses</CardTitle>
//             <CardDescription>Last 6 months trend</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={monthlyData}>
//                 <defs>
//                   <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor={COLORS.chart2} stopOpacity={0.3}/>
//                     <stop offset="95%" stopColor={COLORS.chart2} stopOpacity={0}/>
//                   </linearGradient>
//                   <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor={COLORS.chart5} stopOpacity={0.3}/>
//                     <stop offset="95%" stopColor={COLORS.chart5} stopOpacity={0}/>
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
//                 <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
//                 <YAxis stroke="hsl(var(--muted-foreground))" />
//                 <Tooltip
//                   contentStyle={{
//                     backgroundColor: "hsl(var(--card))",
//                     border: "1px solid hsl(var(--border))",
//                     borderRadius: "8px",
//                   }}
//                   formatter={(value: number) => `KES ${value.toFixed(2)}`}
//                   labelStyle={{ color: "hsl(var(--foreground))" }}
//                 />
//                 <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
//                 <Line
//                   type="monotone"
//                   dataKey="Income"
//                   stroke={COLORS.chart2}
//                   strokeWidth={3}
//                   dot={{ fill: COLORS.chart2, r: 5 }}
//                   activeDot={{ r: 7 }}
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="Expenses"
//                   stroke={COLORS.chart5}
//                   strokeWidth={3}
//                   dot={{ fill: COLORS.chart5, r: 5 }}
//                   activeDot={{ r: 7 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* Spending by Category */}
//         <Card className="glass-card">
//           <CardHeader>
//             <CardTitle>Spending by Category</CardTitle>
//             <CardDescription>Top expense categories</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={categoryChartData}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={true}
//                   label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
//                     const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//                     const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
//                     const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
//                     return (
//                       <text
//                         x={x}
//                         y={y}
//                         fill="white"
//                         textAnchor={x > cx ? 'start' : 'end'}
//                         dominantBaseline="central"
//                         style={{ fontWeight: 'bold', fontSize: '12px' }}
//                       >
//                         {`${(percent * 100).toFixed(0)}%`}
//                       </text>
//                     );
//                   }}
//                   outerRadius={100}
//                   fill="#8884d8"
//                   dataKey="value"
//                   strokeWidth={2}
//                   stroke="hsl(var(--background))"
//                 >
//                   {categoryChartData.map((entry, index) => (
//                     <Cell
//                       key={`cell-${index}`}
//                       fill={[COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.chart5, COLORS.accent][index % 6]}
//                     />
//                   ))}
//                 </Pie>
//                 <Tooltip
//                   contentStyle={{
//                     backgroundColor: "hsl(var(--card))",
//                     border: "1px solid hsl(var(--border))",
//                     borderRadius: "8px",
//                     color: "hsl(var(--foreground))",
//                   }}
//                   formatter={(value: number) => [`KES ${value.toFixed(2)}`, "Amount"]}
//                   labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
//                 />
//                 <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
//               </PieChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Charts Row 2 */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Budget Utilization */}
//         {budgetUtilization.length > 0 && (
//           <Card className="glass-card">
//             <CardHeader>
//               <CardTitle>Budget Utilization</CardTitle>
//               <CardDescription>Current spending vs limits</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={budgetUtilization}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
//                   <XAxis
//                     dataKey="category"
//                     stroke="hsl(var(--muted-foreground))"
//                     angle={-45}
//                     textAnchor="end"
//                     height={100}
//                   />
//                   <YAxis stroke="hsl(var(--muted-foreground))" />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: "hsl(var(--card))",
//                       border: "1px solid hsl(var(--border))",
//                       borderRadius: "8px",
//                       color: "hsl(var(--foreground))",
//                     }}
//                     formatter={(value: number) => `KES ${value.toFixed(2)}`}
//                     labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
//                   />
//                   <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
//                   <Bar dataKey="used" fill={COLORS.chart5} name="Spent" radius={[8, 8, 0, 0]} />
//                   <Bar dataKey="limit" fill={COLORS.chart1} name="Budget" radius={[8, 8, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         )}

//         {/* Investment Allocation */}
//         {investmentChartData.length > 0 && (
//           <Card className="glass-card">
//             <CardHeader>
//               <CardTitle>Investment Allocation</CardTitle>
//               <CardDescription>Portfolio distribution by type</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={investmentChartData}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={true}
//                     label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
//                       const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//                       const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
//                       const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
//                       return (
//                         <text
//                           x={x}
//                           y={y}
//                           fill="white"
//                           textAnchor={x > cx ? 'start' : 'end'}
//                           dominantBaseline="central"
//                           style={{ fontWeight: 'bold', fontSize: '12px' }}
//                         >
//                           {`${(percent * 100).toFixed(0)}%`}
//                         </text>
//                       );
//                     }}
//                     outerRadius={100}
//                     fill="#8884d8"
//                     dataKey="value"
//                     strokeWidth={2}
//                     stroke="hsl(var(--background))"
//                   >
//                     {investmentChartData.map((entry, index) => (
//                       <Cell
//                         key={`cell-${index}`}
//                         fill={[COLORS.chart3, COLORS.chart1, COLORS.chart2, COLORS.chart4, COLORS.chart5, COLORS.primary, COLORS.accent][index % 7]}
//                       />
//                     ))}
//                   </Pie>
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: "hsl(var(--card))",
//                       border: "1px solid hsl(var(--border))",
//                       borderRadius: "8px",
//                       color: "hsl(var(--foreground))",
//                     }}
//                     formatter={(value: number) => [`KES ${value.toFixed(2)}`, "Value"]}
//                     labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
//                   />
//                   <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
//                 </PieChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         )}
//       </div>

//       {/* Financial Summary */}
//       <Card className="glass-card">
//         <CardHeader>
//           <CardTitle>Financial Summary</CardTitle>
//           <CardDescription>Overview of your financial health</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <div className="space-y-2">
//               <p className="text-sm text-muted-foreground">Total Income</p>
//               <p className="text-2xl font-bold text-accent">KES {totalIncome.toFixed(2)}</p>
//             </div>
//             <div className="space-y-2">
//               <p className="text-sm text-muted-foreground">Total Expenses</p>
//               <p className="text-2xl font-bold text-destructive">KES {totalExpenses.toFixed(2)}</p>
//             </div>
//             <div className="space-y-2">
//               <p className="text-sm text-muted-foreground">Total Invested</p>
//               <p className="text-2xl font-bold">KES {totalInvested.toFixed(2)}</p>
//             </div>
//             <div className="space-y-2">
//               <p className="text-sm text-muted-foreground">Active Budgets</p>
//               <p className="text-2xl font-bold">{budgets.length}</p>
//             </div>
//             <div className="space-y-2">
//               <p className="text-sm text-muted-foreground">Total Transactions</p>
//               <p className="text-2xl font-bold">{transactions.length}</p>
//             </div>
//             <div className="space-y-2">
//               <p className="text-sm text-muted-foreground">Investment Holdings</p>
//               <p className="text-2xl font-bold">{investments.length}</p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }