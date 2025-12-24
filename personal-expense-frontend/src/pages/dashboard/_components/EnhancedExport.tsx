import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Download,
  FileJson,
  FileSpreadsheet,
  Database,
  CheckCircle2,
  Calendar,
  Package,
} from "lucide-react";
import Papa from "papaparse";

/* =========================
   Types
========================= */

type DataType =
  | "accounts"
  | "transactions"
  | "budgets"
  | "investments"
  | "recurringTransactions"
  | "goals"
  | "categories"
  | "bills"
  | "debts"
  | "debtPayments"
  | "netWorthSnapshots";

interface ExportResponse {
  exportDate: number;
  user: unknown;
  data: Record<DataType, unknown[]>;
  statistics: Record<string, number>;
}

/* =========================
   Component
========================= */

export default function EnhancedExport() {
  const [allData, setAllData] = useState<ExportResponse | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const [selectedTypes, setSelectedTypes] = useState<Record<DataType, boolean>>({
    accounts: true,
    transactions: true,
    budgets: true,
    investments: true,
    recurringTransactions: true,
    goals: true,
    categories: true,
    bills: true,
    debts: true,
    debtPayments: true,
    netWorthSnapshots: true,
  });

  /* -------------------------
     Load data
  -------------------------- */
  useEffect(() => {
    apiFetch<ExportResponse>("/api/backup")
      .then(setAllData)
      .catch(() => setAllData(null));
  }, []);

  if (!allData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const dataTypeLabels: Record<DataType, string> = {
    accounts: "Accounts",
    transactions: "Transactions",
    budgets: "Budgets",
    investments: "Investments",
    recurringTransactions: "Recurring Transactions",
    goals: "Goals",
    categories: "Categories",
    bills: "Bills",
    debts: "Debts",
    debtPayments: "Debt Payments",
    netWorthSnapshots: "Net Worth Snapshots",
  };

  const selectedCount = Object.values(selectedTypes).filter(Boolean).length;

  /* =========================
     Export Helpers
  ========================= */

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsJSON = () => {
    const data: Record<string, unknown[]> = {};
    Object.entries(selectedTypes).forEach(([k, v]) => {
      if (v) data[k] = allData.data[k as DataType];
    });

    triggerDownload(
      new Blob(
        [
          JSON.stringify(
            {
              exportDate: new Date(allData.exportDate).toISOString(),
              format: "JSON",
              data,
            },
            null,
            2
          ),
        ],
        { type: "application/json" }
      ),
      `aurex-export-${new Date().toISOString().split("T")[0]}.json`
    );

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const exportAsCSV = () => {
    Object.entries(selectedTypes).forEach(([type, enabled]) => {
      if (!enabled) return;

      const rows = allData.data[type as DataType];
      if (!rows?.length) return;

      const csv = Papa.unparse(rows as never[]);
      triggerDownload(
        new Blob([csv], { type: "text/csv" }),
        `aurex-${type}.csv`
      );
    });

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const exportFullBackup = () => {
    triggerDownload(
      new Blob(
        [
          JSON.stringify(
            {
              version: "1.0",
              exportDate: new Date(allData.exportDate).toISOString(),
              application: "Aurex Finance Tracker",
              data: allData.data,
              statistics: allData.statistics,
            },
            null,
            2
          ),
        ],
        { type: "application/json" }
      ),
      `aurex-full-backup-${new Date().toISOString().split("T")[0]}.json`
    );

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row gap-3">
          <Download className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Enhanced Data Export & Backup</CardTitle>
            <CardDescription>
              Export or back up your financial data securely
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {exportSuccess && (
        <Card className="border-green-500/50 bg-green-500/10">
          <CardContent className="pt-6 flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            Export completed successfully
          </CardContent>
        </Card>
      )}

      {/* Quick Export */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Export</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Button variant="outline" onClick={exportFullBackup}>
            <Database className="mr-2 h-4 w-4" /> Full Backup
          </Button>
          <Button variant="outline" onClick={exportAsJSON}>
            <FileJson className="mr-2 h-4 w-4" /> JSON Export
          </Button>
          <Button variant="outline" onClick={exportAsCSV}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> CSV Export
          </Button>
        </CardContent>
      </Card>

      {/* Custom Export */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Export</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {(Object.keys(dataTypeLabels) as DataType[]).map((type) => (
            <div key={type} className="flex items-center gap-3">
              <Checkbox
                checked={selectedTypes[type]}
                onCheckedChange={() =>
                  setSelectedTypes((p) => ({
                    ...p,
                    [type]: !p[type],
                  }))
                }
              />
              <Label>{dataTypeLabels[type]}</Label>
              {selectedTypes[type] && <Badge>Selected</Badge>}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button onClick={exportAsJSON} disabled={selectedCount === 0}>
          Export JSON
        </Button>
        <Button onClick={exportAsCSV} disabled={selectedCount === 0}>
          Export CSV
        </Button>
      </div>
    </div>
  );
}