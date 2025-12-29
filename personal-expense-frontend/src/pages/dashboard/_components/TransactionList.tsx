import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Receipt } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { apiFetch } from "@/lib/api";
import type { Transaction } from "@/types/transaction";
import type { Account } from "@/types/account";
/* ---------------- TYPES ---------------- */

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (id: string) => void;
  accounts: Account[];
}

/* ---------------- COMPONENT ---------------- */

export function TransactionList({
  transactions,
  onEdit,
  accounts,
}: TransactionListProps) {
  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/transactions/${id}`, { method: "DELETE" });
      toast.success("Transaction deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete transaction");
    }
  };

  if (transactions.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="pt-6">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Receipt />
              </EmptyMedia>
              <EmptyTitle>No transactions found</EmptyTitle>
              <EmptyDescription>
                Try adjusting your filters or add a new transaction
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transactions</CardTitle>
          <Badge variant="secondary">{transactions.length} results</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const account = transaction.accountId
              ? accounts.find((a) => a.id === transaction.accountId)
              : null;

            const txDate =
              typeof transaction.date === "string"
                ? new Date(transaction.date)
                : new Date(transaction.date);

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
              >
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <Badge
                      variant={
                        transaction.type === "income"
                          ? "default"
                          : "destructive"
                      }
                      className="capitalize"
                    >
                      {transaction.type}
                    </Badge>

                    <span className="text-sm text-muted-foreground">
                      {transaction.category}
                    </span>

                    {account && (
                      <Badge variant="outline" className="text-xs">
                        {account.name}
                      </Badge>
                    )}

                    <span className="text-sm text-muted-foreground">
                      {format(txDate, "MMM dd, yyyy")}
                    </span>
                  </div>

                  <p className="text-sm text-foreground truncate">
                    {transaction.description}
                  </p>
                </div>

                {/* Right */}
                <div className="flex items-center gap-4 ml-4">
                  <span
                    className={`text-lg font-bold ${
                      transaction.type === "income"
                        ? "text-accent"
                        : "text-destructive"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    KES {transaction.amount.toFixed(2)}
                  </span>

                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(transaction.id)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}