import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Edit,
  Building2,
  Wallet,
  Landmark,
  Banknote,
  Smartphone,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Account } from "@/types/account.ts";

interface AccountListProps {
  accounts: Account[];
  onEdit: (id: string) => void;
  onSelect?: (id: string) => void;
}

/* ---------------- CONFIG ---------------- */

const ACCOUNT_ICONS: Record<Account["type"], any> = {
  Bank: Building2,
  MMF: TrendingUp,
  SACCO: Landmark,
  Cash: Banknote,
  "Mpesa": Smartphone,
  "Credit Card": CreditCard,
  "Debit Card": CreditCard,
  Other: Wallet,
};

const ACCOUNT_COLORS: Record<Account["type"], string> = {
  Bank: "text-blue-500",
  MMF: "text-green-500",
  SACCO: "text-purple-500",
  Cash: "text-emerald-500",
  "Mpesa": "text-orange-500",
  "Credit Card": "text-red-500",
  "Debit Card": "text-red-500",
  Other: "text-gray-500",
};

/* ---------------- COMPONENT ---------------- */

export default function AccountList({
  accounts,
  onEdit,
  onSelect,
}: AccountListProps) {
  const queryClient = useQueryClient();

  const deleteAccount = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/accounts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete account");
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete account "${name}"?`)) {
      deleteAccount.mutate(id);
    }
  };

  if (accounts.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No accounts yet</p>
          <p className="text-sm text-muted-foreground text-center">
            Create your first account to start tracking your finances
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  return (
    <div className="space-y-6">
      {/* Total Balance */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-primary">
            KES {totalBalance.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Across {accounts.length}{" "}
            {accounts.length === 1 ? "account" : "accounts"}
          </p>
        </CardContent>
      </Card>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => {
          const Icon = ACCOUNT_ICONS[account.type];
          const colorClass = ACCOUNT_COLORS[account.type];

          return (
            <Card
              key={account.id}
              className="glass-card cursor-pointer hover:border-primary/40 transition-all"
              onClick={() => onSelect?.(account.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-primary/10 ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {account.type}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {account.institutionName && (
                  <div>
                    <p className="text-xs text-muted-foreground">Institution</p>
                    <p className="text-sm font-medium">
                      {account.institutionName}
                    </p>
                  </div>
                )}

                {account.accountNumber && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Account Number
                    </p>
                    <p className="text-sm font-mono">
                      ••••{account.accountNumber.slice(-4)}
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-border/40">
                  <p className="text-xs text-muted-foreground mb-1">
                    Current Balance
                  </p>
                  <p className="text-2xl font-bold">
                    {account.currency || "KES"}{" "}
                    {account.balance.toFixed(2)}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(account.id);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(account.id, account.name);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}