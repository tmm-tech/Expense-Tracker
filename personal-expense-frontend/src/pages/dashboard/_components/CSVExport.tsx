import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Download } from "lucide-react";
import Papa from "papaparse";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export function CSVExport() {
  const transactions = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await fetch("/api/transactions");
        if (!response.ok) {
            throw new Error("Failed to fetch transactions");
        }
        return response.json();
    },
  });
  const budgets = useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const response = await fetch("/api/budgets");
        if (!response.ok) {
            throw new Error("Failed to fetch budgets");
        }
        return response.json();
    },
  });
  const investments = useQuery({
    queryKey: ["investments"],
    queryFn: async () => {
      const response = await fetch("/api/investments");
        if (!response.ok) {
            throw new Error("Failed to fetch investments");
        }
        return response.json();
    },
  });

  const exportTransactions = () => {
    if (!transactions.data || transactions.data.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    const exportData = transactions.data.map((t: any) => ({
      Date: format(t.date, "yyyy-MM-dd"),
      Type: t.type,
      Category: t.category,
      Amount: t.amount,
      Description: t.description,
    }));

    const csv = Papa.unparse(exportData);
    downloadCSV(csv, `transactions-${format(new Date(), "yyyy-MM-dd")}.csv`);
    toast.success("Transactions exported successfully");
  };

  const exportBudgets = () => {
    if (!budgets.data || budgets.data.length === 0) {
      toast.error("No budgets to export");
      return;
    }

    const exportData = budgets.data.map((b: any) => ({
      Category: b.category,
      Limit: b.limit,
      Period: b.period,
      "Start Date": format(b.startDate, "yyyy-MM-dd"),
    }));

    const csv = Papa.unparse(exportData);
    downloadCSV(csv, `budgets-${format(new Date(), "yyyy-MM-dd")}.csv`);
    toast.success("Budgets exported successfully");
  };

  const exportInvestments = () => {
    if (!investments.data || investments.data.length === 0) {
      toast.error("No investments to export");
      return;
    }

    const exportData = investments.data.map((i: any) => ({
      Type: i.type,
      Name: i.name,
      Symbol: i.symbol || "",
      Quantity: i.quantity,
      "Purchase Price": i.purchasePrice,
      "Current Price": i.currentPrice,
      "Purchase Date": format(i.purchaseDate, "yyyy-MM-dd"),
    }));

    const csv = Papa.unparse(exportData);
    downloadCSV(csv, `investments-${format(new Date(), "yyyy-MM-dd")}.csv`);
    toast.success("Investments exported successfully");
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Export Transactions</CardTitle>
          <CardDescription>
            Download all your transactions as a CSV file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={exportTransactions} className="gap-2" disabled={!transactions.data}>
            <Download className="w-4 h-4" />
            Export Transactions ({transactions.data?.length || 0} records)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Budgets</CardTitle>
          <CardDescription>
            Download all your budgets as a CSV file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={exportBudgets} className="gap-2" disabled={!budgets.data}>
            <Download className="w-4 h-4" />
            Export Budgets ({budgets.data?.length || 0} records)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Investments</CardTitle>
          <CardDescription>
            Download all your investments as a CSV file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={exportInvestments} className="gap-2" disabled={!investments.data}>
            <Download className="w-4 h-4" />
            Export Investments ({investments.data?.length || 0} records)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}