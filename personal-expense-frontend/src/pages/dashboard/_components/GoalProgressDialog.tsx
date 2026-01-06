import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Goal } from "@/types/goal";
import { apiFetch } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/* =========================
   Schema
========================= */

const progressSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
});

type ProgressFormData = z.infer<typeof progressSchema>;

interface GoalProgressDialogProps {
  goalId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* =========================
   Component
========================= */

export function GoalProgressDialog({
  goalId,
  open,
  onOpenChange,
}: GoalProgressDialogProps) {
  const queryClient = useQueryClient();

  const goal =
    queryClient
      .getQueryData<Goal[]>(["goals"])
      ?.find((g) => g.id === goalId) ?? null;

  const form = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema),
    defaultValues: { amount: 0 },
  });

  const addProgress = useMutation({
    mutationFn: (amount: number) =>
      apiFetch(`/goals/${goalId}/progress`, {
        method: "POST",
        body: JSON.stringify({ amount }),
      }),

    onMutate: async (amount) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });

      const previous =
        queryClient.getQueryData<Goal[]>(["goals"]) ?? [];

      queryClient.setQueryData<Goal[]>(["goals"], (old = []) =>
        old.map((g) => {
          if (g.id !== goalId) return g;

          const newAmount = g.currentAmount + amount;
          const status: Goal["status"] =
            newAmount >= g.targetAmount ? "completed" : "active";

          return {
            ...g,
            currentAmount: newAmount,
            status,
          };
        }),
      );

      return { previous };
    },

    onError: (_err, _amount, ctx) => {
      queryClient.setQueryData(["goals"], ctx?.previous);
      toast.error("Failed to update progress");
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Progress added");
      form.reset();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: ProgressFormData) => {
    if (!goalId) return;
    addProgress.mutate(data.amount);
  };

  if (!goal) return null;

  const remaining = goal.targetAmount - goal.currentAmount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Progress</DialogTitle>
          <DialogDescription>{goal.name}</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current</span>
            <span>KES {goal.currentAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Target</span>
            <span>KES {goal.targetAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Remaining</span>
            <span>KES {remaining.toLocaleString()}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (KES)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={addProgress.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addProgress.isPending}>
                {addProgress.isPending ? "Adding..." : "Add Progress"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}