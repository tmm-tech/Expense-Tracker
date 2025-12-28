import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  Wallet,
  Landmark,
  Banknote,
  Smartphone,
  CreditCard,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { format } from "date-fns";
import { apiFetch } from "@/lib/api";
import type { Transaction } from "@/types/transaction";
import type { Account } from "@/types/account";

/* ---------------- ICON MAP ---------------- */

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

/* ---------------- PROPS ---------------- */

interface AccountDetailViewProps {
  accountId: string;
  account: Account;
  onBack: () => void;
}

/* ---------------- COMPONENT ---------------- */

export default function AccountDetailView({
  accountId,
  account,
  onBack,
}: AccountDetailViewProps) {
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["account-transactions", accountId],
    queryFn: () =>
      apiFetch(`https://expense-tracker-u6ge.onrender.com/api/accounts/${accountId}/transactions`),
  });

  const Icon = ACCOUNT_ICONS[account.type];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Accounts
        </Button>
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Accounts
      </Button>

      {/* Account Summary */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Icon className="h-8 w-8 text-primary" />
            </div>

            <div className="flex-1">
              <CardTitle className="text-2xl">{account.name}</CardTitle>
              <p className="text-muted-foreground">{account.type}</p>

              {account.institutionName && (
                <p className="text-sm text-muted-foreground mt-1">
                  {account.institutionName}
                </p>
              )}

              {account.accountNumber && (
                <p className="text-sm font-mono text-muted-foreground">
                  ••••{account.accountNumber.slice(-4)}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">
                Current Balance
              </p>
              <p className="text-3xl font-bold text-primary">
                {account.currency || "KES"}{" "}
                {account.balance.toFixed(2)}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Income / Expense Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card border-accent/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowUpCircle className="h-4 w-4" />
              <span className="text-sm">Total Income</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-accent">
              {account.currency || "KES"} {totalIncome.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-destructive/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowDownCircle className="h-4 w-4" />
              <span className="text-sm">Total Expenses</span>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              {account.currency || "KES"} {totalExpense.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No transactions for this account yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-lg glass hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        t.type === "income"
                          ? "bg-accent/10 text-accent"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {t.type === "income" ? (
                        <ArrowUpCircle className="h-4 w-4" />
                      ) : (
                        <ArrowDownCircle className="h-4 w-4" />
                      )}
                    </div>

                    <div>
                      <p className="font-medium">{t.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {t.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(t.date), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>

                  <p
                    className={`text-lg font-semibold ${
                      t.type === "income"
                        ? "text-accent"
                        : "text-destructive"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {account.currency || "KES"} {t.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}