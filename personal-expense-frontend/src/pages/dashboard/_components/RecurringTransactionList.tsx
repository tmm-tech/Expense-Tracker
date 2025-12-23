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
// import { Skeleton } from "@/components/ui/skeleton.tsx";
// import {
//   RepeatIcon,
//   CalendarIcon,
//   TrendingUpIcon,
//   TrendingDownIcon,
//   PlayIcon,
//   PauseIcon,
//   PencilIcon,
//   Trash2Icon,
// } from "lucide-react";
// import { format } from "date-fns";
// import { useState } from "react";
// import { RecurringTransactionDialog } from "./RecurringTransactionDialog.tsx";
// import { toast } from "sonner";
// import { ConvexError } from "convex/values";

// export function RecurringTransactionList() {
//   const recurringTransactions = useQuery(api.recurringTransactions.list, {});
//   const toggleRecurring = useMutation(api.recurringTransactions.toggle);
//   const removeRecurring = useMutation(api.recurringTransactions.remove);
//   const processRecurring = useMutation(api.recurringTransactions.processRecurring);
//   const [editingTransaction, setEditingTransaction] = useState<Doc<"recurringTransactions"> | null>(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   const handleToggle = async (id: Id<"recurringTransactions">) => {
//     try {
//       await toggleRecurring({ id });
//       toast.success("Recurring transaction updated");
//     } catch (error) {
//       if (error instanceof ConvexError) {
//         const { message } = error.data as { code: string; message: string };
//         toast.error(`Error: ${message}`);
//       } else {
//         toast.error("Failed to update recurring transaction");
//       }
//     }
//   };

//   const handleDelete = async (id: Id<"recurringTransactions">) => {
//     try {
//       await removeRecurring({ id });
//       toast.success("Recurring transaction deleted");
//     } catch (error) {
//       if (error instanceof ConvexError) {
//         const { message } = error.data as { code: string; message: string };
//         toast.error(`Error: ${message}`);
//       } else {
//         toast.error("Failed to delete recurring transaction");
//       }
//     }
//   };

//   const handleProcess = async () => {
//     try {
//       const result = await processRecurring({});
//       toast.success(`Processed ${result.processed} recurring transaction(s)`);
//     } catch (error) {
//       if (error instanceof ConvexError) {
//         const { message } = error.data as { code: string; message: string };
//         toast.error(`Error: ${message}`);
//       } else {
//         toast.error("Failed to process recurring transactions");
//       }
//     }
//   };

//   const handleEdit = (transaction: Doc<"recurringTransactions">) => {
//     setEditingTransaction(transaction);
//     setIsDialogOpen(true);
//   };

//   const handleCloseDialog = () => {
//     setEditingTransaction(null);
//     setIsDialogOpen(false);
//   };

//   if (recurringTransactions === undefined) {
//     return (
//       <div className="space-y-4">
//         {Array.from({ length: 3 }).map((_, i) => (
//           <Skeleton key={i} className="h-32 w-full" />
//         ))}
//       </div>
//     );
//   }

//   if (recurringTransactions.length === 0) {
//     return (
//       <Empty>
//         <EmptyHeader>
//           <EmptyMedia variant="icon">
//             <RepeatIcon />
//           </EmptyMedia>
//           <EmptyTitle>No recurring transactions</EmptyTitle>
//           <EmptyDescription>
//             Set up automatic transactions that repeat on a schedule
//           </EmptyDescription>
//         </EmptyHeader>
//       </Empty>
//     );
//   }

//   const activeRecurring = recurringTransactions.filter((r) => r.isActive);
//   const inactiveRecurring = recurringTransactions.filter((r) => !r.isActive);

//   return (
//     <>
//       <div className="mb-6 flex justify-end">
//         <Button onClick={handleProcess} variant="outline" size="sm">
//           <PlayIcon className="mr-2 h-4 w-4" />
//           Process Due Transactions
//         </Button>
//       </div>

//       <div className="space-y-6">
//         {activeRecurring.length > 0 && (
//           <div>
//             <h3 className="mb-3 text-sm font-medium text-muted-foreground">
//               Active ({activeRecurring.length})
//             </h3>
//             <div className="grid gap-4 sm:grid-cols-2">
//               {activeRecurring.map((transaction) => (
//                 <Card key={transaction._id} className="glass-card">
//                   <CardHeader className="pb-3">
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <CardTitle className="text-base">
//                           {transaction.description}
//                         </CardTitle>
//                         <CardDescription className="mt-1">
//                           {transaction.category}
//                         </CardDescription>
//                       </div>
//                       <Badge
//                         variant={
//                           transaction.type === "income"
//                             ? "default"
//                             : "secondary"
//                         }
//                         className="ml-2"
//                       >
//                         {transaction.type === "income" ? (
//                           <TrendingUpIcon className="mr-1 h-3 w-3" />
//                         ) : (
//                           <TrendingDownIcon className="mr-1 h-3 w-3" />
//                         )}
//                         {transaction.type}
//                       </Badge>
//                     </div>
//                   </CardHeader>
//                   <CardContent className="space-y-3">
//                     <div className="flex items-center justify-between">
//                       <span className="text-2xl font-bold">
//                         KES {transaction.amount.toLocaleString()}
//                       </span>
//                       <Badge variant="outline" className="capitalize">
//                         {transaction.frequency}
//                       </Badge>
//                     </div>

//                     <div className="space-y-1 text-sm text-muted-foreground">
//                       <div className="flex items-center gap-2">
//                         <CalendarIcon className="h-4 w-4" />
//                         <span>
//                           Next: {format(transaction.nextOccurrence, "PP")}
//                         </span>
//                       </div>
//                       {transaction.endDate && (
//                         <div className="flex items-center gap-2">
//                           <CalendarIcon className="h-4 w-4" />
//                           <span>Ends: {format(transaction.endDate, "PP")}</span>
//                         </div>
//                       )}
//                     </div>

//                     <div className="flex gap-2 pt-2">
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => handleEdit(transaction)}
//                         className="flex-1"
//                       >
//                         <PencilIcon className="mr-1 h-3 w-3" />
//                         Edit
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => handleToggle(transaction._id)}
//                       >
//                         <PauseIcon className="h-3 w-3" />
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => handleDelete(transaction._id)}
//                       >
//                         <Trash2Icon className="h-3 w-3" />
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         )}

//         {inactiveRecurring.length > 0 && (
//           <div>
//             <h3 className="mb-3 text-sm font-medium text-muted-foreground">
//               Inactive ({inactiveRecurring.length})
//             </h3>
//             <div className="grid gap-4 sm:grid-cols-2">
//               {inactiveRecurring.map((transaction) => (
//                 <Card key={transaction._id} className="glass-card opacity-60">
//                   <CardHeader className="pb-3">
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <CardTitle className="text-base">
//                           {transaction.description}
//                         </CardTitle>
//                         <CardDescription className="mt-1">
//                           {transaction.category}
//                         </CardDescription>
//                       </div>
//                       <Badge
//                         variant={
//                           transaction.type === "income"
//                             ? "default"
//                             : "secondary"
//                         }
//                         className="ml-2"
//                       >
//                         {transaction.type === "income" ? (
//                           <TrendingUpIcon className="mr-1 h-3 w-3" />
//                         ) : (
//                           <TrendingDownIcon className="mr-1 h-3 w-3" />
//                         )}
//                         {transaction.type}
//                       </Badge>
//                     </div>
//                   </CardHeader>
//                   <CardContent className="space-y-3">
//                     <div className="flex items-center justify-between">
//                       <span className="text-2xl font-bold">
//                         KES {transaction.amount.toLocaleString()}
//                       </span>
//                       <Badge variant="outline" className="capitalize">
//                         {transaction.frequency}
//                       </Badge>
//                     </div>

//                     <div className="flex gap-2 pt-2">
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => handleToggle(transaction._id)}
//                         className="flex-1"
//                       >
//                         <PlayIcon className="mr-1 h-3 w-3" />
//                         Activate
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => handleDelete(transaction._id)}
//                       >
//                         <Trash2Icon className="h-3 w-3" />
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       <RecurringTransactionDialog
//         open={isDialogOpen}
//         onOpenChange={handleCloseDialog}
//         transaction={editingTransaction}
//       />
//     </>
//   );
// }