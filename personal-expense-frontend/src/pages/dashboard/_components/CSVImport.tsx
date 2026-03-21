import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

import type { Account } from "@/types/account";
import type { Category } from "@/types/category";

/* ========================= */

interface ImportResult {
  imported: number;
  total: number;
  errors: string[];
}

interface CSVImportProps {
  accounts: Account[];
  categories: Category[];
}

/* ========================= */

export function CSVImport({ accounts, categories }: CSVImportProps) {
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!accountId) {
      toast.error("Please select account");
      return;
    }

    if (!file.name.endsWith(".csv")) {
      toast.error("Upload CSV file");
      return;
    }

    setIsImporting(true);
    setResult(null);

    try {
      const csvContent = await file.text();

      const res = await apiFetch<ImportResult>("/import/transactions", {
        method: "POST",
        body: JSON.stringify({
          accountId,
          defaultCategoryId: categoryId || null,
          csvContent,
        }),
      });

      setResult(res);

      toast.success(`Imported ${res.imported} transactions`);
    } catch (error) {
      toast.error("Import failed");
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Transactions</CardTitle>
        <CardDescription>
          Import MPESA, Bank, SACCO, MMF statements
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Account */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Account *
          </label>

          <Select
            value={accountId}
            onValueChange={(val) =>
              setAccountId(val === "none" ? "" : val)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="none">Select account</SelectItem>

              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category (Optional) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Default Category (optional)
          </label>

          <Select
            value={categoryId}
            onValueChange={(val) =>
              setCategoryId(val === "none" ? "" : val)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Auto detect category" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="none">
                Auto detect category
              </SelectItem>

              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name} ({cat.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File */}
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isImporting}
          />

          <Upload className="w-4 h-4 text-muted-foreground" />
        </div>

        {isImporting && (
          <p className="text-sm text-muted-foreground">
            Importing...
          </p>
        )}

        {result && <ImportResultView result={result} />}
      </CardContent>
    </Card>
  );
}

/* ========================= */

function ImportResultView({ result }: { result: ImportResult }) {
  return (
    <div className="space-y-3">
      <div className="rounded border border-accent bg-accent/10 p-3">
        <div className="flex items-center gap-2 text-sm text-accent">
          <CheckCircle className="w-4 h-4" />
          Imported {result.imported} of {result.total}
        </div>
      </div>

      {result.errors.length > 0 && (
        <div className="rounded border border-destructive bg-destructive/10 p-3">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            Errors ({result.errors.length})
          </div>

          {result.errors.map((err, i) => (
            <p key={i} className="text-xs text-destructive">
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}