import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Repeat,
  Calendar,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Pencil,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { RecurringTransactionDialog } from "./RecurringTransactionDialog";

export function RecurringTransactionList() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  type ProcessRecurringResponse = {
    processed: number;
  };

  const { data, isLoading } = useQuery<any[]>({
    queryKey: ["recurring-transactions"],
    queryFn: () => apiFetch("https://expense-tracker-u6ge.onrender.com/api/recurring-transactions"),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`https://expense-tracker-u6ge.onrender.com/api/recurring-transactions/${id}/toggle`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      toast.success("Recurring transaction updated");
      qc.invalidateQueries({ queryKey: ["recurring-transactions"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`https://expense-tracker-u6ge.onrender.com/api/recurring-transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Recurring transaction deleted");
      qc.invalidateQueries({ queryKey: ["recurring-transactions"] });
    },
  });

  const processMutation = useMutation<ProcessRecurringResponse>({
  mutationFn: () =>
    apiFetch("https://expense-tracker-u6ge.onrender.com/api/recurring-transactions/process", {
      method: "POST",
    }),
  onSuccess: (res) => {
    toast.success(`Processed ${res.processed} transaction(s)`);
    qc.invalidateQueries({ queryKey: ["recurring-transactions"] });
  },
});

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Repeat />
          </EmptyMedia>
          <EmptyTitle>No recurring transactions</EmptyTitle>
          <EmptyDescription>
            Automate repeating income or expenses
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const active = data.filter((r: any) => r.isActive);
  const inactive = data.filter((r: any) => !r.isActive);

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => processMutation.mutate()}
        >
          <Play className="mr-2 h-4 w-4" />
          Process Due Transactions
        </Button>
      </div>

      <Section title={`Active (${active.length})`}>
        {active.map((t: any) => (
          <RecurringCard
            key={t.id}
            tx={t}
            onEdit={() => {
              setEditing(t);
              setDialogOpen(true);
            }}
            onToggle={() => toggleMutation.mutate(t.id)}
            onDelete={() => deleteMutation.mutate(t.id)}
            active
          />
        ))}
      </Section>

      <Section title={`Inactive (${inactive.length})`}>
        {inactive.map((t: any) => (
          <RecurringCard
            key={t.id}
            tx={t}
            onToggle={() => toggleMutation.mutate(t.id)}
            onDelete={() => deleteMutation.mutate(t.id)}
          />
        ))}
      </Section>

      <RecurringTransactionDialog
        open={dialogOpen}
        onOpenChange={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        transaction={editing}
      />
    </>
  );
}

/* ------------------ Helpers ------------------ */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">
        {title}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function RecurringCard({
  tx,
  onEdit,
  onToggle,
  onDelete,
  active,
}: {
  tx: any;
  onEdit?: () => void;
  onToggle: () => void;
  onDelete: () => void;
  active?: boolean;
}) {
  return (
    <Card className={`glass-card ${!active ? "opacity-60" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-base">{tx.description}</CardTitle>
            <CardDescription>{tx.category}</CardDescription>
          </div>
          <Badge variant={tx.type === "income" ? "default" : "secondary"}>
            {tx.type === "income" ? (
              <TrendingUp className="mr-1 h-3 w-3" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3" />
            )}
            {tx.type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-2xl font-bold">
            KES {tx.amount.toLocaleString()}
          </span>
          <Badge variant="outline">{tx.frequency}</Badge>
        </div>

        {tx.nextOccurrence && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Next: {format(new Date(tx.nextOccurrence), "PP")}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {onEdit && (
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              className="flex-1"
            >
              <Pencil className="mr-1 h-3 w-3" />
              Edit
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onToggle}>
            {active ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
