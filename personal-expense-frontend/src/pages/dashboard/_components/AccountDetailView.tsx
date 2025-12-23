// import { useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
// import { Button } from "@/components/ui/button.tsx";
// import { ArrowLeft, Building2, Wallet, Landmark, Banknote, Smartphone, CreditCard, TrendingUp, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
// import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";
// import { format } from "date-fns";

// interface AccountDetailViewProps {
//   accountId: Id<"accounts">;
//   account: Doc<"accounts">;
//   onBack: () => void;
// }

// const ACCOUNT_ICONS = {
//   Bank: Building2,
//   MMF: TrendingUp,
//   SACCO: Landmark,
//   Cash: Banknote,
//   "Mobile Money": Smartphone,
//   "Credit Card": CreditCard,
//   Other: Wallet,
// };

// export default function AccountDetailView({ accountId, account, onBack }: AccountDetailViewProps) {
//   const transactions = useQuery(api.accounts.getAccountTransactions, { accountId });

//   const Icon = ACCOUNT_ICONS[account.type];

//   if (transactions === undefined) {
//     return (
//       <div className="space-y-6">
//         <Button variant="outline" onClick={onBack} className="gap-2">
//           <ArrowLeft className="h-4 w-4" />
//           Back to Accounts
//         </Button>
//         <div className="h-64 bg-muted animate-pulse rounded-lg" />
//       </div>
//     );
//   }

//   const totalIncome = transactions
//     .filter((t) => t.type === "income")
//     .reduce((sum, t) => sum + t.amount, 0);

//   const totalExpense = transactions
//     .filter((t) => t.type === "expense")
//     .reduce((sum, t) => sum + t.amount, 0);

//   return (
//     <div className="space-y-6">
//       <Button variant="outline" onClick={onBack} className="gap-2">
//         <ArrowLeft className="h-4 w-4" />
//         Back to Accounts
//       </Button>

//       <Card className="glass-card border-primary/20">
//         <CardHeader>
//           <div className="flex items-start gap-4">
//             <div className="p-3 rounded-lg bg-primary/10">
//               <Icon className="h-8 w-8 text-primary" />
//             </div>
//             <div className="flex-1">
//               <CardTitle className="text-2xl">{account.name}</CardTitle>
//               <p className="text-muted-foreground">{account.type}</p>
//               {account.institutionName && (
//                 <p className="text-sm text-muted-foreground mt-1">{account.institutionName}</p>
//               )}
//               {account.accountNumber && (
//                 <p className="text-sm font-mono text-muted-foreground">
//                   ••••{account.accountNumber.slice(-4)}
//                 </p>
//               )}
//             </div>
//             <div className="text-right">
//               <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
//               <p className="text-3xl font-bold text-primary">
//                 {account.currency || "KES"} {account.balance.toFixed(2)}
//               </p>
//             </div>
//           </div>
//         </CardHeader>
//       </Card>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <Card className="glass-card border-accent/20">
//           <CardHeader className="pb-3">
//             <div className="flex items-center gap-2 text-muted-foreground">
//               <ArrowUpCircle className="h-4 w-4" />
//               <span className="text-sm">Total Income</span>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold text-accent">
//               {account.currency || "KES"} {totalIncome.toFixed(2)}
//             </p>
//           </CardContent>
//         </Card>

//         <Card className="glass-card border-destructive/20">
//           <CardHeader className="pb-3">
//             <div className="flex items-center gap-2 text-muted-foreground">
//               <ArrowDownCircle className="h-4 w-4" />
//               <span className="text-sm">Total Expenses</span>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold text-destructive">
//               {account.currency || "KES"} {totalExpense.toFixed(2)}
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       <Card className="glass-card">
//         <CardHeader>
//           <CardTitle>Recent Transactions</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {transactions.length === 0 ? (
//             <div className="text-center py-12 text-muted-foreground">
//               <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
//               <p>No transactions for this account yet</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {transactions.map((transaction) => (
//                 <div
//                   key={transaction._id}
//                   className="flex items-center justify-between p-3 rounded-lg glass hover:bg-primary/5 transition-colors"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div
//                       className={`p-2 rounded-lg ${
//                         transaction.type === "income"
//                           ? "bg-accent/10 text-accent"
//                           : "bg-destructive/10 text-destructive"
//                       }`}
//                     >
//                       {transaction.type === "income" ? (
//                         <ArrowUpCircle className="h-4 w-4" />
//                       ) : (
//                         <ArrowDownCircle className="h-4 w-4" />
//                       )}
//                     </div>
//                     <div>
//                       <p className="font-medium">{transaction.description}</p>
//                       <p className="text-sm text-muted-foreground">{transaction.category}</p>
//                       <p className="text-xs text-muted-foreground">
//                         {format(new Date(transaction.date), "MMM dd, yyyy")}
//                       </p>
//                     </div>
//                   </div>
//                   <p
//                     className={`text-lg font-semibold ${
//                       transaction.type === "income" ? "text-accent" : "text-destructive"
//                     }`}
//                   >
//                     {transaction.type === "income" ? "+" : "-"}
//                     {account.currency || "KES"} {transaction.amount.toFixed(2)}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }