import { format } from "date-fns";
import {
  CalendarIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  MoreVerticalIcon,
  Trash2Icon,
  EditIcon,
  CheckIcon,
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
import type { Bill } from "@/types/bill.ts";
import type { Account } from "@/types/account.ts";

interface BillListProps {
  bills: Bill[];
  accounts: Account[];
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onMarkPaid: (id: string) => void;
}

export default function BillList({
  bills,
  accounts,
  onEdit,
  onDelete,
  onMarkPaid,
}: BillListProps) {
  if (bills.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarIcon />
          </EmptyMedia>
          <EmptyTitle>No bills yet</EmptyTitle>
          <EmptyDescription>
            Create your first bill to start tracking payments
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const getAccount = (accountId?: string): Account | undefined => {
    return accounts.find((a) => a.id === accountId);
  };

  const getStatusBadge = (bill: Bill) => {
    const now = Date.now();
    const daysUntilDue = Math.ceil((bill.dueDate - now) / (1000 * 60 * 60 * 24));

    if (bill.status === "paid") {
      return (
        <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400">
          <CheckCircle2Icon className="mr-1 h-3 w-3" />
          Paid
        </Badge>
      );
    }

    if (bill.status === "overdue" || (bill.status === "pending" && bill.dueDate < now)) {
      return (
        <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-400">
          <AlertCircleIcon className="mr-1 h-3 w-3" />
          Overdue
        </Badge>
      );
    }

    if (daysUntilDue <= bill.reminderDays) {
      return (
        <Badge variant="outline" className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
          <CalendarIcon className="mr-1 h-3 w-3" />
          Due soon
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400">
        Pending
      </Badge>
    );
  };

  const getFrequencyLabel = (frequency: Bill["frequency"]) => {
    const labels = {
      "one-time": "One-time",
      weekly: "Weekly",
      monthly: "Monthly",
      quarterly: "Quarterly",
      yearly: "Yearly",
    };
    return labels[frequency];
  };

  // Group bills by status
  const upcomingBills = bills.filter(
    (b) => b.status === "pending" && b.dueDate >= Date.now()
  );
  const overdueBills = bills.filter(
    (b) => b.status === "overdue" || (b.status === "pending" && b.dueDate < Date.now())
  );
  const paidBills = bills.filter((b) => b.status === "paid");

  const renderBillCard = (bill: Bill) => {
    const account = getAccount(bill.accountId);

    return (
      <Card key={bill.id} className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{bill.name}</CardTitle>
              <CardDescription className="mt-1 flex items-center gap-2">
                <span>{bill.category}</span>
                <span>•</span>
                <span>{getFrequencyLabel(bill.frequency)}</span>
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
              {getStatusBadge(bill)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass">
                  {bill.status !== "paid" && (
                    <DropdownMenuItem onClick={() => onMarkPaid(bill.id)}>
                      <CheckIcon className="mr-2 h-4 w-4" />
                      Mark as Paid
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onEdit(bill)}>
                    <EditIcon className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(bill.id)}
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
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-2xl font-bold">KES {bill.amount.toFixed(2)}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>Due: {format(bill.dueDate, "MMM dd, yyyy")}</span>
              </div>
              {bill.reminderDays > 0 && (
                <div className="text-xs text-muted-foreground">
                  Reminder: {bill.reminderDays} days before
                </div>
              )}
              {bill.autoPayEnabled && (
                <Badge variant="outline" className="text-xs">
                  Auto-pay enabled
                </Badge>
              )}
            </div>
          </div>
          {bill.notes && (
            <div className="mt-3 text-sm text-muted-foreground">
              {bill.notes}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {overdueBills.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-red-400">
              Overdue Bills
            </h3>
            <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-400">
              {overdueBills.length}
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {overdueBills.map(renderBillCard)}
          </div>
        </div>
      )}

      {upcomingBills.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Upcoming Bills</h3>
            <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400">
              {upcomingBills.length}
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingBills.map(renderBillCard)}
          </div>
        </div>
      )}

      {paidBills.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Paid Bills</h3>
            <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400">
              {paidBills.length}
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paidBills.map(renderBillCard)}
          </div>
        </div>
      )}
    </div>
  );
}