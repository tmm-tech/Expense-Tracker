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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { apiFetch } from "@/lib/api";
import type { Transaction } from "@/types/transaction";
import type { Account } from "@/types/account";
/* ---------------- TYPES ---------------- */

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  transactions: Transaction[];
  accounts: Account[];
}

/* ---------------- CONSTANTS ---------------- */

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Other Income",
];

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

/* ---------------- COMPONENT ---------------- */

export function TransactionDialog({
  open,
  onOpenChange,
  editingId,
  transactions,
  accounts,
}: TransactionDialogProps) {
  const editingTransaction = editingId
    ? transactions.find((t) => t.id === editingId)
    : null;

  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [accountId, setAccountId] = useState<string>("");

  /* --------- Populate on edit --------- */

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setAmount(editingTransaction.amount.toString());
      setDescription(editingTransaction.description);

      const txDate =
        typeof editingTransaction.date === "string"
          ? new Date(editingTransaction.date)
          : new Date(editingTransaction.date);

      setDate(format(txDate, "yyyy-MM-dd"));
      setAccountId(editingTransaction.accountId ?? "");
    } else {
      setType("expense");
      setCategory("");
      setAmount("");
      setDescription("");
      setDate(format(new Date(), "yyyy-MM-dd"));
      setAccountId("");
    }
  }, [editingTransaction, open]);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !amount || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amountNum = Number(amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const payload = {
        type,
        category,
        amount: amountNum,
        description,
        date: new Date(date).getTime(),
        accountId: accountId || null,
      };

      if (editingId) {
        await apiFetch(`/transactions/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Transaction updated");
      } else {
        await apiFetch("/transactions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Transaction created");
      }

      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save transaction");
    }
  };

  const categories =
    type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  /* ---------------- UI ---------------- */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingId ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
          <DialogDescription>
            {editingId
              ? "Update the transaction details"
              : "Enter the details of your transaction"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v as "income" | "expense");
                setCategory("");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label>Account (Optional)</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No account</SelectItem>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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