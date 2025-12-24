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
/* =========================
   Validation
========================= */

const goalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetAmount: z.coerce.number().positive("Target amount must be positive"),
  currentAmount: z.coerce.number().min(0, "Current amount cannot be negative"),
  deadline: z.string().min(1, "Deadline is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId?: string | null;
  goals: Goal[];
  onSaved: () => void;
}

/* =========================
   Component
========================= */

export function GoalDialog({
  open,
  onOpenChange,
  editingId,
  goals,
  onSaved,
}: GoalDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editingGoal = editingId
    ? goals.find((g) => g.id === editingId)
    : null;

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      deadline: "",
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
        deadline: new Date(editingGoal.deadline)
          .toISOString()
          .split("T")[0],
        category: editingGoal.category,
        description: editingGoal.description || "",
      });
    } else {
      form.reset();
    }
  }, [editingGoal, open, form]);

  /* -------------------------
     Submit
  -------------------------- */
  const onSubmit = async (data: GoalFormData) => {
    setIsSubmitting(true);
    try {
      const deadlineTs = new Date(data.deadline).getTime();

      if (deadlineTs < Date.now()) {
        toast.error("Deadline must be in the future");
        return;
      }

      if (data.currentAmount > data.targetAmount) {
        toast.error("Current amount cannot exceed target");
        return;
      }

      const payload = {
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount,
        deadline: deadlineTs,
        category: data.category,
        description: data.description || undefined,
      };

      if (editingGoal) {
        await apiFetch(`/api/goals/${editingGoal.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Goal updated");
      } else {
        await apiFetch("/api/goals", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Goal created");
      }

      onSaved();
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error(
        `Failed to ${editingGoal ? "update" : "create"} goal`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-md">
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
                    <Input
                      placeholder="e.g. Emergency Fund"
                      {...field}
                    />
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
              name="deadline"
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
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
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