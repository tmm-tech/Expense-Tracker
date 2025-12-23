// import { useMutation, useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import type { Id } from "@/convex/_generated/dataModel.d.ts";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog.tsx";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form.tsx";
// import { Input } from "@/components/ui/input.tsx";
// import { Button } from "@/components/ui/button.tsx";
// import { toast } from "sonner";
// import { ConvexError } from "convex/values";
// import { useState, useEffect } from "react";

// const progressSchema = z.object({
//   amount: z.coerce.number().positive("Amount must be positive"),
// });

// type ProgressFormData = z.infer<typeof progressSchema>;

// interface GoalProgressDialogProps {
//   goalId: Id<"goals"> | null;
//   onOpenChange: () => void;
// }

// export function GoalProgressDialog({
//   goalId,
//   onOpenChange,
// }: GoalProgressDialogProps) {
//   const goals = useQuery(api.goals.list, {});
//   const updateProgress = useMutation(api.goals.updateProgress);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const goal = goalId && goals ? goals.find((g) => g._id === goalId) : null;

//   const form = useForm<ProgressFormData>({
//     resolver: zodResolver(progressSchema),
//     defaultValues: {
//       amount: 0,
//     },
//   });

//   useEffect(() => {
//     if (!goalId) {
//       form.reset();
//     }
//   }, [goalId, form]);

//   const onSubmit = async (data: ProgressFormData) => {
//     if (!goalId) return;

//     setIsSubmitting(true);
//     try {
//       await updateProgress({
//         id: goalId,
//         amount: data.amount,
//       });
//       toast.success("Progress updated!");
//       form.reset();
//       onOpenChange();
//     } catch (error) {
//       if (error instanceof ConvexError) {
//         const { message } = error.data as { code: string; message: string };
//         toast.error(`Error: ${message}`);
//       } else {
//         toast.error("Failed to update progress");
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!goal) return null;

//   const remainingAmount = goal.targetAmount - goal.currentAmount;

//   return (
//     <Dialog open={goalId !== null} onOpenChange={onOpenChange}>
//       <DialogContent className="glass-strong max-w-sm">
//         <DialogHeader>
//           <DialogTitle>Add Progress</DialogTitle>
//           <DialogDescription>{goal.name}</DialogDescription>
//         </DialogHeader>

//         <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
//           <div className="flex justify-between">
//             <span className="text-muted-foreground">Current:</span>
//             <span className="font-medium">
//               KES {goal.currentAmount.toLocaleString()}
//             </span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-muted-foreground">Target:</span>
//             <span className="font-medium">
//               KES {goal.targetAmount.toLocaleString()}
//             </span>
//           </div>
//           <div className="flex justify-between border-t border-border pt-2">
//             <span className="text-muted-foreground">Remaining:</span>
//             <span className="font-semibold">
//               KES {remainingAmount.toLocaleString()}
//             </span>
//           </div>
//         </div>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//             <FormField
//               control={form.control}
//               name="amount"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Amount to Add (KES)</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="number"
//                       step="0.01"
//                       placeholder="0.00"
//                       autoFocus
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="flex justify-end gap-3">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={onOpenChange}
//                 disabled={isSubmitting}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={isSubmitting}>
//                 {isSubmitting ? "Adding..." : "Add Progress"}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }