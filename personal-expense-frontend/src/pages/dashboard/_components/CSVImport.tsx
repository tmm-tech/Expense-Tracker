import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

/* =========================
   Types
========================= */

type ImportType = "transactions" | "budgets" | "investments";

interface ImportResult {
  imported: number;
  total: number;
  errors: string[];
}

/* =========================
   Component
========================= */

export function CSVImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importType, setImportType] = useState<ImportType | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: ImportType
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate CSV
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      event.target.value = "";
      return;
    }

    setIsImporting(true);
    setImportType(type);
    setResult(null);

    try {
      const csvContent = await file.text();

      const importResult = await apiFetch<ImportResult>(
        `/api/import/${type}`,
        {
          method: "POST",
          body: JSON.stringify({ csvContent }),
        }
      );

      setResult(importResult);

      if (importResult.imported > 0) {
        toast.success(
          `Successfully imported ${importResult.imported} ${type}`
        );
      }

      if (importResult.errors.length > 0) {
        toast.warning(
          `${importResult.errors.length} rows had errors`
        );
      }
    } catch (error) {
      toast.error(
        `Import failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <ImportCard
        title="Import Transactions"
        description={
          <>
            Upload CSV with columns: Date, Type, Category, Amount, Description
            <br />
            <span className="text-xs">
              Date: yyyy-mm-dd, Type: income or expense
            </span>
          </>
        }
        type="transactions"
        isImporting={isImporting}
        importType={importType}
        onFileChange={handleFileChange}
        result={result}
      />

      <ImportCard
        title="Import Budgets"
        description={
          <>
            Upload CSV with columns: Category, Limit, Period, Start Date
            <br />
            <span className="text-xs">
              Period: weekly, monthly, yearly
            </span>
          </>
        }
        type="budgets"
        isImporting={isImporting}
        importType={importType}
        onFileChange={handleFileChange}
        result={result}
      />

      <ImportCard
        title="Import Investments"
        description={
          <>
            Upload CSV with columns: Type, Name, Symbol, Quantity, Purchase Price,
            Current Price, Purchase Date
            <br />
            <span className="text-xs">
              Type: Stocks, Bonds, Crypto, Real Estate, ETFs, etc.
            </span>
          </>
        }
        type="investments"
        isImporting={isImporting}
        importType={importType}
        onFileChange={handleFileChange}
        result={result}
      />
    </div>
  );
}

/* =========================
   Sub Components
========================= */

function ImportCard({
  title,
  description,
  type,
  isImporting,
  importType,
  onFileChange,
  result,
}: {
  title: string;
  description: React.ReactNode;
  type: ImportType;
  isImporting: boolean;
  importType: ImportType | null;
  onFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: ImportType
  ) => void;
  result: ImportResult | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept=".csv"
            onChange={(e) => onFileChange(e, type)}
            disabled={isImporting && importType === type}
            className="flex-1"
          />
          <Upload className="w-4 h-4 text-muted-foreground" />
        </div>

        {isImporting && importType === type && (
          <p className="text-sm text-muted-foreground">
            Importing {type}...
          </p>
        )}

        {result && importType === type && (
          <ImportResultView result={result} />
        )}
      </CardContent>
    </Card>
  );
}

function ImportResultView({ result }: { result: ImportResult }) {
  return (
    <div className="space-y-3">
      <div className="rounded border border-accent bg-accent/10 p-3">
        <div className="flex items-center gap-2 text-sm font-medium text-accent">
          <CheckCircle className="h-4 w-4" />
          Imported {result.imported} of {result.total}
        </div>
      </div>

      {result.errors.length > 0 && (
        <div className="rounded border border-destructive bg-destructive/10 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4" />
            Errors ({result.errors.length})
          </div>
          <div className="max-h-40 space-y-1 overflow-y-auto">
            {result.errors.slice(0, 10).map((err, i) => (
              <p key={i} className="text-xs text-destructive">
                {err}
              </p>
            ))}
            {result.errors.length > 10 && (
              <p className="text-xs text-muted-foreground">
                …and {result.errors.length - 10} more
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}