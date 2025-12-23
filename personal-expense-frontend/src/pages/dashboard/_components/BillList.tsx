// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useMutation, useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";
// import { Button } from "@/components/ui/button.tsx";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog.tsx";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form.tsx";
// import { Input } from "@/components/ui/input.tsx";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select.tsx";
// import { Textarea } from "@/components/ui/textarea.tsx";
// import { toast } from "sonner";
// import { format } from "date-fns";
// import { Switch } from "@/components/ui/switch.tsx";

// type Bill = Doc<"bills">;
// type Account = Doc<"accounts">;

// const billSchema = z.object({
//   name: z.string().min(1, "Bill name is required"),
//   category: z.string().min(1, "Category is required"),
//   amount: z.string().min(1, "Amount is required"),
//   dueDate: z.string().min(1, "Due date is required"),
//   frequency: z.enum(["one-time", "weekly", "monthly", "quarterly", "yearly"]),
//   accountId: z.string().optional(),
//   reminderDays: z.string().min(0, "Reminder days must be 0 or more"),
//   notes: z.string().optional(),
//   autoPayEnabled: z.boolean(),
// });

// type BillFormData = z.infer<typeof billSchema>;

// interface BillDialogProps {
//   open: boolean;
//   onClose: () => void;
//   bill?: Bill | null;
//   accounts: Account[];
// }

// export default function BillDialog({
//   open,
//   onClose,
//   bill,
//   accounts,
// }: BillDialogProps) {
//   const createBill = useMutation(api.bills.create);
//   const updateBill = useMutation(api.bills.update);
//   const categories = useQuery(api.categories.listByType, { type: "expense" });

//   const form = useForm<BillFormData>({
//     resolver: zodResolver(billSchema),
//     defaultValues: {
//       name: bill?.name || "",
//       category: bill?.category || "",
//       amount: bill?.amount.toString() || "",
//       dueDate: bill?.dueDate
//         ? format(bill.dueDate, "yyyy-MM-dd")
//         : format(Date.now(), "yyyy-MM-dd"),
//       frequency: bill?.frequency || "monthly",
//       accountId: bill?.accountId || "none",
//       reminderDays: bill?.reminderDays.toString() || "7",
//       notes: bill?.notes || "",
//       autoPayEnabled: bill?.autoPayEnabled || false,
//     },
//   });

//   const onSubmit = async (data: BillFormData) => {
//     try {
//       const dueDate = new Date(data.dueDate).getTime();

//       if (bill) {
//         await updateBill({
//           id: bill._id,
//           name: data.name,
//           category: data.category,
//           amount: parseFloat(data.amount),
//           dueDate,
//           frequency: data.frequency,
//           accountId:
//             data.accountId && data.accountId !== "none"
//               ? (data.accountId as Id<"accounts">)
//               : undefined,
//           reminderDays: parseInt(data.reminderDays),
//           notes: data.notes || undefined,
//           autoPayEnabled: data.autoPayEnabled,
//         });
//         toast.success("Bill updated successfully");
//       } else {
//         await createBill({
//           name: data.name,
//           category: data.category,
//           amount: parseFloat(data.amount),
//           dueDate,
//           frequency: data.frequency,
//           accountId:
//             data.accountId && data.accountId !== "none"
//               ? (data.accountId as Id<"accounts">)
//               : undefined,
//           reminderDays: parseInt(data.reminderDays),
//           notes: data.notes || undefined,
//           autoPayEnabled: data.autoPayEnabled,
//         });
//         toast.success("Bill created successfully");
//       }

//       form.reset();
//       onClose();
//     } catch (error) {
//       toast.error("Failed to save bill");
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="glass max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>{bill ? "Edit Bill" : "Create Bill"}</DialogTitle>
//           <DialogDescription>
//             {bill
//               ? "Update bill details and payment schedule"
//               : "Add a new bill to track payments"}
//           </DialogDescription>
//         </DialogHeader>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//             <FormField
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Bill Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Electricity" {...field} />
//                   </FormControl>
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
//                   <Select
//                     onValueChange={field.onChange}
//                     defaultValue={field.value}
//                   >
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select category" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent className="glass">
//                       {categories?.map((cat) => (
//                         <SelectItem key={cat._id} value={cat.name}>
//                           {cat.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="grid grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="amount"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Amount (KES)</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         step="0.01"
//                         placeholder="0.00"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="dueDate"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Due Date</FormLabel>
//                     <FormControl>
//                       <Input type="date" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="frequency"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Frequency</FormLabel>
//                     <Select
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent className="glass">
//                         <SelectItem value="one-time">One-time</SelectItem>
//                         <SelectItem value="weekly">Weekly</SelectItem>
//                         <SelectItem value="monthly">Monthly</SelectItem>
//                         <SelectItem value="quarterly">Quarterly</SelectItem>
//                         <SelectItem value="yearly">Yearly</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="reminderDays"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Reminder (days before)</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         min="0"
//                         placeholder="7"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <FormField
//               control={form.control}
//               name="accountId"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Account (Optional)</FormLabel>
//                   <Select
//                     onValueChange={field.onChange}
//                     defaultValue={field.value}
//                   >
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select account" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent className="glass">
//                       <SelectItem value="none">No account</SelectItem>
//                       {accounts.map((account) => (
//                         <SelectItem key={account._id} value={account._id}>
//                           {account.name} ({account.type})
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <FormDescription>
//                     Account to deduct payment from
//                   </FormDescription>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="autoPayEnabled"
//               render={({ field }) => (
//                 <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 p-4">
//                   <div className="space-y-0.5">
//                     <FormLabel className="text-base">Auto-pay</FormLabel>
//                     <FormDescription>
//                       Automatically create transaction on due date
//                     </FormDescription>
//                   </div>
//                   <FormControl>
//                     <Switch
//                       checked={field.value}
//                       onCheckedChange={field.onChange}
//                     />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="notes"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Notes (Optional)</FormLabel>
//                   <FormControl>
//                     <Textarea
//                       placeholder="Additional details..."
//                       className="resize-none"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <DialogFooter>
//               <Button type="button" variant="outline" onClick={onClose}>
//                 Cancel
//               </Button>
//               <Button type="submit">
//                 {bill ? "Update Bill" : "Create Bill"}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }