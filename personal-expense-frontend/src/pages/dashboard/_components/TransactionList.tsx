import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
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
import type { Category } from "@/types/category";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
/* ---------------- TYPES ---------------- */

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (id: string) => void;
  accounts: Account[];
  categories: Category[];
}
/* ---------------- COMPONENT ---------------- */

export function TransactionList({
  transactions,
  onEdit,
  accounts,
  categories,
}: TransactionListProps) {

  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/transactions/${id}`, {
        method: "DELETE",
      });

      await queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      toast.success("Transaction deleted");
    } catch (error) {
      console.error("Delete transaction error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete transaction"
      );
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
            const category = transaction.categoryId
              ? categories.find((c) => c.id === transaction.categoryId)
              : null;
            const transferAccount = transaction.transferAccountId
              ? accounts.find((a) => a.id === transaction.transferAccountId)
              : null;

            const txDate =
              typeof transaction.date === "string"
                ? new Date(transaction.date)
                : new Date(transaction.date);

            return (
              <div
                key={transaction.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
              >
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap sm:flex-nowrap">
                    <Badge
                      variant={
                        transaction.type === "income"
                          ? "default"
                          : transaction.type === "transfer"
                            ? "secondary"
                            : "destructive"
                      }
                      className="capitalize"
                    >
                      {transaction.type === "transfer"
                        ? transaction.transferDirection === "outgoing"
                          ? "Transfer Out"
                          : transaction.transferDirection === "incoming"
                            ? "Transfer In"
                            : "Transfer"
                        : transaction.type}
                    </Badge>
                    {transaction.type !== "transfer" && category && (
                      <span className="text-sm text-muted-foreground">
                        {category.name}
                      </span>
                    )}

                    {transaction.type === "transfer" ? (
                      <Badge variant="outline" className="text-xs">
                        {account?.name ?? "Unknown"}{" "}
                        {transaction.transferDirection === "outgoing"
                          ? "→"
                          : "←"}{" "}
                        {transferAccount?.name ?? "Unknown"}
                      </Badge>
                    ) : (
                      account && (
                        <Badge variant="outline" className="text-xs">
                          {account.name}
                        </Badge>
                      )
                    )}
                    <span className="text-xs text-muted-foreground sm:text-sm">
                      {format(txDate, "MMM dd, yyyy")}
                    </span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-sm text-foreground truncate">
                        {transaction.description}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>
                        {transaction.description}
                      </p>
                    </TooltipContent>
                  </Tooltip>

                </div>

                {/* Right */}
                <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end gap-3">
                  <span className={`text-lg font-bold ${transaction.type === "income"
                    ? "text-accent"
                    : transaction.type === "transfer"
                      ? "text-blue-500"
                      : "text-destructive"
                    }`}
                  >
                    {transaction.type === "income"
                      ? "+"
                      : transaction.type === "transfer"
                        ? transaction.transferDirection === "incoming"
                          ? "+"
                          : "-"
                        : "-"}
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
