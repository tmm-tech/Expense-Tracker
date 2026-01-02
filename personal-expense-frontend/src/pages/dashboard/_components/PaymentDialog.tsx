import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { toast } from "sonner";
import { format } from "date-fns";
import { apiFetch } from "@/lib/api";
import type { Debt } from "@/types/debt";

const paymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  paymentDate: z.string().min(1, "Payment date is required"),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  debt: Debt | null;
}

export default function PaymentDialog({
  open,
  onClose,
  debt,
}: PaymentDialogProps) {
  const qc = useQueryClient();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: debt?.minimumPayment ?? 0,
      paymentDate: format(new Date(), "yyyy-MM-dd"),
      notes: "",
    },
  });

  const makePaymentMutation = useMutation({
    mutationFn: (data: PaymentFormData) =>
      apiFetch(`/debts/${debt!.id}/payments`, {
        method: "POST",
        body: JSON.stringify({
          amount: data.amount,
          paymentDate: new Date(data.paymentDate).getTime(),
          notes: data.notes,
        }),
      }),
    onSuccess: () => {
      toast.success("Payment recorded successfully");
      qc.invalidateQueries({ queryKey: ["debts"] });
      qc.invalidateQueries({ queryKey: ["debt", debt?.id] });
      form.reset();
      onClose();
    },
    onError: () => {
      toast.error("Failed to record payment");
    },
  });

  if (!debt) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
          <DialogDescription>
            Record a payment for {debt.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) =>
              makePaymentMutation.mutate(data)
            )}
            className="space-y-4"
          >
            {/* Debt Summary */}
            <div className="rounded-lg border border-border/50 p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Current Balance
                </span>
                <span className="font-bold">
                  KES {debt.currentBalance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Minimum Payment
                </span>
                <span>KES {debt.minimumPayment.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Interest Rate
                </span>
                <span>{debt.interestRate.toFixed(2)}%</span>
              </div>
            </div>

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Amount (KES)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Minimum: KES {debt.minimumPayment.toFixed(2)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={makePaymentMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={makePaymentMutation.isPending}>
                {makePaymentMutation.isPending
                  ? "Recording..."
                  : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}