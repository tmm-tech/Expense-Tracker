import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { apiFetch } from "@/lib/api";
import type { Account } from "@/types/account.ts";
/* ---------------- TYPES ---------------- */

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  accounts: Account[];
}

/* ---------------- CONSTANTS ---------------- */

const ACCOUNT_TYPES = [
  "Bank",
  "MMF",
  "SACCO",
  "Cash",
  "Mpesa",
  "Credit Card",
  "Debit Card",
  "Other",
] as const;

const CURRENCY_OPTIONS = ["KES", "USD", "EUR", "GBP"];

/* ---------------- COMPONENT ---------------- */

export default function AccountDialog({
  open,
  onOpenChange,
  editingId,
  accounts,
}: AccountDialogProps) {
  const queryClient = useQueryClient();

  const editingAccount = editingId
    ? accounts.find((a) => a.id === editingId)
    : null;

  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof ACCOUNT_TYPES)[number]>("Bank");
  const [institutionName, setInstitutionName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [balance, setBalance] = useState("");
  const [currency, setCurrency] = useState("KES");

  /* ---------- Mutations ---------- */

  const createAccount = useMutation({
    mutationFn: (payload: Omit<Account, "id">) =>
      apiFetch("https://expense-tracker-u6ge.onrender.com/api/accounts", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account created successfully");
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to create account"),
  });

  const updateAccount = useMutation({
    mutationFn: (payload: Account) =>
      apiFetch(`https://expense-tracker-u6ge.onrender.com/api/accounts/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account updated successfully");
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to update account"),
  });

  /* ---------- Sync form ---------- */

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name);
      setType(editingAccount.type);
      setInstitutionName(editingAccount.institutionName || "");
      setAccountNumber(editingAccount.accountNumber || "");
      setBalance(editingAccount.balance.toString());
      setCurrency(editingAccount.currency || "KES");
    } else {
      setName("");
      setType("Bank");
      setInstitutionName("");
      setAccountNumber("");
      setBalance("");
      setCurrency("KES");
    }
  }, [editingAccount, open]);

  /* ---------- Submit ---------- */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const balanceNum = Number(balance);
    if (!name.trim() || isNaN(balanceNum)) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    const payload = {
      name: name.trim(),
      type,
      institutionName: institutionName || undefined,
      accountNumber: accountNumber || undefined,
      balance: balanceNum,
      currency,
    };

    if (editingId) {
      updateAccount.mutate({ id: editingId, ...payload });
    } else {
      createAccount.mutate(payload);
    }
  };

  /* ---------- UI ---------- */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingId ? "Edit Account" : "Create New Account"}
          </DialogTitle>
          <DialogDescription>
            {editingId
              ? "Update your account details"
              : "Add a new account to track your finances"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Account Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Account Type *</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="Institution Name"
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
          />

          <Input
            placeholder="Account Number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Balance"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
            />

            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingId ? "Update" : "Create"} Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}