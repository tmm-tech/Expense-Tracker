// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import type { Doc } from "@/convex/_generated/dataModel.d.ts";
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
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select.tsx";
// import { toast } from "sonner";
// import { ConvexError } from "convex/values";
// import { useState } from "react";

// const recurringSchema = z.object({
//   type: z.enum(["income", "expense"]),
//   category: z.string().min(1, "Category is required"),
//   amount: z.coerce.number().positive("Amount must be positive"),
//   description: z.string().min(1, "Description is required"),
//   frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
//   startDate: z.string().min(1, "Start date is required"),
//   endDate: z.string().optional(),
// });

// type RecurringFormData = z.infer<typeof recurringSchema>;

// interface RecurringTransactionDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   transaction?: Doc<"recurringTransactions"> | null;
// }

// export function RecurringTransactionDialog({
//   open,
//   onOpenChange,
//   transaction,
// }: RecurringTransactionDialogProps) {
//   const createRecurring = useMutation(api.recurringTransactions.create);
//   const updateRecurring = useMutation(api.recurringTransactions.update);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const form = useForm<RecurringFormData>({
//     resolver: zodResolver(recurringSchema),
//     defaultValues: transaction
//       ? {
//           type: transaction.type,
//           category: transaction.category,
//           amount: transaction.amount,
//           description: transaction.description,
//           frequency: transaction.frequency,
//           startDate: new Date(transaction.startDate).toISOString().split("T")[0],
//           endDate: transaction.endDate
//             ? new Date(transaction.endDate).toISOString().split("T")[0]
//             : "",
//         }
//       : {
//           type: "expense",
//           category: "",
//           amount: 0,
//           description: "",
//           frequency: "monthly",
//           startDate: new Date().toISOString().split("T")[0],
//           endDate: "",
//         },
//   });

//   const onSubmit = async (data: RecurringFormData) => {
//     setIsSubmitting(true);
//     try {
//       const startDate = new Date(data.startDate).getTime();
//       const endDate = data.endDate ? new Date(data.endDate).getTime() : undefined;

//       if (endDate && endDate < startDate) {
//         toast.error("End date must be after start date");
//         setIsSubmitting(false);
//         return;
//       }

//       if (transaction) {
//         await updateRecurring({
//           id: transaction._id,
//           type: data.type,
//           category: data.category,
//           amount: data.amount,
//           description: data.description,
//           frequency: data.frequency,
//           startDate,
//           endDate,
//         });
//         toast.success("Recurring transaction updated");
//       } else {
//         await createRecurring({
//           type: data.type,
//           category: data.category,
//           amount: data.amount,
//           description: data.description,
//           frequency: data.frequency,
//           startDate,
//           endDate,
//         });
//         toast.success("Recurring transaction created");
//       }

//       form.reset();
//       onOpenChange(false);
//     } catch (error) {
//       if (error instanceof ConvexError) {
//         const { message } = error.data as { code: string; message: string };
//         toast.error(`Error: ${message}`);
//       } else {
//         toast.error(
//           `Failed to ${transaction ? "update" : "create"} recurring transaction`
//         );
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="glass-strong max-w-md">
//         <DialogHeader>
//           <DialogTitle>
//             {transaction ? "Edit" : "New"} Recurring Transaction
//           </DialogTitle>
//           <DialogDescription>
//             Set up a transaction that repeats automatically
//           </DialogDescription>
//         </DialogHeader>

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//             <FormField
//               control={form.control}
//               name="type"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Type</FormLabel>
//                   <Select
//                     onValueChange={field.onChange}
//                     defaultValue={field.value}
//                   >
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select type" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="income">Income</SelectItem>
//                       <SelectItem value="expense">Expense</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="category"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Category</FormLabel>
//                   <FormControl>
//                     <Input placeholder="e.g. Rent, Salary" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="amount"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Amount (KES)</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="number"
//                       step="0.01"
//                       placeholder="0.00"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Description</FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder="e.g. Monthly rent payment"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="frequency"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Frequency</FormLabel>
//                   <Select
//                     onValueChange={field.onChange}
//                     defaultValue={field.value}
//                   >
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select frequency" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="daily">Daily</SelectItem>
//                       <SelectItem value="weekly">Weekly</SelectItem>
//                       <SelectItem value="monthly">Monthly</SelectItem>
//                       <SelectItem value="yearly">Yearly</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="startDate"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Start Date</FormLabel>
//                   <FormControl>
//                     <Input type="date" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="endDate"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>End Date (Optional)</FormLabel>
//                   <FormControl>
//                     <Input type="date" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="flex justify-end gap-3 pt-4">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => onOpenChange(false)}
//                 disabled={isSubmitting}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={isSubmitting}>
//                 {isSubmitting
//                   ? "Saving..."
//                   : transaction
//                     ? "Update"
//                     : "Create"}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }