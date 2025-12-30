import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2, PiggyBank } from "lucide-react";
import { toast } from "sonner";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import type { Budget } from "@/types/budget";
/* =========================
   Types (REST-based)
========================= */
interface BudgetSpending {
  spent: number;
  limit: number;
  remaining: number;
  percentage: number;
}

interface BudgetListProps {
  budgets: Budget[];
  onEdit: (id: string) => void;
}

/* =========================
   Budget List
========================= */

export function BudgetList({ budgets, onEdit }: BudgetListProps) {
  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/budgets/${id}`, { method: "DELETE" });
      toast.success("Budget deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete budget");
    }
  };

  if (budgets.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PiggyBank />
              </EmptyMedia>
              <EmptyTitle>No budgets set</EmptyTitle>
              <EmptyDescription>
                Create your first budget to track spending by category
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {budgets.map((budget) => (
        <BudgetCard
          key={budget.id}
          budget={budget}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

/* =========================
   Budget Card
========================= */

interface BudgetCardProps {
  budget: Budget;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const [spending, setSpending] = useState<BudgetSpending | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSpending = async () => {
      try {
        const data = await apiFetch<BudgetSpending>(
          `/budgets/${budget.id}/spending`
        );
        setSpending(data);
      } catch (error) {
        console.error("Failed to load budget spending", error);
      } finally {
        setLoading(false);
      }
    };

    loadSpending();
  }, [budget.id]);

  if (loading || !spending) {
    return (
      <Card>
        <CardHeader>
          <div className="h-20 bg-muted animate-pulse rounded" />
        </CardHeader>
      </Card>
    );
  }

  const percentage = Math.min(spending.percentage, 100);
  const isOverBudget = spending.spent > spending.limit;
  const isNearLimit = percentage > 80 && !isOverBudget;

  return (
    <Card
      className={
        isOverBudget
          ? "border-destructive/50"
          : isNearLimit
          ? "border-yellow-500/50"
          : ""
      }
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{budget.categoryId}</CardTitle>
            <CardDescription className="capitalize">
              {budget.period} Budget
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => onEdit(budget.id)}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => onDelete(budget.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Spent</span>
            <span
              className={`font-medium ${
                isOverBudget ? "text-destructive" : ""
              }`}
            >
              KES {spending.spent.toFixed(2)} / KES{" "}
              {spending.limit.toFixed(2)}
            </span>
          </div>

          <Progress
            value={percentage}
            className={`h-2 ${
              isOverBudget
                ? "bg-destructive/20 [&>div]:bg-destructive"
                : isNearLimit
                ? "bg-yellow-500/20 [&>div]:bg-yellow-500"
                : ""
            }`}
          />
        </div>

        <div className="flex items-center justify-between">
          <Badge
            variant={isOverBudget ? "destructive" : "secondary"}
            className="text-xs"
          >
            {percentage.toFixed(0)}% Used
          </Badge>
          <span
            className={`text-sm font-medium ${
              isOverBudget ? "text-destructive" : "text-accent"
            }`}
          >
            {isOverBudget ? "-" : ""}KES{" "}
            {Math.abs(spending.remaining).toFixed(2)}{" "}
            {isOverBudget ? "over" : "left"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
