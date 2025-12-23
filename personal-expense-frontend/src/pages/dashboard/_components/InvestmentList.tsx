// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
// import { Button } from "@/components/ui/button.tsx";
// import { Badge } from "@/components/ui/badge.tsx";
// import { Pencil, Trash2, TrendingUp, TrendingDown, LineChart } from "lucide-react";
// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import { toast } from "sonner";
// import { format } from "date-fns";
// import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty.tsx";
// import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";

// interface InvestmentListProps {
//   investments: Doc<"investments">[];
//   onEdit: (id: Id<"investments">) => void;
// }

// export function InvestmentList({ investments, onEdit }: InvestmentListProps) {
//   const removeInvestment = useMutation(api.investments.remove);

//   const handleDelete = async (id: Id<"investments">) => {
//     try {
//       await removeInvestment({ id });
//       toast.success("Investment deleted");
//     } catch (error) {
//       toast.error("Failed to delete investment");
//     }
//   };

//   if (investments.length === 0) {
//     return (
//       <Card>
//         <CardContent className="pt-6">
//           <Empty>
//             <EmptyHeader>
//               <EmptyMedia variant="icon">
//                 <LineChart />
//               </EmptyMedia>
//               <EmptyTitle>No investments yet</EmptyTitle>
//               <EmptyDescription>
//                 Start building your portfolio by adding your first investment
//               </EmptyDescription>
//             </EmptyHeader>
//           </Empty>
//         </CardContent>
//       </Card>
//     );
//   }

//   const totalInvested = investments.reduce(
//     (sum, inv) => sum + inv.quantity * inv.purchasePrice,
//     0
//   );

//   const currentValue = investments.reduce(
//     (sum, inv) => sum + inv.quantity * inv.currentPrice,
//     0
//   );

//   const totalGainLoss = currentValue - totalInvested;
//   const totalGainLossPercentage = (totalGainLoss / totalInvested) * 100;

//   return (
//     <div className="space-y-6">
//       {/* Portfolio Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <Card className="border-primary/20">
//           <CardHeader className="pb-3">
//             <CardDescription>Total Invested</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <CardTitle className="text-2xl">KES {totalInvested.toFixed(2)}</CardTitle>
//           </CardContent>
//         </Card>

//         <Card className="border-accent/20">
//           <CardHeader className="pb-3">
//             <CardDescription>Current Value</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <CardTitle className="text-2xl">KES {currentValue.toFixed(2)}</CardTitle>
//           </CardContent>
//         </Card>

//         <Card className={`${totalGainLoss >= 0 ? "border-accent/20" : "border-destructive/20"}`}>
//           <CardHeader className="pb-3">
//             <CardDescription>Total Gain/Loss</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="flex items-center gap-2">
//               {totalGainLoss >= 0 ? (
//                 <TrendingUp className="w-5 h-5 text-accent" />
//               ) : (
//                 <TrendingDown className="w-5 h-5 text-destructive" />
//               )}
//               <CardTitle
//                 className={`text-2xl ${
//                   totalGainLoss >= 0 ? "text-accent" : "text-destructive"
//                 }`}
//               >
//                 {totalGainLoss >= 0 ? "+" : ""}KES {totalGainLoss.toFixed(2)}
//               </CardTitle>
//               <span
//                 className={`text-sm ${
//                   totalGainLoss >= 0 ? "text-accent" : "text-destructive"
//                 }`}
//               >
//                 ({totalGainLossPercentage.toFixed(2)}%)
//               </span>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Investment Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {investments.map((investment) => {
//           const invested = investment.quantity * investment.purchasePrice;
//           const currentVal = investment.quantity * investment.currentPrice;
//           const gainLoss = currentVal - invested;
//           const gainLossPercentage = (gainLoss / invested) * 100;
//           const isPositive = gainLoss >= 0;

//           return (
//             <Card
//               key={investment._id}
//               className={`${isPositive ? "border-accent/20" : "border-destructive/20"}`}
//             >
//               <CardHeader className="pb-3">
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <CardTitle className="text-lg">{investment.name}</CardTitle>
//                       {investment.symbol && (
//                         <Badge variant="secondary" className="text-xs">
//                           {investment.symbol}
//                         </Badge>
//                       )}
//                     </div>
//                     <CardDescription>{investment.type}</CardDescription>
//                   </div>
//                   <div className="flex gap-1">
//                     <Button
//                       size="icon"
//                       variant="ghost"
//                       className="h-8 w-8"
//                       onClick={() => onEdit(investment._id)}
//                     >
//                       <Pencil className="w-3.5 h-3.5" />
//                     </Button>
//                     <Button
//                       size="icon"
//                       variant="ghost"
//                       className="h-8 w-8"
//                       onClick={() => handleDelete(investment._id)}
//                     >
//                       <Trash2 className="w-3.5 h-3.5" />
//                     </Button>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <div className="grid grid-cols-2 gap-2 text-sm">
//                   <div>
//                     <p className="text-muted-foreground">Quantity</p>
//                     <p className="font-medium">{investment.quantity}</p>
//                   </div>
//                   <div>
//                     <p className="text-muted-foreground">Purchase Price</p>
//                     <p className="font-medium">KES {investment.purchasePrice.toFixed(2)}</p>
//                   </div>
//                   <div>
//                     <p className="text-muted-foreground">Current Price</p>
//                     <p className="font-medium">KES {investment.currentPrice.toFixed(2)}</p>
//                   </div>
//                   <div>
//                     <p className="text-muted-foreground">Purchase Date</p>
//                     <p className="font-medium">
//                       {format(investment.purchaseDate, "MMM dd, yyyy")}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="pt-3 border-t border-border/50">
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm text-muted-foreground">Gain/Loss</span>
//                     <div className="flex items-center gap-2">
//                       {isPositive ? (
//                         <TrendingUp className="w-4 h-4 text-accent" />
//                       ) : (
//                         <TrendingDown className="w-4 h-4 text-destructive" />
//                       )}
//                       <span
//                         className={`font-bold ${
//                           isPositive ? "text-accent" : "text-destructive"
//                         }`}
//                       >
//                         {isPositive ? "+" : ""}KES {gainLoss.toFixed(2)}
//                       </span>
//                       <span
//                         className={`text-sm ${
//                           isPositive ? "text-accent" : "text-destructive"
//                         }`}
//                       >
//                         ({gainLossPercentage.toFixed(2)}%)
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>
//     </div>
//   );
// }