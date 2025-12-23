// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
// import { Button } from "@/components/ui/button.tsx";
// import { Badge } from "@/components/ui/badge.tsx";
// import { Progress } from "@/components/ui/progress.tsx";
// import { Pencil, Trash2, PiggyBank } from "lucide-react";
// import { useMutation, useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import { toast } from "sonner";
// import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty.tsx";
// import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";

// interface BudgetListProps {
//   budgets: Doc<"budgets">[];
//   onEdit: (id: Id<"budgets">) => void;
// }

// export function BudgetList({ budgets, onEdit }: BudgetListProps) {
//   const removeBudget = useMutation(api.budgets.remove);

//   const handleDelete = async (id: Id<"budgets">) => {
//     try {
//       await removeBudget({ id });
//       toast.success("Budget deleted");
//     } catch (error) {
//       toast.error("Failed to delete budget");
//     }
//   };

//   if (budgets.length === 0) {
//     return (
//       <Card>
//         <CardContent className="pt-6">
//           <Empty>
//             <EmptyHeader>
//               <EmptyMedia variant="icon">
//                 <PiggyBank />
//               </EmptyMedia>
//               <EmptyTitle>No budgets set</EmptyTitle>
//               <EmptyDescription>
//                 Create your first budget to track spending by category
//               </EmptyDescription>
//             </EmptyHeader>
//           </Empty>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//       {budgets.map((budget) => (
//         <BudgetCard
//           key={budget._id}
//           budget={budget}
//           onEdit={onEdit}
//           onDelete={handleDelete}
//         />
//       ))}
//     </div>
//   );
// }

// interface BudgetCardProps {
//   budget: Doc<"budgets">;
//   onEdit: (id: Id<"budgets">) => void;
//   onDelete: (id: Id<"budgets">) => void;
// }

// function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
//   const spending = useQuery(api.budgets.getBudgetSpending, {
//     budgetId: budget._id,
//   });

//   if (!spending) {
//     return (
//       <Card>
//         <CardHeader>
//           <div className="h-20 bg-muted animate-pulse rounded" />
//         </CardHeader>
//       </Card>
//     );
//   }

//   const percentage = Math.min(spending.percentage, 100);
//   const isOverBudget = spending.spent > spending.limit;
//   const isNearLimit = percentage > 80 && !isOverBudget;

//   return (
//     <Card className={`${isOverBudget ? "border-destructive/50" : isNearLimit ? "border-yellow-500/50" : ""}`}>
//       <CardHeader className="pb-3">
//         <div className="flex items-start justify-between">
//           <div className="flex-1">
//             <CardTitle className="text-lg">{budget.category}</CardTitle>
//             <CardDescription className="capitalize">
//               {budget.period} Budget
//             </CardDescription>
//           </div>
//           <div className="flex gap-1">
//             <Button
//               size="icon"
//               variant="ghost"
//               className="h-8 w-8"
//               onClick={() => onEdit(budget._id)}
//             >
//               <Pencil className="w-3.5 h-3.5" />
//             </Button>
//             <Button
//               size="icon"
//               variant="ghost"
//               className="h-8 w-8"
//               onClick={() => onDelete(budget._id)}
//             >
//               <Trash2 className="w-3.5 h-3.5" />
//             </Button>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div>
//           <div className="flex justify-between text-sm mb-2">
//             <span className="text-muted-foreground">Spent</span>
//             <span className={`font-medium ${isOverBudget ? "text-destructive" : ""}`}>
//               KES {spending.spent.toFixed(2)} / KES {spending.limit.toFixed(2)}
//             </span>
//           </div>
//           <Progress
//             value={percentage}
//             className={`h-2 ${
//               isOverBudget
//                 ? "bg-destructive/20 [&>div]:bg-destructive"
//                 : isNearLimit
//                 ? "bg-yellow-500/20 [&>div]:bg-yellow-500"
//                 : ""
//             }`}
//           />
//         </div>
//         <div className="flex items-center justify-between">
//           <Badge
//             variant={isOverBudget ? "destructive" : "secondary"}
//             className="text-xs"
//           >
//             {percentage.toFixed(0)}% Used
//           </Badge>
//           <span className={`text-sm font-medium ${isOverBudget ? "text-destructive" : "text-accent"}`}>
//             {isOverBudget ? "-" : ""}KES {Math.abs(spending.remaining).toFixed(2)} {isOverBudget ? "over" : "left"}
//           </span>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }