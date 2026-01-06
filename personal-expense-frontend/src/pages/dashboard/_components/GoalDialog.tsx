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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import type { Goal } from "@/types/goal";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/* =========================
   Validation
========================= */

const goalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetAmount: z.coerce.number().positive("Target amount must be positive"),
  currentAmount: z.coerce.number().min(0, "Current amount cannot be negative"),
  endDate: z.string().min(1, "Deadline is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId?: string | null;
  goals: Goal[];
}

/* =========================
   Component
========================= */

export function GoalDialog({
  open,
  onOpenChange,
  editingId,
  goals,
}: GoalDialogProps) {
  const queryClient = useQueryClient();

  const editingGoal = editingId ? goals.find((g) => g.id === editingId) : null;

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      endDate: "",
      category: "",
      description: "",
    },
  });

  /* -------------------------
     Populate form on edit
  -------------------------- */
  useEffect(() => {
    if (editingGoal) {
      form.reset({
        name: editingGoal.name,
        targetAmount: editingGoal.targetAmount,
        currentAmount: editingGoal.currentAmount,
        endDate: new Date(editingGoal.endDate).toISOString().split("T")[0],
        category: editingGoal.category,
        description: editingGoal.description || "",
      });
    } else {
      form.reset();
    }
  }, [editingGoal, open, form]);
  const createGoal = useMutation({
    mutationFn: (payload: Omit<Goal, "id">) =>
      apiFetch<Goal>("/goals", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    onMutate: async (newGoal) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });

      const previous = queryClient.getQueryData<Goal[]>(["goals"]) ?? [];

      const optimisticGoal: Goal = {
        id: `temp-${Date.now()}`,
        ...newGoal,
      };

      queryClient.setQueryData<Goal[]>(
        ["goals"],
        [optimisticGoal, ...previous],
      );

      return { previous };
    },

    onError: (_err, _goal, ctx) => {
      queryClient.setQueryData(["goals"], ctx?.previous);
      toast.error("Failed to create goal");
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal created");
      onOpenChange(false);
      form.reset();
    },
  });

  const updateGoal = useMutation({
    mutationFn: (payload: Goal) =>
      apiFetch<Goal>(`/goals/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),

    onMutate: async (updatedGoal) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });

      const previous = queryClient.getQueryData<Goal[]>(["goals"]) ?? [];

      queryClient.setQueryData<Goal[]>(["goals"], (old = []) =>
        old.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)),
      );

      return { previous };
    },

    onError: (_err, _goal, ctx) => {
      queryClient.setQueryData(["goals"], ctx?.previous);
      toast.error("Failed to update goal");
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal updated");
      onOpenChange(false);
      form.reset();
    },
  });

  /* -------------------------
     Submit
  -------------------------- */
  const onSubmit = (data: GoalFormData) => {
    const deadlineTs = new Date(data.endDate).getTime();

    if (deadlineTs < Date.now()) {
      toast.error("Deadline must be in the future");
      return;
    }

    if (data.currentAmount > data.targetAmount) {
      toast.error("Current amount cannot exceed target");
      return;
    }
    const status: Goal["status"] =
      data.currentAmount >= data.targetAmount ? "completed" : "active";

    const payload = {
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      endDate: deadlineTs,
      category: data.category,
      status,
      description: data.description || undefined,
    };

    if (editingGoal) {
      updateGoal.mutate({
        id: editingGoal.id,
        ...payload,
      });
    } else {
      createGoal.mutate(payload);
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingGoal ? "Edit" : "New"} Financial Goal
          </DialogTitle>
          <DialogDescription>
            Set a savings target and track your progress
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Emergency Fund" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Savings, Travel, Education"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount (KES)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Amount (KES)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createGoal.isPending || updateGoal.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createGoal.isPending || updateGoal.isPending}
              >
                {createGoal.isPending || updateGoal.isPending
                  ? "Saving..."
                  : editingGoal
                    ? "Update"
                    : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
