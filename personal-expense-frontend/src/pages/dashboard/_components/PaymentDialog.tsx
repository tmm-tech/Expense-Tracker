// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import type { Doc } from "@/convex/_generated/dataModel.d.ts";
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
// import { Textarea } from "@/components/ui/textarea.tsx";
// import { toast } from "sonner";
// import { format } from "date-fns";

// type Debt = Doc<"debts">;

// const paymentSchema = z.object({
//   amount: z.string().min(1, "Amount is required"),
//   paymentDate: z.string().min(1, "Payment date is required"),
//   notes: z.string().optional(),
// });

// type PaymentFormData = z.infer<typeof paymentSchema>;

// interface PaymentDialogProps {
//   open: boolean;
//   onClose: () => void;
//   debt: Debt | null;
// }

// export default function PaymentDialog({
//   open,
//   onClose,
//   debt,
// }: PaymentDialogProps) {
//   const makePayment = useMutation(api.debts.makePayment);

//   const form = useForm<PaymentFormData>({
//     resolver: zodResolver(paymentSchema),
//     defaultValues: {
//       amount: debt?.minimumPayment.toString() || "",
//       paymentDate: format(Date.now(), "yyyy-MM-dd"),
//       notes: "",
//     },
//   });

//   const onSubmit = async (data: PaymentFormData) => {
//     if (!debt) return;

//     try {
//       const paymentDate = new Date(data.paymentDate).getTime();
//       await makePayment({
//         debtId: debt._id,
//         amount: parseFloat(data.amount),
//         paymentDate,
//         notes: data.notes || undefined,
//       });

//       toast.success("Payment recorded successfully");
//       form.reset();
//       onClose();
//     } catch (error) {
//       toast.error("Failed to record payment");
//     }
//   };

//   if (!debt) return null;

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="glass">
//         <DialogHeader>
//           <DialogTitle>Make Payment</DialogTitle>
//           <DialogDescription>
//             Record a payment for {debt.name}
//           </DialogDescription>
//         </DialogHeader>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//             <div className="rounded-lg border border-border/50 p-4 space-y-2">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-muted-foreground">Current Balance</span>
//                 <span className="text-lg font-bold">KES {debt.currentBalance.toFixed(2)}</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-muted-foreground">Minimum Payment</span>
//                 <span className="text-sm font-medium">KES {debt.minimumPayment.toFixed(2)}</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-sm text-muted-foreground">Interest Rate</span>
//                 <span className="text-sm font-medium">{debt.interestRate.toFixed(2)}%</span>
//               </div>
//             </div>

//             <FormField
//               control={form.control}
//               name="amount"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Payment Amount (KES)</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="number"
//                       step="0.01"
//                       placeholder="0.00"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormDescription>
//                     Enter amount to pay (minimum: KES {debt.minimumPayment.toFixed(2)})
//                   </FormDescription>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="paymentDate"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Payment Date</FormLabel>
//                   <FormControl>
//                     <Input type="date" {...field} />
//                   </FormControl>
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
//                       placeholder="Payment notes..."
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
//                 Record Payment
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }