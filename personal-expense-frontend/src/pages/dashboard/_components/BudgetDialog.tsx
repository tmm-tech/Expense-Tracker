import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { CreateBudgetInput, UpdateBudgetInput } from "@/types/budget";
/* =========================
   Types
========================= */

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  budgets: UpdateBudgetInput[];
}

/* =========================
   Constants
========================= */

const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Other Expense",
];

/* =========================
   Component
========================= */

export default function BudgetDialog({
  open,
  onOpenChange,
  editingId,
  budgets,
}: BudgetDialogProps) {
  const queryClient = useQueryClient();

  const createBudget = useMutation({
    mutationFn: (input: CreateBudgetInput) =>
      apiFetch("https://expense-tracker-u6ge.onrender.com/api/budgets", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });

  const updateBudget = useMutation({
    mutationFn: ({ id, ...payload }: UpdateBudgetInput) =>
      apiFetch(`https://expense-tracker-u6ge.onrender.com/api/budgets/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });

  const editingBudget =
    editingId != null
      ? (budgets.find((b) => b.id === editingId) ?? null)
      : null;

  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">(
    "monthly",
  );
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));

  /* -------------------------
     Sync form when editing
  -------------------------- */
  useEffect(() => {
    if (editingBudget) {
      setCategory(editingBudget.categoryIds?.[0] ?? "");
      setLimit(editingBudget.limit?.toString() ?? "");
      setPeriod(editingBudget.period ?? "monthly");
      setStartDate(format(editingBudget.startDate ?? Date.now(), "yyyy-MM-dd"));
    } else {
      setCategory("");
      setLimit("");
      setPeriod("monthly");
      setStartDate(format(new Date(), "yyyy-MM-dd"));
    }
  }, [editingBudget, open]);

  /* -------------------------
     Submit
  -------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !limit) {
      toast.error("Please fill in all fields");
      return;
    }

    const limitNum = Number(limit);
    if (isNaN(limitNum) || limitNum <= 0) {
      toast.error("Please enter a valid budget limit");
      return;
    }

    const startDateTs = new Date(startDate).getTime();

    const endDateTs =
      period === "weekly"
        ? startDateTs + 7 * 24 * 60 * 60 * 1000
        : period === "monthly"
          ? new Date(
              new Date(startDateTs).setMonth(
                new Date(startDateTs).getMonth() + 1,
              ),
            ).getTime()
          : new Date(
              new Date(startDateTs).setFullYear(
                new Date(startDateTs).getFullYear() + 1,
              ),
            ).getTime();

    const basePayload: CreateBudgetInput = {
      name: `${category} Budget`,
      amount: limitNum, // or total allowed amount
      limit: limitNum,
      categoryIds: [category],
      period,
      startDate: startDateTs,
      endDate: endDateTs,
    };

    try {
      try {
        if (editingBudget) {
          const updatePayload: UpdateBudgetInput = {
            id: editingBudget.id,
            ...basePayload,
          };

          await updateBudget.mutateAsync(updatePayload);
          toast.success("Budget updated");
        } else {
          const createPayload: CreateBudgetInput = basePayload;

          await createBudget.mutateAsync(createPayload);
          toast.success("Budget created");
        }

        onOpenChange(false);
      } catch {
        toast.error("Failed to save budget");
      }

      onOpenChange(false);
    } catch {
      toast.error("Failed to save budget");
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingId ? "Edit Budget" : "Create Budget"}
          </DialogTitle>
          <DialogDescription>
            {editingId
              ? "Update the budget details"
              : "Set a spending limit for a category"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={!!editingId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {editingId && (
              <p className="text-xs text-muted-foreground">
                Category cannot be changed after creation
              </p>
            )}
          </div>

          {/* Limit */}
          <div className="space-y-2">
            <Label>Budget Limit</Label>
            <Input
              type="number"
              step="0.01"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label>Period</Label>
            <Select
              value={period}
              onValueChange={(value) =>
                setPeriod(value as "weekly" | "monthly" | "yearly")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingId ? "Update" : "Create"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
