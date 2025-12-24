import { format } from "date-fns";
import {
  CreditCardIcon,
  AlertCircleIcon,
  TrendingDownIcon,
  MoreVerticalIcon,
  Trash2Icon,
  EditIcon,
  DollarSignIcon,
  CheckCircle2Icon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import type { Debt } from "@/types/debt.ts";
import type { Account } from "@/types/account.ts";

interface DebtListProps {
  debts: Debt[];
  accounts: Account[];
  summary: {
    totalDebt: number;
    totalMinimumPayment: number;
    totalPaidOff: number;
    numberOfDebts: number;
    averageInterestRate: number;
  };
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => void;
  onMakePayment: (debt: Debt) => void;
  onViewDetails: (debt: Debt) => void;
}

export default function DebtList({
  debts,
  accounts,
  summary,
  onEdit,
  onDelete,
  onMakePayment,
  onViewDetails,
}: DebtListProps) {
  if (debts.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CreditCardIcon />
          </EmptyMedia>
          <EmptyTitle>No debts tracked</EmptyTitle>
          <EmptyDescription>
            Add a debt to start tracking and planning your payoff strategy
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const getAccount = (accountId?: string): Account | undefined => {
    return accounts.find((a) => a.id === accountId);
  };

  const getStatusBadge = (debt: Debt) => {
    if (debt.status === "paid-off") {
      return (
        <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400">
          <CheckCircle2Icon className="mr-1 h-3 w-3" />
          Paid Off
        </Badge>
      );
    }
    if (debt.status === "defaulted") {
      return (
        <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-400">
          <AlertCircleIcon className="mr-1 h-3 w-3" />
          Defaulted
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400">
        Active
      </Badge>
    );
  };

  const calculateProgress = (debt: Debt) => {
    const paid = debt.originalAmount - debt.currentBalance;
    return (paid / debt.originalAmount) * 100;
  };

  const activeDebts = debts.filter((d) => d.status === "active");
  const paidOffDebts = debts.filter((d) => d.status === "paid-off");

  const renderDebtCard = (debt: Debt) => {
    const account = getAccount(debt.accountId);
    const progress = calculateProgress(debt);

    return (
      <Card
        key={debt.id}
        className="glass-card cursor-pointer hover:border-primary/40 transition-colors"
        onClick={() => onViewDetails(debt)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{debt.name}</CardTitle>
              <CardDescription className="mt-1 flex items-center gap-2">
                <span>{debt.type}</span>
                <span>•</span>
                <span>{debt.creditor}</span>
                {account && (
                  <>
                    <span>•</span>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: account.color || undefined,
                        backgroundColor: account.color
                          ? `${account.color}20`
                          : undefined,
                      }}
                    >
                      {account.name}
                    </Badge>
                  </>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(debt)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass">
                  {debt.status === "active" && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onMakePayment(debt);
                      }}
                    >
                      <DollarSignIcon className="mr-2 h-4 w-4" />
                      Make Payment
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(debt);
                    }}
                  >
                    <EditIcon className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(debt.id);
                    }}
                    className="text-red-400"
                  >
                    <Trash2Icon className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-2xl font-bold">KES {debt.currentBalance.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">
                of KES {debt.originalAmount.toFixed(2)}
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                {debt.interestRate.toFixed(2)}% APR
              </div>
              <div className="text-xs text-muted-foreground">
                Min: KES {debt.minimumPayment.toFixed(2)}/mo
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress.toFixed(1)}% paid</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Due day: {debt.dueDay}</span>
            {debt.notes && (
              <>
                <span>•</span>
                <span className="truncate">{debt.notes}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-red-500/20">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <AlertCircleIcon className="h-4 w-4" />
              Total Debt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold text-red-400">
              KES {summary.totalDebt.toFixed(2)}
            </CardTitle>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/20">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CreditCardIcon className="h-4 w-4" />
              Active Debts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold text-blue-400">
              {summary.numberOfDebts}
            </CardTitle>
          </CardContent>
        </Card>

        <Card className="glass-card border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <DollarSignIcon className="h-4 w-4" />
              Min Payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold text-yellow-400">
              KES {summary.totalMinimumPayment.toFixed(2)}
            </CardTitle>
          </CardContent>
        </Card>

        <Card className="glass-card border-green-500/20">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingDownIcon className="h-4 w-4" />
              Paid Off
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold text-green-400">
              KES {summary.totalPaidOff.toFixed(2)}
            </CardTitle>
          </CardContent>
        </Card>
      </div>

      {/* Active Debts */}
      {activeDebts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Active Debts</h3>
            <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400">
              {activeDebts.length}
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeDebts.map(renderDebtCard)}
          </div>
        </div>
      )}

      {/* Paid Off Debts */}
      {paidOffDebts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Paid Off</h3>
            <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400">
              {paidOffDebts.length}
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paidOffDebts.map(renderDebtCard)}
          </div>
        </div>
      )}
    </div>
  );
}