import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, X, Calendar, DollarSign, Tag, Filter } from "lucide-react";
import {
  startOfWeek,
  startOfMonth,
  subDays,
  startOfDay,
  endOfDay,
} from "date-fns";
import type { Transaction } from "@/types/transaction";
import type { Account } from "@/types/account";
import type { Category } from "@/types/category";

/* ---------------- TYPES ---------------- */

interface TransactionFiltersProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  onFilteredTransactionsChange: (filtered: Transaction[]) => void;
}

type DatePreset = "all" | "today" | "week" | "month" | "30days" | "custom";

/* ---------------- COMPONENT ---------------- */

export default function TransactionFilters({
  transactions,
  accounts,
  categories,
  onFilteredTransactionsChange,
}: TransactionFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [selectedType, setSelectedType] = useState<
    "all" | "income" | "expense"
  >("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  /* --------- Derived values --------- */

  useEffect(() => {
    let filtered = [...transactions];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((t) =>
        t.description?.toLowerCase().includes(q),
      );
    }

    if (datePreset !== "all") {
      let startDate = 0;
      let endDate = Date.now();

      switch (datePreset) {
        case "today":
          startDate = startOfDay(new Date()).getTime();
          endDate = endOfDay(new Date()).getTime();
          break;
        case "week":
          startDate = startOfWeek(new Date()).getTime();
          break;
        case "month":
          startDate = startOfMonth(new Date()).getTime();
          break;
        case "30days":
          startDate = subDays(new Date(), 30).getTime();
          break;
        case "custom":
          if (customStartDate) {
            startDate = new Date(customStartDate).getTime();
          }
          if (customEndDate) {
            endDate = endOfDay(new Date(customEndDate)).getTime();
          }
          break;
      }

      filtered = filtered.filter((t) => {
        const txDate =
          typeof t.date === "string" ? new Date(t.date).getTime() : t.date;
        return txDate >= startDate && txDate <= endDate;
      });
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((t) => t.type === selectedType);
    }

    if (selectedCategory !== "all") {
      filtered =
        selectedCategory === "none"
          ? filtered.filter((t) => !t.categoryId)
          : filtered.filter((t) => t.categoryId === selectedCategory);
    }

    if (selectedAccount !== "all") {
      filtered =
        selectedAccount === "none"
          ? filtered.filter((t) => !t.accountId)
          : filtered.filter((t) => t.accountId === selectedAccount);
    }

    if (minAmount) {
      const min = Number(minAmount);
      if (!Number.isNaN(min)) {
        filtered = filtered.filter((t) => t.amount >= min);
      }
    }

    if (maxAmount) {
      const max = Number(maxAmount);
      if (!Number.isNaN(max)) {
        filtered = filtered.filter((t) => t.amount <= max);
      }
    }

    onFilteredTransactionsChange(filtered);
  }, [
    searchQuery,
    datePreset,
    customStartDate,
    customEndDate,
    selectedType,
    selectedCategory,
    selectedAccount,
    minAmount,
    maxAmount,
    transactions,
    onFilteredTransactionsChange,
  ]);

  /* ---------------- CLEAR ---------------- */

  const clearFilters = () => {
    setSearchQuery("");
    setDatePreset("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setSelectedType("all");
    setSelectedCategory("all");
    setSelectedAccount("all");
    setMinAmount("");
    setMaxAmount("");
    onFilteredTransactionsChange(transactions);
  };

  const hasActiveFilters =
    searchQuery ||
    datePreset !== "all" ||
    selectedType !== "all" ||
    selectedCategory !== "all" ||
    selectedAccount !== "all" ||
    minAmount ||
    maxAmount;

  /* ---------------- UI ---------------- */

  return (
    <Card className="glass-card mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Transactions
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Description
          </Label>
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass"
          />
        </div>

        {/* Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </Label>
            <Select
              value={datePreset}
              onValueChange={(v) => setDatePreset(v as DatePreset)}
            >
              <SelectTrigger className="glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {datePreset === "custom" && (
            <>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="glass"
              />
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="glass"
              />
            </>
          )}
        </div>

        {/* Type / Category / Account */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            value={selectedType}
            onValueChange={(v) => setSelectedType(v as any)}
          >
            <SelectTrigger className="glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="none">No Category</SelectItem>
              {categories.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              <SelectItem value="none">No Account</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="number"
            placeholder="Min amount"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="glass"
          />
          <Input
            type="number"
            placeholder="Max amount"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="glass"
          />
        </div>
      </CardContent>
    </Card>
  );
}
