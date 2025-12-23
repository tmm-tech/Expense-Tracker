import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { useState } from "react";

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
  editingId?: Id<"goals"> | null;
  goals: Doc<"goals">[];
}

export function GoalDialog({
  open,
  onOpenChange,
  editingId,
  goals,
}: GoalDialogProps) {
  const createGoal = useMutation(api.goals.create);
  const updateGoal = useMutation(api.goals.update);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editingGoal = editingId
    ? goals.find((g) => g._id === editingId)
    : null;

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: editingGoal
      ? {
          name: editingGoal.name,
          targetAmount: editingGoal.targetAmount,
          currentAmount: editingGoal.currentAmount,
          deadline: new Date(editingGoal.deadline).toISOString().split("T")[0],
          category: editingGoal.category,
          description: editingGoal.description || "",
        }
      : {
          name: "",
          targetAmount: 0,
          currentAmount: 0,
          deadline: "",
          category: "",
          description: "",
        },
  });

  const onSubmit = async (data: GoalFormData) => {
    setIsSubmitting(true);
    try {
      const deadline = new Date(data.deadline).getTime();

      if (deadline < Date.now()) {
        toast.error("Deadline must be in the future");
        setIsSubmitting(false);
        return;
      }

      if (data.currentAmount > data.targetAmount) {
        toast.error("Current amount cannot exceed target amount");
        setIsSubmitting(false);
        return;
      }

      if (editingGoal) {
        await updateGoal({
          id: editingGoal._id,
          name: data.name,
          targetAmount: data.targetAmount,
          currentAmount: data.currentAmount,
          deadline,
          category: data.category,
          description: data.description,
        });
        toast.success("Goal updated");
      } else {
        await createGoal({
          name: data.name,
          targetAmount: data.targetAmount,
          currentAmount: data.currentAmount,
          deadline,
          category: data.category,
          description: data.description,
        });
        toast.success("Goal created");
      }

      form.reset();
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(`Error: ${message}`);
      } else {
        toast.error(`Failed to ${editingGoal ? "update" : "create"} goal`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
                      placeholder="e.g. Emergency Fund, Vacation"
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
                    <Input placeholder="e.g. Savings, Travel" {...field} />
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
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
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
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
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
                    <Textarea
                      placeholder="e.g. Saving for a trip to Mombasa"
                      rows={3}
                      {...field}
                    />
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