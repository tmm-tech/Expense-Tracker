import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TargetIcon,
  CalendarIcon,
  CheckCircle2Icon,
  XCircleIcon,
  PlusIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { GoalProgressDialog } from "./GoalProgressDialog";
import { toast } from "sonner";
import type { Goal } from "@/types/goal";
/* =========================
   Types (REST)
========================= */

interface GoalListProps {
  goals: Goal[] | undefined;
  onEdit: (id: string) => void;
  onRefresh: () => void;
}

/* =========================
   Component
========================= */

export function GoalList({ goals, onEdit, onRefresh }: GoalListProps) {
  const [progressGoalId, setProgressGoalId] = useState<string | null>(null);

  /* -------------------------
     Actions
  -------------------------- */

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this goal?")) return;

    try {
      await apiFetch(`https://expense-tracker-u6ge.onrender.com/api/goals/${id}`, { method: "DELETE" });
      toast.success("Goal deleted");
      onRefresh();
    } catch {
      toast.error("Failed to delete goal");
    }
  };

  const updateStatus = async (
    id: string,
    status: "active" | "completed"
  ) => {
    try {
      await apiFetch(`https://expense-tracker-u6ge.onrender.com/api/goals/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success("Goal updated");
      onRefresh();
    } catch {
      toast.error("Failed to update goal");
    }
  };

  /* -------------------------
     Loading / Empty
  -------------------------- */

  if (!goals) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TargetIcon />
          </EmptyMedia>
          <EmptyTitle>No financial goals yet</EmptyTitle>
          <EmptyDescription>
            Set savings goals and track your progress
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  /* -------------------------
     Helpers
  -------------------------- */

  const progressPercent = (g: Goal) =>
    Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100);

  const daysLeft = (deadline: number) =>
    differenceInDays(deadline, Date.now());

  const renderGoalCard = (goal: Goal) => {
    const progress = progressPercent(goal);
    const remainingDays = daysLeft(goal.deadline);
    const overdue = remainingDays < 0 && goal.status === "active";

    return (
      <Card key={goal.id} className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                {goal.name}
                {goal.status === "completed" && (
                  <CheckCircle2Icon className="h-5 w-5 text-accent" />
                )}
                {goal.status === "cancelled" && (
                  <XCircleIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </CardTitle>
              <CardDescription>{goal.category}</CardDescription>
            </div>

            {goal.status === "active" && (
              <Badge variant={overdue ? "destructive" : "secondary"}>
                {overdue
                  ? `${Math.abs(remainingDays)} days overdue`
                  : `${remainingDays} days left`}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {goal.description && (
            <p className="text-sm text-muted-foreground">
              {goal.description}
            </p>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm">
              <span>
                KES {goal.currentAmount.toLocaleString()}
              </span>
              <span className="text-muted-foreground">
                of KES {goal.targetAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            Target: {format(goal.deadline, "PPP")}
          </div>

          <div className="flex gap-2 pt-2">
            {goal.status === "active" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setProgressGoalId(goal.id)}
                >
                  <PlusIcon className="h-3 w-3 mr-1" />
                  Add Progress
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(goal.id)}
                >
                  <PencilIcon className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateStatus(goal.id, "completed")
                  }
                >
                  <CheckCircle2Icon className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(goal.id)}
                >
                  <Trash2Icon className="h-3 w-3" />
                </Button>
              </>
            )}

            {goal.status !== "active" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    updateStatus(goal.id, "active")
                  }
                >
                  Reactivate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(goal.id)}
                >
                  <Trash2Icon className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  /* =========================
     UI
  ========================= */

  return (
    <>
      <div className="space-y-6">
        {goals.filter(g => g.status === "active").length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Active Goals
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {goals
                .filter(g => g.status === "active")
                .map(renderGoalCard)}
            </div>
          </div>
        )}

        {goals.filter(g => g.status === "completed").length > 0 && (
          <div className="opacity-75">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Completed Goals
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {goals
                .filter(g => g.status === "completed")
                .map(renderGoalCard)}
            </div>
          </div>
        )}

        {goals.filter(g => g.status === "cancelled").length > 0 && (
          <div className="opacity-60">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              Cancelled Goals
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {goals
                .filter(g => g.status === "cancelled")
                .map(renderGoalCard)}
            </div>
          </div>
        )}
      </div>

      <GoalProgressDialog
        goalId={progressGoalId}
        open={progressGoalId !== null}
        onOpenChange={() => setProgressGoalId(null)}
      />
    </>
  );
}