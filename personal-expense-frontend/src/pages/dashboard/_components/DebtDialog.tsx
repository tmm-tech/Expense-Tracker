// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useMutation } from "convex/react";
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

// type Debt = Doc<"debts">;
// type Account = Doc<"accounts">;

// const debtSchema = z.object({
//   name: z.string().min(1, "Debt name is required"),
//   type: z.enum([
//     "Credit Card",
//     "Personal Loan",
//     "Mortgage",
//     "Auto Loan",
//     "Student Loan",
//     "Medical Debt",
//     "Other",
//   ]),
//   creditor: z.string().min(1, "Creditor is required"),
//   originalAmount: z.string().min(1, "Original amount is required"),
//   currentBalance: z.string().min(1, "Current balance is required"),
//   interestRate: z.string().min(0, "Interest rate must be 0 or more"),
//   minimumPayment: z.string().min(1, "Minimum payment is required"),
//   dueDay: z.string().min(1, "Due day is required"),
//   startDate: z.string().min(1, "Start date is required"),
//   accountId: z.string().optional(),
//   notes: z.string().optional(),
// });

// type DebtFormData = z.infer<typeof debtSchema>;

// interface DebtDialogProps {
//   open: boolean;
//   onClose: () => void;
//   debt?: Debt | null;
//   accounts: Account[];
// }

// export default function DebtDialog({
//   open,
//   onClose,
//   debt,
//   accounts,
// }: DebtDialogProps) {
//   const createDebt = useMutation(api.debts.create);
//   const updateDebt = useMutation(api.debts.update);

//   const form = useForm<DebtFormData>({
//     resolver: zodResolver(debtSchema),
//     defaultValues: {
//       name: debt?.name || "",
//       type: debt?.type || "Credit Card",
//       creditor: debt?.creditor || "",
//       originalAmount: debt?.originalAmount.toString() || "",
//       currentBalance: debt?.currentBalance.toString() || "",
//       interestRate: debt?.interestRate.toString() || "0",
//       minimumPayment: debt?.minimumPayment.toString() || "",
//       dueDay: debt?.dueDay.toString() || "1",
//       startDate: debt?.startDate
//         ? format(debt.startDate, "yyyy-MM-dd")
//         : format(Date.now(), "yyyy-MM-dd"),
//       accountId: debt?.accountId || "none",
//       notes: debt?.notes || "",
//     },
//   });

//   const onSubmit = async (data: DebtFormData) => {
//     try {
//       if (debt) {
//         await updateDebt({
//           id: debt._id,
//           name: data.name,
//           type: data.type,
//           creditor: data.creditor,
//           currentBalance: parseFloat(data.currentBalance),
//           interestRate: parseFloat(data.interestRate),
//           minimumPayment: parseFloat(data.minimumPayment),
//           dueDay: parseInt(data.dueDay),
//           accountId:
//             data.accountId && data.accountId !== "none"
//               ? (data.accountId as Id<"accounts">)
//               : undefined,
//           notes: data.notes || undefined,
//         });
//         toast.success("Debt updated successfully");
//       } else {
//         const startDate = new Date(data.startDate).getTime();
//         await createDebt({
//           name: data.name,
//           type: data.type,
//           creditor: data.creditor,
//           originalAmount: parseFloat(data.originalAmount),
//           currentBalance: parseFloat(data.currentBalance),
//           interestRate: parseFloat(data.interestRate),
//           minimumPayment: parseFloat(data.minimumPayment),
//           dueDay: parseInt(data.dueDay),
//           startDate,
//           accountId:
//             data.accountId && data.accountId !== "none"
//               ? (data.accountId as Id<"accounts">)
//               : undefined,
//           notes: data.notes || undefined,
//         });
//         toast.success("Debt created successfully");
//       }

//       form.reset();
//       onClose();
//     } catch (error) {
//       toast.error("Failed to save debt");
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="glass max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>{debt ? "Edit Debt" : "Add Debt"}</DialogTitle>
//           <DialogDescription>
//             {debt
//               ? "Update debt details and payment information"
//               : "Add a new debt to track and plan payoff"}
//           </DialogDescription>
//         </DialogHeader>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//             <FormField
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Debt Name</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Chase Credit Card" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="grid grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="type"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Debt Type</FormLabel>
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
//                         <SelectItem value="Credit Card">Credit Card</SelectItem>
//                         <SelectItem value="Personal Loan">Personal Loan</SelectItem>
//                         <SelectItem value="Mortgage">Mortgage</SelectItem>
//                         <SelectItem value="Auto Loan">Auto Loan</SelectItem>
//                         <SelectItem value="Student Loan">Student Loan</SelectItem>
//                         <SelectItem value="Medical Debt">Medical Debt</SelectItem>
//                         <SelectItem value="Other">Other</SelectItem>
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="creditor"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Creditor</FormLabel>
//                     <FormControl>
//                       <Input placeholder="Bank name" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             {!debt && (
//               <FormField
//                 control={form.control}
//                 name="originalAmount"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Original Amount (KES)</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         step="0.01"
//                         placeholder="0.00"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormDescription>
//                       The total amount borrowed initially
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}

//             <FormField
//               control={form.control}
//               name="currentBalance"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Current Balance (KES)</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="number"
//                       step="0.01"
//                       placeholder="0.00"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormDescription>
//                     The amount you currently owe
//                   </FormDescription>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <div className="grid grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="interestRate"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Interest Rate (%)</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         step="0.01"
//                         placeholder="0.00"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormDescription>Annual percentage rate</FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="minimumPayment"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Minimum Payment (KES)</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         step="0.01"
//                         placeholder="0.00"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormDescription>Monthly minimum</FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <FormField
//                 control={form.control}
//                 name="dueDay"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Payment Due Day</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="number"
//                         min="1"
//                         max="31"
//                         placeholder="15"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormDescription>Day of month (1-31)</FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {!debt && (
//                 <FormField
//                   control={form.control}
//                   name="startDate"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Start Date</FormLabel>
//                       <FormControl>
//                         <Input type="date" {...field} />
//                       </FormControl>
//                       <FormDescription>When debt started</FormDescription>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               )}
//             </div>

//             <FormField
//               control={form.control}
//               name="accountId"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Payment Account (Optional)</FormLabel>
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
//                     Account to deduct payments from
//                   </FormDescription>
//                   <FormMessage />
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
//                 {debt ? "Update Debt" : "Add Debt"}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }