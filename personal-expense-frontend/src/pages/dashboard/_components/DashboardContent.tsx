import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import {
  Plus,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { TransactionList } from "./TransactionList.tsx";
import { TransactionDialog } from "./TransactionDialog.tsx";
import { BudgetList } from "./BudgetList.tsx";
import BudgetDialog from "./BudgetDialog.tsx";
import { InvestmentList } from "./InvestmentList.tsx";
import { InvestmentDialog } from "./InvestmentDialog.tsx";
import { RecurringTransactionList } from "./RecurringTransactionList.tsx";
import { RecurringTransactionDialog } from "./RecurringTransactionDialog.tsx";
import { GoalList } from "./GoalList.js";
import { GoalDialog } from "./GoalDialog.tsx";
import { CategoryList } from "./CategoryList.tsx";
import { CategoryDialog } from "./CategoryDialog.tsx";
import { InsightsView } from "./InsightsView.tsx";
import { ReportsView } from "./ReportsView.tsx";
import { CSVExport } from "./CSVExport.tsx";
import { CSVImport } from "./CSVImport.tsx";
import { AIInsights } from "./AIInsights.tsx";
import SettingsView from "./SettingsView.tsx";
import AccountList from "./AccountList.tsx";
import AccountDialog from "./AccountDialog.tsx";
import CurrencyView from "../CurrencyView.tsx";
import AccountDetailView from "./AccountDetailView.tsx";
import TransactionFilters from "./TransactionFilters.tsx";
import BillList from "./BillList.tsx";
import BillDialog from "./BillDialog.tsx";
import DebtList from "./DebtList.tsx";
import DebtDialog from "./DebtDialog.tsx";
import PaymentDialog from "./PaymentDialog.tsx";
import DebtDetailView from "./DebtDetailView.tsx";
import NetWorthView from "./NetWorthView.tsx";
import CalendarView from "./CalendarView.tsx";
import EnhancedExport from "./EnhancedExport.tsx";
import { SavingsChallengesView } from "../SavingsChallenge.tsx";
import { AlertsView } from "../AlertsView.tsx";
import { AlertsBell } from "./AlertsBell.tsx";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api.ts";
import type { Account } from "@/types/account.ts";
import type { Bill } from "@/types/bill";
import type { Debt } from "@/types/debt";
import type { Budget } from "@/types/budget";
import type { Goal } from "@/types/goal";
import type { Category } from "@/types/category";
import type { Investment } from "@/types/investment";
import type { Transaction } from "@/types/transaction";
import { UserMenu } from "./UserMenu.tsx";
import { API_BASE_URL } from "@/lib/config";

export function DashboardContent() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    isError: transactionsError,
  } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await apiFetch<ApiResponse<Transaction>>(`/transactions`);
      return res.data ?? [];
    },
    retry: false,
  });

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await apiFetch<ApiResponse<Account>>(`/accounts`);
      return res.data ?? [];
    },
  });

  const { data: bills = [] } = useQuery<Bill[]>({
    queryKey: ["bills"],
    queryFn: async () => {
      const res = await apiFetch<ApiResponse<Bill>>(`/bills`);
      return res.data ?? [];
    },
  });

  const { data: debts = [] } = useQuery<Debt[]>({
    queryKey: ["debts"],
    queryFn: async () => {
      const res = await apiFetch<ApiResponse<Debt>>(`/debts`);
      return res.data ?? [];
    },
  });

  const { data: budgets = [] } = useQuery<Budget[]>({
    queryKey: ["budgets"],
    queryFn: async () => {
      const res = await apiFetch<ApiResponse<Budget>>(`/budgets`);
      return res.data ?? [];
    },
  });
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await apiFetch<ApiResponse<Goal>>(`/goals`);
      return res.data ?? [];
    },
  });
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiFetch<ApiResponse<Category>>(`/categories`);
      return res.data ?? [];
    },
  });
  const { data: investments = [] } = useQuery<Investment[]>({
    queryKey: ["investments"],
    queryFn: async () => {
      const res = await apiFetch<ApiResponse<Investment>>(`/investments`);
      return res.data ?? [];
    },
  });

  const deleteBill = useMutation({
    mutationFn: (id: string) => apiFetch(`/bills/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
  });

  const markBillAsPaid = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/bills/${id}/pay`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
  });
  const deleteDebt = useMutation({
    mutationFn: (id: string) => apiFetch(`/debts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });

  const debtSummary = debts.reduce(
    (summary, debt) => {
      summary.totalDebt += debt.originalAmount;
      summary.totalPaidOff += debt.originalAmount - debt.currentBalance;
      summary.totalMinimumPayment += debt.minimumPayment;
      summary.numberOfDebts += 1;
      summary.totalInterestRate += debt.interestRate;

      return summary;
    },
    {
      totalDebt: 0,
      totalPaidOff: 0,
      totalMinimumPayment: 0,
      numberOfDebts: 0,
      totalInterestRate: 0,
    },
  );

  // derive average interest rate safely
  const finalizedDebtSummary = {
    totalDebt: debtSummary.totalDebt,
    totalPaidOff: debtSummary.totalPaidOff,
    totalMinimumPayment: debtSummary.totalMinimumPayment,
    numberOfDebts: debtSummary.numberOfDebts,
    averageInterestRate:
      debtSummary.numberOfDebts > 0
        ? debtSummary.totalInterestRate / debtSummary.numberOfDebts
        : 0,
  };

  const runAllChecks = useMutation({
    mutationFn: () => apiFetch(`/alerts/run-checks`, { method: "POST" }),
  });

  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [isInvestmentDialogOpen, setIsInvestmentDialogOpen] = useState(false);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isBillDialogOpen, setIsBillDialogOpen] = useState(false);
  const [isDebtDialogOpen, setIsDebtDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [editingTransactionId, setEditingTransactionId] = useState<
    string | null
  >(null);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editingInvestmentId, setEditingInvestmentId] = useState<string | null>(
    null,
  );
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [selectedDebtForPayment, setSelectedDebtForPayment] =
    useState<Debt | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[] | null
  >(null);

  useEffect(() => {
    if (!transactions.length) return;

    runAllChecks.mutate();

    const interval = setInterval(
      () => {
        runAllChecks.mutate();
      },
      15 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [transactions.length]);

  if (transactionsLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-12 w-64 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const handleEditTransaction = (id: string) => {
    setEditingTransactionId(id);
    setIsTransactionDialogOpen(true);
  };

  const handleEditBudget = (id: string) => {
    setEditingBudgetId(id);
    setIsBudgetDialogOpen(true);
  };

  const handleEditInvestment = (id: string) => {
    setEditingInvestmentId(id);
    setIsInvestmentDialogOpen(true);
  };

  const handleEditGoal = (id: string) => {
    setEditingGoalId(id);
    setIsGoalDialogOpen(true);
  };

  const handleEditCategory = (id: string) => {
    setEditingCategoryId(id);
    setIsCategoryDialogOpen(true);
  };

  const handleCloseTransactionDialog = () => {
    setIsTransactionDialogOpen(false);
    setEditingTransactionId(null);
  };

  const handleCloseBudgetDialog = () => {
    setIsBudgetDialogOpen(false);
    setEditingBudgetId(null);
  };

  const handleCloseInvestmentDialog = () => {
    setIsInvestmentDialogOpen(false);
    setEditingInvestmentId(null);
  };

  const handleCloseGoalDialog = () => {
    setIsGoalDialogOpen(false);
    setEditingGoalId(null);
  };

  const handleCloseCategoryDialog = () => {
    setIsCategoryDialogOpen(false);
    setEditingCategoryId(null);
  };

  const handleEditAccount = (id: string) => {
    setEditingAccountId(id);
    setIsAccountDialogOpen(true);
  };

  const handleCloseAccountDialog = () => {
    setIsAccountDialogOpen(false);
    setEditingAccountId(null);
  };

  const handleSelectAccount = (id: string) => {
    setSelectedAccountId(id);
  };

  const handleBackFromAccount = () => {
    setSelectedAccountId(null);
  };

  const handleEditBill = (bill: any) => {
    setEditingBillId(bill.id);
    setIsBillDialogOpen(true);
  };

  const handleCloseBillDialog = () => {
    setIsBillDialogOpen(false);
    setEditingBillId(null);
  };

  const handleDeleteBill = async (id: string) => {
    try {
      await deleteBill.mutate(id);
    } catch (error) {
      console.error("Failed to delete bill:", error);
    }
  };

  const handleMarkBillPaid = async (id: string) => {
    try {
      await markBillAsPaid.mutate(id);
    } catch (error) {
      console.error("Failed to mark bill as paid:", error);
    }
  };

  const handleEditDebt = (debt: any) => {
    setEditingDebtId(debt.id);
    setIsDebtDialogOpen(true);
  };

  const handleCloseDebtDialog = () => {
    setIsDebtDialogOpen(false);
    setEditingDebtId(null);
  };

  const handleDeleteDebt = async (id: string) => {
    try {
      await deleteDebt.mutate(id);
    } catch (error) {
      console.error("Failed to delete debt:", error);
    }
  };

  const handleMakePayment = (debt: any) => {
    setSelectedDebtForPayment(debt);
    setIsPaymentDialogOpen(true);
  };

  const handleClosePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    setSelectedDebtForPayment(null);
  };

  const handleViewDebtDetails = (debt: any) => {
    setSelectedDebtId(debt.id);
  };

  const handleBackFromDebt = () => {
    setSelectedDebtId(null);
  };

  const getAddButtonText = () => {
    switch (activeTab) {
      case "transactions":
        return "Transaction";
      case "budgets":
        return "Budget";
      case "investments":
        return "Investment";
      case "recurring":
        return "Recurring";
      case "goals":
        return "Goal";
      case "categories":
        return "Category";
      case "accounts":
        return "Account";
      case "bills":
        return "Bill";
      case "debts":
        return "Debt";
      default:
        return null;
    }
  };

  const handleAddClick = () => {
    switch (activeTab) {
      case "transactions":
        setIsTransactionDialogOpen(true);
        break;
      case "budgets":
        setIsBudgetDialogOpen(true);
        break;
      case "investments":
        setIsInvestmentDialogOpen(true);
        break;
      case "recurring":
        setIsRecurringDialogOpen(true);
        break;
      case "goals":
        setIsGoalDialogOpen(true);
        break;
      case "categories":
        setIsCategoryDialogOpen(true);
        break;
      case "accounts":
        setIsAccountDialogOpen(true);
        break;
      case "bills":
        setIsBillDialogOpen(true);
        break;
      case "debts":
        setIsDebtDialogOpen(true);
        break;
    }
  };

  const addButtonText = getAddButtonText();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-strong border-b border-border/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex justify-between items-center gap-3">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg sm:text-xl">Aurex</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertsBell />
            {addButtonText && (
              <Button
                onClick={handleAddClick}
                className="gap-2 text-xs sm:text-sm"
                size="sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Add</span> {addButtonText}
              </Button>
            )}
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="glass-card border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
            <CardHeader className="pb-2 sm:pb-3 relative z-10">
              <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                Net Balance
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">
                KES {balance.toFixed(2)}
              </CardTitle>
            </CardContent>
          </Card>

          <Card className="glass-card border-accent/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
            <CardHeader className="pb-2 sm:pb-3 relative z-10">
              <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
                <ArrowUpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                Total Income
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-accent">
                KES {totalIncome.toFixed(2)}
              </CardTitle>
            </CardContent>
          </Card>

          <Card className="glass-card border-destructive/20 relative overflow-hidden sm:col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-transparent" />
            <CardHeader className="pb-2 sm:pb-3 relative z-10">
              <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
                <ArrowDownCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                Total Expenses
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-destructive">
                KES {totalExpense.toFixed(2)}
              </CardTitle>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="w-full overflow-x-auto -mx-3 sm:-mx-4 lg:-mx-6 px-3 sm:px-4 lg:px-6 scrollbar-thin">
            <TabsList className="inline-flex w-auto min-w-full h-auto">
              <TabsTrigger
                value="overview"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2"
              >
                Calendar
              </TabsTrigger>
              <TabsTrigger
                value="accounts"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2"
              >
                Accounts
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2"
              >
                Transactions
              </TabsTrigger>
              <TabsTrigger
                value="recurring"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2 hidden sm:inline-flex"
              >
                Recurring
              </TabsTrigger>
              <TabsTrigger
                value="bills"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2"
              >
                Bills
              </TabsTrigger>
              <TabsTrigger
                value="debts"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2"
              >
                Debts
              </TabsTrigger>
              <TabsTrigger
                value="budgets"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2"
              >
                Budgets
              </TabsTrigger>
              <TabsTrigger
                value="goals"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2"
              >
                Goals
              </TabsTrigger>
              <TabsTrigger
                value="challenges"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2"
              >
                Challenges
              </TabsTrigger>
              <TabsTrigger
                value="investments"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2 hidden md:inline-flex"
              >
                Investments
              </TabsTrigger>
              <TabsTrigger
                value="net-worth"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2 hidden lg:inline-flex"
              >
                Net Worth
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2 hidden lg:inline-flex"
              >
                Categories
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2 hidden lg:inline-flex"
              >
                Reports
              </TabsTrigger>
              <TabsTrigger
                value="ai-insights"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2"
              >
                AI
              </TabsTrigger>
              <TabsTrigger
                value="alerts"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2"
              >
                Alerts
              </TabsTrigger>
              <TabsTrigger
                value="import"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2 hidden xl:inline-flex"
              >
                Import
              </TabsTrigger>
              <TabsTrigger
                value="export"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2 hidden xl:inline-flex"
              >
                Export
              </TabsTrigger>
              <TabsTrigger
                value="currency"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2"
              >
                Currency
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2 hidden xl:inline-flex"
              >
                Settings
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview" className="mt-6">
            <InsightsView />
          </TabsContent>
          <TabsContent value="calendar" className="mt-6">
            <CalendarView />
          </TabsContent>
          <TabsContent value="accounts" className="mt-6">
            {selectedAccountId &&
            accounts.find((a) => a.id === selectedAccountId) ? (
              <AccountDetailView
                accountId={selectedAccountId}
                account={accounts.find((a) => a.id === selectedAccountId)!}
                onBack={handleBackFromAccount}
              />
            ) : (
              <AccountList
                accounts={accounts}
                onEdit={handleEditAccount}
                onSelect={handleSelectAccount}
              />
            )}
          </TabsContent>
          <TabsContent value="transactions" className="mt-6">
            <TransactionFilters
              transactions={transactions}
              accounts={accounts}
              onFilteredTransactionsChange={setFilteredTransactions}
            />

            {transactions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No transactions yet. Click <b>Add Transaction</b> to get
                started.
              </div>
            ) : (
              <TransactionList
                transactions={filteredTransactions || transactions}
                onEdit={handleEditTransaction}
                accounts={accounts}
              />
            )}
          </TabsContent>

          <TabsContent value="recurring" className="mt-6">
            <RecurringTransactionList />
          </TabsContent>
          <TabsContent value="bills" className="mt-6">
            {bills.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No transactions yet. Click <b>Add Bill</b> to get started.
              </div>
            ) : (
              <BillList
                bills={bills}
                accounts={accounts}
                onEdit={handleEditBill}
                onDelete={handleDeleteBill}
                onMarkPaid={handleMarkBillPaid}
              />
            )}
          </TabsContent>
          <TabsContent value="debts" className="mt-6">
            {selectedDebtId && debts.find((d) => d.id === selectedDebtId) ? (
              <DebtDetailView
                debt={debts.find((d) => d.id === selectedDebtId)!}
                onBack={handleBackFromDebt}
              />
            ) : (
              <DebtList
                debts={debts}
                accounts={accounts}
                summary={finalizedDebtSummary}
                onEdit={handleEditDebt}
                onDelete={handleDeleteDebt}
                onMakePayment={handleMakePayment}
                onViewDetails={handleViewDebtDetails}
              />
            )}
          </TabsContent>
          <TabsContent value="budgets" className="mt-6">
            <BudgetList budgets={budgets} onEdit={handleEditBudget} />
          </TabsContent>
          <TabsContent value="goals" className="mt-6">
            <GoalList
              goals={goals}
              onEdit={handleEditGoal}
              onRefresh={function (): void {
                throw new Error("Function not implemented.");
              }}
            />
          </TabsContent>
          <TabsContent value="challenges" className="mt-6">
            <SavingsChallengesView />
          </TabsContent>
          <TabsContent value="investments" className="mt-6">
            <InvestmentList
              investments={investments}
              onEdit={handleEditInvestment}
            />
          </TabsContent>
          <TabsContent value="net-worth" className="mt-6">
            <NetWorthView />
          </TabsContent>
          <TabsContent value="categories" className="mt-6">
            <CategoryList categories={categories} onEdit={handleEditCategory} />
          </TabsContent>
          <TabsContent value="reports" className="mt-6">
            <ReportsView />
          </TabsContent>
          <TabsContent value="ai-insights" className="mt-6">
            <AIInsights />
          </TabsContent>
          <TabsContent value="alerts" className="mt-6">
            <AlertsView />
          </TabsContent>
          <TabsContent value="import" className="mt-6">
            <CSVImport />
          </TabsContent>
          <TabsContent value="export" className="mt-6">
            <EnhancedExport />
          </TabsContent>
          <TabsContent value="currency" className="mt-6">
            <CurrencyView />
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <SettingsView />
          </TabsContent>
        </Tabs>
      </div>

      {/* Transaction Dialog */}
      <TransactionDialog
        open={isTransactionDialogOpen}
        onOpenChange={handleCloseTransactionDialog}
        editingId={editingTransactionId}
        transactions={transactions}
        accounts={accounts}
      />

      {/* Budget Dialog */}
      <BudgetDialog
        open={isBudgetDialogOpen}
        onOpenChange={handleCloseBudgetDialog}
        editingId={editingBudgetId}
        budgets={budgets}
      />

      {/* Investment Dialog */}
      <InvestmentDialog
        open={isInvestmentDialogOpen}
        onOpenChange={handleCloseInvestmentDialog}
        editingId={editingInvestmentId}
        investments={investments}
      />

      {/* Recurring Transaction Dialog */}
      <RecurringTransactionDialog
        open={isRecurringDialogOpen}
        onOpenChange={setIsRecurringDialogOpen}
      />

      {/* Goal Dialog */}
      <GoalDialog
        open={isGoalDialogOpen}
        onOpenChange={handleCloseGoalDialog}
        editingId={editingGoalId}
        goals={goals}
        onSaved={function (): void {
          throw new Error("Function not implemented.");
        }}
      />

      {/* Category Dialog */}
      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={handleCloseCategoryDialog}
        editingId={editingCategoryId}
        categories={categories}
      />

      {/* Account Dialog */}
      <AccountDialog
        open={isAccountDialogOpen}
        onOpenChange={handleCloseAccountDialog}
        editingId={editingAccountId}
        accounts={accounts}
      />

      {/* Bill Dialog */}
      <BillDialog
        open={isBillDialogOpen}
        onClose={handleCloseBillDialog}
        bill={editingBillId ? bills.find((b) => b.id === editingBillId) : null}
        accounts={accounts}
      />

      {/* Debt Dialog */}
      <DebtDialog
        open={isDebtDialogOpen}
        onClose={handleCloseDebtDialog}
        debt={editingDebtId ? debts.find((d) => d.id === editingDebtId) : null}
        accounts={accounts}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        open={isPaymentDialogOpen}
        onClose={handleClosePaymentDialog}
        debt={selectedDebtForPayment}
      />
    </div>
  );
}

interface ApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
