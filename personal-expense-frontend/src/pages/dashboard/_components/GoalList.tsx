// import { useQuery, useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";
// import { Button } from "@/components/ui/button.tsx";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card.tsx";
// import {
//   Empty,
//   EmptyContent,
//   EmptyDescription,
//   EmptyHeader,
//   EmptyMedia,
//   EmptyTitle,
// } from "@/components/ui/empty.tsx";
// import { Badge } from "@/components/ui/badge.tsx";
// import { Progress } from "@/components/ui/progress.tsx";
// import { Skeleton } from "@/components/ui/skeleton.tsx";
// import {
//   TargetIcon,
//   CalendarIcon,
//   TrendingUpIcon,
//   CheckCircle2Icon,
//   XCircleIcon,
//   PlusIcon,
//   PencilIcon,
//   Trash2Icon,
// } from "lucide-react";
// import { format, differenceInDays } from "date-fns";
// import { useState } from "react";
// import { GoalDialog } from "./GoalDialog.tsx";
// import { GoalProgressDialog } from "./GoalProgressDialog.jsx";
// import { toast } from "sonner";
// import { ConvexError } from "convex/values";

// interface GoalListProps {
//   goals: Doc<"goals">[];
//   onEdit: (id: Id<"goals">) => void;
// }

// export function GoalList({ goals, onEdit }: GoalListProps) {
//   const removeGoal = useMutation(api.goals.remove);
//   const updateStatus = useMutation(api.goals.updateStatus);
//   const [progressGoalId, setProgressGoalId] = useState<Id<"goals"> | null>(
//     null
//   );

//   const handleDelete = async (id: Id<"goals">) => {
//     try {
//       await removeGoal({ id });
//       toast.success("Goal deleted");
//     } catch (error) {
//       if (error instanceof ConvexError) {
//         const { message } = error.data as { code: string; message: string };
//         toast.error(`Error: ${message}`);
//       } else {
//         toast.error("Failed to delete goal");
//       }
//     }
//   };

//   const handleMarkComplete = async (id: Id<"goals">) => {
//     try {
//       await updateStatus({ id, status: "completed" });
//       toast.success("Goal marked as complete!");
//     } catch (error) {
//       if (error instanceof ConvexError) {
//         const { message } = error.data as { code: string; message: string };
//         toast.error(`Error: ${message}`);
//       } else {
//         toast.error("Failed to update goal");
//       }
//     }
//   };

//   const handleReactivate = async (id: Id<"goals">) => {
//     try {
//       await updateStatus({ id, status: "active" });
//       toast.success("Goal reactivated");
//     } catch (error) {
//       if (error instanceof ConvexError) {
//         const { message } = error.data as { code: string; message: string };
//         toast.error(`Error: ${message}`);
//       } else {
//         toast.error("Failed to update goal");
//       }
//     }
//   };

//   if (goals === undefined) {
//     return (
//       <div className="space-y-4">
//         {Array.from({ length: 3 }).map((_, i) => (
//           <Skeleton key={i} className="h-48 w-full" />
//         ))}
//       </div>
//     );
//   }

//   if (goals.length === 0) {
//     return (
//       <Empty>
//         <EmptyHeader>
//           <EmptyMedia variant="icon">
//             <TargetIcon />
//           </EmptyMedia>
//           <EmptyTitle>No financial goals yet</EmptyTitle>
//           <EmptyDescription>
//             Set savings goals and track your progress toward achieving them
//           </EmptyDescription>
//         </EmptyHeader>
//       </Empty>
//     );
//   }

//   const activeGoals = goals.filter((g) => g.status === "active");
//   const completedGoals = goals.filter((g) => g.status === "completed");
//   const cancelledGoals = goals.filter((g) => g.status === "cancelled");

//   const getProgressPercentage = (goal: Doc<"goals">): number => {
//     return Math.min(
//       Math.round((goal.currentAmount / goal.targetAmount) * 100),
//       100
//     );
//   };

//   const getDaysRemaining = (deadline: number): number => {
//     return differenceInDays(deadline, Date.now());
//   };

//   const getStatusColor = (goal: Doc<"goals">): string => {
//     if (goal.status === "completed") return "text-accent";
//     if (goal.status === "cancelled") return "text-muted-foreground";
    
//     const daysLeft = getDaysRemaining(goal.deadline);
//     const progress = getProgressPercentage(goal);
    
//     if (daysLeft < 0) return "text-destructive";
//     if (progress >= 75) return "text-accent";
//     if (daysLeft < 30) return "text-orange-500";
//     return "text-primary";
//   };

//   const renderGoalCard = (goal: Doc<"goals">) => {
//     const progress = getProgressPercentage(goal);
//     const daysLeft = getDaysRemaining(goal.deadline);
//     const isOverdue = daysLeft < 0 && goal.status === "active";

//     return (
//       <Card key={goal._id} className="glass-card">
//         <CardHeader className="pb-3">
//           <div className="flex items-start justify-between gap-3">
//             <div className="flex-1 min-w-0">
//               <CardTitle className="text-lg flex items-center gap-2">
//                 {goal.name}
//                 {goal.status === "completed" && (
//                   <CheckCircle2Icon className="h-5 w-5 text-accent flex-shrink-0" />
//                 )}
//                 {goal.status === "cancelled" && (
//                   <XCircleIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
//                 )}
//               </CardTitle>
//               <CardDescription className="mt-1">
//                 {goal.category}
//               </CardDescription>
//             </div>
//             {goal.status === "active" && (
//               <Badge
//                 variant={isOverdue ? "destructive" : "secondary"}
//                 className="flex-shrink-0"
//               >
//                 {isOverdue
//                   ? `${Math.abs(daysLeft)} days overdue`
//                   : `${daysLeft} days left`}
//               </Badge>
//             )}
//           </div>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {goal.description && (
//             <p className="text-sm text-muted-foreground">{goal.description}</p>
//           )}

//           <div className="space-y-2">
//             <div className="flex justify-between text-sm">
//               <span className="text-muted-foreground">Progress</span>
//               <span className={`font-semibold ${getStatusColor(goal)}`}>
//                 {progress}%
//               </span>
//             </div>
//             <Progress value={progress} className="h-2" />
//             <div className="flex justify-between text-sm">
//               <span className="font-medium">
//                 KES {goal.currentAmount.toLocaleString()}
//               </span>
//               <span className="text-muted-foreground">
//                 of KES {goal.targetAmount.toLocaleString()}
//               </span>
//             </div>
//           </div>

//           <div className="flex items-center gap-2 text-sm text-muted-foreground">
//             <CalendarIcon className="h-4 w-4" />
//             <span>Target: {format(goal.deadline, "PPP")}</span>
//           </div>

//           <div className="flex gap-2 pt-2">
//             {goal.status === "active" && (
//               <>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={() => setProgressGoalId(goal._id)}
//                   className="flex-1"
//                 >
//                   <PlusIcon className="mr-1 h-3 w-3" />
//                   Add Progress
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={() => onEdit(goal._id)}
//                 >
//                   <PencilIcon className="h-3 w-3" />
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={() => handleMarkComplete(goal._id)}
//                 >
//                   <CheckCircle2Icon className="h-3 w-3" />
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={() => handleDelete(goal._id)}
//                 >
//                   <Trash2Icon className="h-3 w-3" />
//                 </Button>
//               </>
//             )}
//             {goal.status === "completed" && (
//               <>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={() => handleReactivate(goal._id)}
//                   className="flex-1"
//                 >
//                   Reactivate
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={() => handleDelete(goal._id)}
//                 >
//                   <Trash2Icon className="h-3 w-3" />
//                 </Button>
//               </>
//             )}
//             {goal.status === "cancelled" && (
//               <>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={() => handleReactivate(goal._id)}
//                   className="flex-1"
//                 >
//                   Reactivate
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   onClick={() => handleDelete(goal._id)}
//                 >
//                   <Trash2Icon className="h-3 w-3" />
//                 </Button>
//               </>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     );
//   };

//   return (
//     <>
//       <div className="space-y-6">
//         {activeGoals.length > 0 && (
//           <div>
//             <h3 className="mb-3 text-sm font-medium text-muted-foreground">
//               Active Goals ({activeGoals.length})
//             </h3>
//             <div className="grid gap-4 sm:grid-cols-2">
//               {activeGoals.map(renderGoalCard)}
//             </div>
//           </div>
//         )}

//         {completedGoals.length > 0 && (
//           <div>
//             <h3 className="mb-3 text-sm font-medium text-muted-foreground">
//               Completed Goals ({completedGoals.length})
//             </h3>
//             <div className="grid gap-4 sm:grid-cols-2 opacity-75">
//               {completedGoals.map(renderGoalCard)}
//             </div>
//           </div>
//         )}

//         {cancelledGoals.length > 0 && (
//           <div>
//             <h3 className="mb-3 text-sm font-medium text-muted-foreground">
//               Cancelled Goals ({cancelledGoals.length})
//             </h3>
//             <div className="grid gap-4 sm:grid-cols-2 opacity-60">
//               {cancelledGoals.map(renderGoalCard)}
//             </div>
//           </div>
//         )}
//       </div>

//       <GoalProgressDialog
//         goalId={progressGoalId}
//         onOpenChange={() => setProgressGoalId(null)}
//       />
//     </>
//   );
// }