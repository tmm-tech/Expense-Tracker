import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";

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

  const [selectedTransactions, setSelectedTransactions] =
    React.useState<Set<string>>(new Set());

  const [isDeleting, setIsDeleting] = React.useState(false);

  /* ===========================
     SELECTION
  ============================ */

  const toggleSelection = (id: string) => {
    setSelectedTransactions((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const allSelected =
    transactions.length > 0 &&
    transactions.every((transaction) =>
      selectedTransactions.has(transaction.id)
    );

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedTransactions(new Set());
      return;
    }

    setSelectedTransactions(
      new Set(transactions.map((transaction) => transaction.id))
    );
  };

  /* ===========================
     INDIVIDUAL DELETE
  ============================ */

  const handleDelete = async (id: string) => {
    try {
      const transaction = transactions.find((t) => t.id === id);

      if (!transaction) {
        toast.error("Transaction not found");
        return;
      }

      if (transaction.type === "transfer") {
        if (!transaction.transferId) {
          toast.error("Transfer ID is missing");
          return;
        }

        await apiFetch(`/transfer/${transaction.transferId}`, {
          method: "DELETE",
        });

        toast.success("Transfer deleted");
      } else {
        await apiFetch(`/transactions/${id}`, {
          method: "DELETE",
        });

        toast.success("Transaction deleted");
      }

      await queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["account"],
      });
    } catch (error) {
      console.error("Delete transaction error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete transaction"
      );
    }
  };

  /* ===========================
     BATCH DELETE
  ============================ */

  const handleBatchDelete = async () => {
    if (selectedTransactions.size === 0) {
      return;
    }

    const selected = transactions.filter((transaction) =>
      selectedTransactions.has(transaction.id)
    );

    const transactionIds: string[] = [];
    const transferIds: string[] = [];

    for (const transaction of selected) {
      if (transaction.type === "transfer") {
        if (!transaction.transferId) {
          toast.error(
            `Transfer ID is missing for "${transaction.description}"`
          );
          return;
        }

        /*
         * A transfer is represented by two transaction
         * rows. Only send the parent transfer ID.
         */
        transferIds.push(transaction.transferId);
      } else {
        transactionIds.push(transaction.id);
      }
    }

    /*
     * Remove duplicate transfer IDs.
     *
     * This is important if both sides of a transfer
     * are present in the current transaction list.
     */
    const uniqueTransferIds = [...new Set(transferIds)];

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedTransactions.size} selected transaction${
        selectedTransactions.size === 1 ? "" : "s"
      }? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);

      await apiFetch("/transactions/batch", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionIds,
          transferIds: uniqueTransferIds,
        }),
      });

      /*
       * Clear selection immediately after successful
       * backend deletion.
       */
      setSelectedTransactions(new Set());

      /*
       * Refresh all affected data.
       */
      await queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["account"],
      });

      toast.success(
        `${selectedTransactions.size} transaction${
          selectedTransactions.size === 1 ? "" : "s"
        } deleted successfully`
      );
    } catch (error) {
      console.error(
        "Batch delete transactions error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete selected transactions"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /* ===========================
     EMPTY STATE
  ============================ */

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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={allSelected}
              onCheckedChange={toggleSelectAll}
              aria-label="Select all transactions"
            />

            <CardTitle>Transactions</CardTitle>

            <Badge variant="secondary">
              {transactions.length} results
            </Badge>
          </div>

          {selectedTransactions.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />

              {isDeleting
                ? "Deleting..."
                : `Delete Selected (${selectedTransactions.size})`}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const account = transaction.accountId
              ? accounts.find(
                  (a) => a.id === transaction.accountId
                )
              : null;

            const category = transaction.categoryId
              ? categories.find(
                  (c) => c.id === transaction.categoryId
                )
              : null;

            const transferAccount =
              transaction.transferAccountId
                ? accounts.find(
                    (a) =>
                      a.id === transaction.transferAccountId
                  )
                : null;

            const txDate =
              typeof transaction.date === "string"
                ? new Date(transaction.date)
                : new Date(transaction.date);

            const isSelected =
              selectedTransactions.has(transaction.id);

            return (
              <div
                key={transaction.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border transition-colors ${
                  isSelected
                    ? "border-primary/60 bg-primary/5"
                    : "border-border/50 hover:border-primary/50"
                }`}
              >
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap sm:flex-nowrap">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() =>
                        toggleSelection(transaction.id)
                      }
                      aria-label={`Select ${transaction.description}`}
                    />

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
                        ? transaction.transferDirection ===
                          "outgoing"
                          ? "Transfer Out"
                          : transaction.transferDirection ===
                              "incoming"
                            ? "Transfer In"
                            : "Transfer"
                        : transaction.type}
                    </Badge>

                    {transaction.type !== "transfer" &&
                      category && (
                        <span className="text-sm text-muted-foreground">
                          {category.name}
                        </span>
                      )}

                    {transaction.type === "transfer" ? (
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        {account?.name ?? "Unknown"}{" "}
                        {transaction.transferDirection ===
                        "outgoing"
                          ? "→"
                          : "←"}{" "}
                        {transferAccount?.name ?? "Unknown"}
                      </Badge>
                    ) : (
                      account && (
                        <Badge
                          variant="outline"
                          className="text-xs"
                        >
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
                      <p>{transaction.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Right */}
                <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end gap-3">
                  <span
                    className={`text-lg font-bold ${
                      transaction.type === "income"
                        ? "text-accent"
                        : transaction.type === "transfer"
                          ? "text-blue-500"
                          : "text-destructive"
                    }`}
                  >
                    {transaction.type === "income"
                      ? "+"
                      : transaction.type === "transfer"
                        ? transaction.transferDirection ===
                          "incoming"
                          ? "+"
                          : "-"
                        : "-"}

                    KES{" "}
                    {Number(transaction.amount).toFixed(2)}
                  </span>

                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        onEdit(transaction.id)
                      }
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        handleDelete(transaction.id)
                      }
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