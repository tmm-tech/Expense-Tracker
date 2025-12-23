import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Pencil, Trash2, Receipt } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { toast } from "sonner";
import { format } from "date-fns";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty.tsx";
import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";

interface TransactionListProps {
  transactions: Doc<"transactions">[];
  onEdit: (id: Id<"transactions">) => void;
  accounts: Doc<"accounts">[];
}

export function TransactionList({ transactions, onEdit, accounts }: TransactionListProps) {
  const removeTransaction = useMutation(api.transactions.remove);

  const handleDelete = async (id: Id<"transactions">) => {
    try {
      await removeTransaction({ id });
      toast.success("Transaction deleted");
    } catch (error) {
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
              ? accounts.find((a) => a._id === transaction.accountId)
              : null;
            
            return (
            <div
              key={transaction._id}
              className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <Badge
                    variant={transaction.type === "income" ? "default" : "destructive"}
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
                    {format(transaction.date, "MMM dd, yyyy")}
                  </span>
                </div>
                <p className="text-sm text-foreground truncate">
                  {transaction.description}
                </p>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <span
                  className={`text-lg font-bold ${
                    transaction.type === "income"
                      ? "text-accent"
                      : "text-destructive"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}KES {transaction.amount.toFixed(2)}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(transaction._id)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(transaction._id)}
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