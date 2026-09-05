"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Account } from "@/types/account";
import type { Category } from "@/types/category";
import { Progress } from "@/components/ui/progress";
import { TransactionCategoryDialog } from "./TransactionCategoryDialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/* ============================================================
   TYPES
============================================================ */

type CategoryConfidence =
  | "high"
  | "medium"
  | "low"
  | "none";

interface ImportResult {
  imported: number;
  skipped: number;
  duplicates: number;
  uncategorized: number;
  transfers: number;
  total: number;

  income: number;
  expenses: number;

  reconciliation: {
    performed: boolean;
    reconciled: boolean | null;
    startingBalance: number;
    calculatedClosing: number;
    statementClosing: number | null;
    difference: number | null;
  };

  account: {
    balance: number | null;
  };

  cleanup: {
    completed: boolean;
  };
}
interface ReconciliationResult {
  income: number;
  expenses: number;
  transfers: number;
  expectedClosing: number | null;
  difference: number | null;
  reconciled: boolean | null;
}

interface PreviewRow {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense" | "transfer";

  runningBalance?: number | null;
  categoryId?: string | null;
  categoryName?: string;

  categoryConfidence?: CategoryConfidence;

  needsCategoryReview?: boolean;
  needsTransferReview?: boolean;

  valid?: boolean;
  error?: string;

  duplicate?: boolean;

  originalRow?: number;

  // Transfer destination account
  isTransfer: boolean;

  transferAccountId: string | null;
  transferConfidence: "high" | "medium" | "low" | "none";
}

interface StatementBalance {
  openingBalance: number | null;
  closingBalance: number | null;
  currency: string;
}

interface PreviewResponse {
  success: boolean;

  data: {
    statement: StatementBalance | null;

    rows: PreviewRow[];
    accountId: string;

    totalRows?: number;
    categorizedRows?: number;
    uncategorizedRows?: number;
    failedChunks?: number[];
  };
}

/* ============================================================
   COMPONENT
============================================================ */

export function CSVImport({
  accounts,
  categories,
}: {
  accounts: Account[];
  categories: Category[];
}) {
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);

  const [preview, setPreview] = useState<PreviewRow[]>([]);

  const [accountId, setAccountId] = useState("");

  const [pdfPassword, setPdfPassword] = useState("");

  const [requiresPassword, setRequiresPassword] =
    useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryRowIndex, setCategoryRowIndex] = useState<number | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStage, setImportStage] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [analysisStage, setAnalysisStage] = useState(
    "Preparing your statement...",
  );
  const [statement, setStatement] =
    useState<StatementBalance | null>(null);

  const importSteps = [
    {
      id: "validate",
      label: "Validating transactions",
    },
    {
      id: "categories",
      label: "Processing categories",
    },
    {
      id: "duplicates",
      label: "Checking for duplicate transactions",
    },
    {
      id: "transfers",
      label: "Processing transfers",
    },
    {
      id: "reconciliation",
      label: "Reconciling account balance",
    },
    {
      id: "cleanup",
      label: "Completing import cleanup",
    },
  ];
  const analysisMessages = [
    "🔍 Looking for transactions...",
    "🧠 Understanding transaction descriptions...",
    "💰 Separating income from expenses...",
    "🏷️ Matching transactions to your categories...",
    "🧹 Checking for duplicate transactions...",
    "✨ Preparing your review...",
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  const openAddCategory = (index: number) => {
    setCategoryRowIndex(index);
    setCategoryDialogOpen(true);
  };

  useEffect(() => {
    if (!isAnalyzing) {
      setMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setAnalysisProgress((current) => {

        setMessageIndex((current) => {
          return (current + 1) % analysisMessages.length;
        });
        /*
         * Never visually reach 100% until
         * the backend actually responds.
         */
        if (current >= 92) {
          return current;
        }

        /*
         * Slow down as we approach completion.
         */
        if (current >= 80) {
          return current + 1;
        }

        return current + 2;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isAnalyzing]);
  /* ============================================================
     CATEGORY HELPERS
  ============================================================ */

  const findCategory = (categoryId?: string | null) => {
    if (!categoryId) return undefined;

    return categories.find(
      (category) => category.id === categoryId,
    );
  };

  /* ============================================================
     ACCOUNT  HELPERS
  ============================================================ */

  const getTransferAccounts = (currentAccountId: string) => {
    return accounts.filter(
      (account) => account.id !== currentAccountId
    );
  };

  /* ============================================================
     UPDATE CATEGORY
  ============================================================ */
  const updateType = (
    index: number,
    type: "income" | "expense" | "transfer",
  ) => {
    setPreview((current) =>
      current.map((row, i) => {
        if (i !== index) return row;

        const currentCategory = row.categoryId
          ? findCategory(row.categoryId)
          : undefined;

        const categoryStillValid =
          currentCategory?.type === type;

        return {
          ...row,
          type,

          categoryId:
            type === "transfer"
              ? undefined
              : categoryStillValid
                ? row.categoryId
                : undefined,

          categoryName:
            type === "transfer"
              ? undefined
              : categoryStillValid
                ? currentCategory?.name
                : undefined,

          categoryConfidence:
            type === "transfer"
              ? "none"
              : categoryStillValid
                ? row.categoryConfidence
                : "none",

          needsCategoryReview:
            type === "transfer"
              ? false
              : !categoryStillValid,

          transferAccountId:
            type === "transfer"
              ? row.transferAccountId ?? null
              : null,
        };
      }),
    );
  };

  const updateCategory = (
    index: number,
    categoryId: string,
  ) => {
    const category = findCategory(categoryId);

    setPreview((current) =>
      current.map((row, i) => {
        if (i !== index) return row;

        return {
          ...row,

          categoryId,

          categoryName: category?.name ?? "",

          categoryConfidence: "high",

          needsCategoryReview: false,

          error: undefined,
        };
      }),
    );
  };

  const handleCategoryCreated = (category: Category) => {
    if (categoryRowIndex === null) return;

    updateCategory(
      categoryRowIndex,
      category.id,
    );

    setCategoryDialogOpen(false);
    setCategoryRowIndex(null);

    queryClient.invalidateQueries({
      queryKey: ["categories"],
    });
  };
  /* ============================================================
     PREVIEW IMPORT
  ============================================================ */

  const previewImport = useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error("Select a file");
      }

      if (!accountId) {
        throw new Error("Select an account");
      }

      setIsAnalyzing(true);
      setMessageIndex(0);
      setAnalysisProgress(5);

      setAnalysisStage(
        file.type === "application/pdf"
          ? "Reading your PDF statement..."
          : "Reading your CSV statement...",
      );
      const formData = new FormData();

      formData.append("file", file);

      formData.append(
        "accountId",
        accountId,
      );

      const fileType =
        file.type === "application/pdf"
          ? "pdf"
          : "csv";

      formData.append(
        "fileType",
        fileType,
      );

      /*
       * Only send password when this is a PDF
       * and the user supplied one.
       */

      if (
        fileType === "pdf" && pdfPassword) {
        formData.append(
          "pdfPassword",
          pdfPassword,
        );
      }


      return apiFetch<PreviewResponse>(
        "/import/preview",
        {
          method: "POST",
          body: formData,
        },
      );
    },

    onSuccess: (response) => {
      setIsAnalyzing(false);
      setAnalysisProgress(100);
      setAnalysisStage("✨ Your statement is ready!");

      const rows =
        response?.data?.rows ?? [];

      const statementData =
        response?.data?.statement ?? null;

      setStatement(statementData);

      /*
       * Make sure every row has a consistent
       * review state.
       */

      const normalizedRows =
        rows.map((row) => {
          const category =
            findCategory(
              row.categoryId,
            );

          const hasCategory =
            Boolean(row.categoryId);

          return {
            ...row,

            categoryName:
              category?.name ??
              row.categoryName,

            needsCategoryReview:
              row.needsCategoryReview ??
              !hasCategory,
          };
        });



      setRequiresPassword(false);
      setPreview(normalizedRows);

      if (!normalizedRows.length) {
        toast.info(
          "No transactions were found in this statement.",
        );

        return;
      }

      const categorized =
        normalizedRows.filter(
          (row) => row.categoryId,
        ).length;

      const needsReview =
        normalizedRows.length -
        categorized;

      if (needsReview > 0) {
        toast.success(
          `${normalizedRows.length} transactions found. ${needsReview} need category review.`,
        );
      } else {
        toast.success(
          `${normalizedRows.length} transactions found and categorized.`,
        );
      }
    },

    onError: (error: any) => {
      setIsAnalyzing(false);

      setAnalysisProgress(0);
      setAnalysisStage("Analysis could not be completed.");

      console.error("AI import preview error:", error);

      if (
        error?.requiresPassword === true ||
        error?.response?.requiresPassword === true ||
        error?.data?.requiresPassword === true
      ) {
        setRequiresPassword(true);

        toast.error(
          "This PDF is password protected. Enter the password and try again.",
        );

        return;
      }

      toast.error(
        error?.error ||
        error?.message ||
        "Unable to analyze the statement.",
      );
    },
  });

  /* ============================================================
     CONFIRM IMPORT
  ============================================================ */

  const confirmImport = useMutation({
    mutationFn: async (
      rows: PreviewRow[],
    ) => {
      setIsImporting(true);
      setImportStage("Validating transactions...");
      setImportResult(null);

      const response = await apiFetch<{
        success: boolean;
        data: ImportResult;
      }>("/import/confirm", {
        method: "POST",

        body: JSON.stringify({
          rows,
          accountId,
          statement,
        }),
      });

      return response;
    },

    onSuccess: (response) => {
      setIsImporting(false);
      const result = response.data;

      setImportResult(result);

      /*
       * Final backend stage has completed.
       */

      if (result.reconciliation.performed) {
        if (result.reconciliation.reconciled) {
          setImportStage(
            "Account balance reconciled successfully.",
          );
        } else {
          setImportStage(
            "Import completed with a reconciliation difference.",
          );
        }
      } else {
        setImportStage(
          "Import cleanup completed.",
        );
      }

      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });

      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });

      queryClient.invalidateQueries({
        queryKey: ["insights"],
      });
    },

    onError: (error: any) => {
      setIsImporting(false);

      console.error(
        "Confirm import error:",
        error,
      );

      toast.error(
        error?.message ||
        "Import failed",
      );
    },
  });

  /* ============================================================
     REVIEW STATUS
  ============================================================ */

  const rowsNeedingAttention = useMemo(() => {
    return preview.filter((row) => {
      if (row.valid === false || row.duplicate) {
        return true;
      }

      if (row.type === "transfer") {
        return row.needsTransferReview || !row.transferAccountId;
      }

      return row.needsCategoryReview || !row.categoryId;
    });
  }, [preview]);
  const uncategorizedRows = useMemo(() => {
    return preview.filter(
      (row) =>
        row.type !== "transfer" &&
        !row.categoryId
    );
  }, [preview]);

  const categorizedRows = useMemo(() => {
    return preview.filter(
      (row) =>
        row.type !== "transfer" &&
        Boolean(row.categoryId)
    ).length;
  }, [preview]);

  const transferRows = useMemo(() => {
    return preview.filter(
      (row) => row.type === "transfer"
    );
  }, [preview]);


  const transfersNeedingReview = useMemo(() => {
    return preview.filter(
      (row) =>
        row.type === "transfer" &&
        !row.transferAccountId
    );
  }, [preview]);

  const reconciliation = useMemo<ReconciliationResult>(() => {
    if (!statement) {
      return {
        income: 0,
        expenses: 0,
        transfers: 0,
        expectedClosing: null,
        difference: null,
        reconciled: null,
      };
    }

    const income = preview
      .filter((row) => row.type === "income")
      .reduce((total, row) => total + Number(row.amount || 0), 0);

    const expenses = preview
      .filter((row) => row.type === "expense")
      .reduce((total, row) => total + Number(row.amount || 0), 0);

    const transfers = preview
      .filter((row) => row.type === "transfer")
      .reduce((total, row) => total + Number(row.amount || 0), 0);

    if (
      statement.openingBalance === null ||
      statement.closingBalance === null
    ) {
      return {
        income,
        expenses,
        transfers,
        expectedClosing: null,
        difference: null,
        reconciled: null,
      };
    }

    /*
     * For now, transfers are excluded from the balance calculation.
     *
     * This is intentional until the import rows expose the direction
     * of a transfer relative to the selected account.
     */
    const expectedClosing =
      Number(statement.openingBalance) +
      income -
      expenses;

    const difference =
      Number(statement.closingBalance) -
      expectedClosing;

    return {
      income,
      expenses,
      transfers,
      expectedClosing,
      difference,
      reconciled: Math.abs(difference) < 0.01,
    };
  }, [preview, statement]);
  /*
   * We allow import only when every transaction
   * has a category and there are no validation
   * errors or duplicates.
   */

  const canConfirm =
    preview.length > 0 &&
    rowsNeedingAttention.length === 0;

  /* ============================================================
     FILE CHANGE
  ============================================================ */

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile =
      event.target.files?.[0] ??
      null;

    setFile(selectedFile);

    setPreview([]);

    setPdfPassword("");

    setRequiresPassword(false);

    setStatement(null);
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="space-y-6">

      {/* ======================================================
          IMPORT SOURCE
      ====================================================== */}

      <div className="rounded-xl border bg-card p-5 space-y-5">

        {/* HEADER */}

        <div className="flex items-start gap-3">

          <div className="rounded-lg bg-primary/10 p-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>

          <div>

            <h3 className="font-semibold">
              AI Transaction Import
            </h3>

            <p className="text-sm text-muted-foreground">
              Upload a CSV or PDF Statement and AureX
              will extract transactions and match
              them to your existing categories.
            </p>

          </div>

        </div>

        {/* ACCOUNT */}

        <div className="space-y-2">

          <label className="text-sm font-medium">
            Account
          </label>

          <Select
            value={accountId}
            onValueChange={(value) => {
              setAccountId(value);
              setPreview([]);
            }}
          >

            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>

            <SelectContent>

              {accounts.map((account) => (
                <SelectItem
                  key={account.id}
                  value={account.id}
                >
                  {account.name} ({account.type})
                </SelectItem>
              ))}

            </SelectContent>

          </Select>

        </div>

        {/* FILE */}

        <div className="space-y-3">

          <label className="text-sm font-medium">
            Statement
          </label>

          <Input
            type="file"
            accept=".csv,.pdf"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null;

              setFile(selectedFile);
              setPdfPassword("");
              setRequiresPassword(false);
              setPreview([]);
            }}
          />

          {/* PDF PASSWORD */}
          {requiresPassword && file?.type === "application/pdf" && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 space-y-4">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                  <LockKeyhole className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>

                <div className="min-w-0">

                  <p className="text-sm font-semibold">
                    Password-protected PDF
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    This statement is encrypted and requires its PDF password
                    before AureX can read the transactions.
                  </p>

                </div>

              </div>

              <div className="space-y-2">

                <label className="text-sm font-medium">
                  PDF password
                </label>

                <Input
                  type="password"
                  value={pdfPassword}
                  placeholder="Enter PDF password"
                  autoComplete="off"
                  onChange={(event) =>
                    setPdfPassword(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      pdfPassword.trim() &&
                      !previewImport.isPending
                    ) {
                      previewImport.mutate();
                    }
                  }}
                  className="h-10 border-amber-500/40 focus-visible:ring-amber-500/30"
                />

              </div>

              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">

                <div className="flex items-start gap-2">

                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />

                  <p className="text-xs leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Privacy notice:
                    </span>{" "}
                    AureX uses this password only to unlock the PDF during
                    this import. It is not saved as part of your account or
                    transaction data.
                  </p>

                </div>

              </div>

            </div>
          )}

          <Button
            onClick={() => previewImport.mutate()}
            disabled={
              previewImport.isPending ||
              !file ||
              !accountId ||
              (
                requiresPassword &&
                file?.type === "application/pdf" &&
                !pdfPassword.trim()
              )
            }
            className="w-full"
          >
            {previewImport.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing statement...
              </>
            ) : requiresPassword ? (
              <>
                <LockKeyhole className="mr-2 h-4 w-4" />
                Unlock & Analyze
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze with AI
              </>
            )}
          </Button>
        </div>

      </div>

      {isAnalyzing && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </div>

            <div className="min-w-0">

              <h3 className="font-semibold">
                Analyzing your statement
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                AureX is carefully reading and organizing your
                financial transactions.
              </p>

            </div>

          </div>

          <div className="mt-6 space-y-3">

            <Progress
              value={analysisProgress}
              className="h-2"
            />

            <div className="flex items-center justify-between gap-4 text-xs">

              <span className="text-muted-foreground">
                {analysisStage}
              </span>

              <span className="shrink-0 font-medium">
                {analysisProgress}%
              </span>

            </div>

          </div>

          <div className="mt-5 rounded-lg border bg-muted/30 px-4 py-3">

            <div className="flex items-center gap-3">

              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />

              <p
                key={messageIndex}
                className="text-sm animate-in fade-in duration-500"
              >
                {analysisMessages[messageIndex]}
              </p>

            </div>

          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            This may take a little while for longer statements.
            Please keep this window open.
          </p>

        </div>
      )}

      {isImporting && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-5 w-5 text-primary animate-pulse" />
            </div>

            <div>
              <h3 className="font-semibold">
                Importing your transactions
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                AureX is processing your transactions and
                reconciling your account.
              </p>
            </div>

          </div>

          <div className="mt-6 space-y-3">

            {importSteps.map((step, index) => {

              const completed =
                importResult !== null ||
                (
                  importStage ===
                  "Completing import cleanup." &&
                  index <= 5
                );

              const active =
                importStage
                  .toLowerCase()
                  .includes(
                    step.label
                      .toLowerCase()
                      .split(" ")[0]
                  );

              return (
                <div
                  key={step.id}
                  className="flex items-center gap-3"
                >

                  {completed ? (
                    <CheckCircle2
                      className="h-5 w-5 text-green-600 shrink-0"
                    />
                  ) : active ? (
                    <Loader2
                      className="h-5 w-5 animate-spin text-primary shrink-0"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full border" />
                  )}

                  <span
                    className={
                      completed
                        ? "text-sm"
                        : active
                          ? "text-sm font-medium"
                          : "text-sm text-muted-foreground"
                    }
                  >
                    {step.label}
                  </span>

                </div>
              );
            })}

          </div>

          <div className="mt-6 rounded-lg border bg-muted/30 px-4 py-3">

            <div className="flex items-center gap-3">

              <Loader2 className="h-4 w-4 animate-spin text-primary" />

              <p className="text-sm">
                {importStage}
              </p>

            </div>

          </div>

        </div>
      )}
      {/* ======================================================
          PREVIEW
      ====================================================== */}

      {preview.length > 0 && (
        <div className="space-y-4">

          {/* SUMMARY */}

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>

              <h3 className="font-semibold">
                Import Preview
              </h3>

              <p className="text-sm text-muted-foreground">
                Review the transactions before
                importing them.
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <Badge variant="outline">
                {preview.length} transactions
              </Badge>

              {categorizedRows > 0 && (
                <Badge variant="secondary">
                  {categorizedRows} categorized
                </Badge>
              )}

              {transferRows.length > 0 && (
                <Badge variant="outline">
                  {transferRows.length} transfers
                </Badge>
              )}

              {uncategorizedRows.length > 0 && (
                <Badge variant="destructive">
                  {uncategorizedRows.length} need category
                </Badge>
              )}

              {transfersNeedingReview.length > 0 && (
                <Badge variant="destructive">
                  {transfersNeedingReview.length} need transfer destination
                </Badge>
              )}

            </div>

          </div>

          {/* ======================================================
              STATEMENT BALANCE RECONCILIATION
          ====================================================== */}

          {statement && (
            <div className="rounded-xl border bg-card p-4">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <h4 className="font-semibold">
                    Statement Reconciliation
                  </h4>

                  <p className="text-xs text-muted-foreground mt-1">
                    Compare the statement balances with the transactions
                    detected by AureX.
                  </p>
                </div>

                <Badge variant="outline">
                  {statement.currency}
                </Badge>

              </div>

              {/* BALANCES */}

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">
                    Opening Balance
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {statement.openingBalance !== null
                      ? `${statement.currency} ${Number(
                        statement.openingBalance
                      ).toLocaleString("en-KE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                      : "Not detected"}
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">
                    Statement Closing Balance
                  </p>

                  <p className="mt-1 text-lg font-semibold">
                    {statement.closingBalance !== null
                      ? `${statement.currency} ${Number(
                        statement.closingBalance
                      ).toLocaleString("en-KE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                      : "Not detected"}
                  </p>
                </div>

              </div>

              {/* TRANSACTION MOVEMENT */}

              {reconciliation.expectedClosing !== null && (
                <div className="mt-4 rounded-lg border p-4">

                  <p className="text-sm font-medium">
                    Transaction Movement
                  </p>

                  <div className="mt-3 space-y-2 text-sm">

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Income
                      </span>

                      <span className="font-medium">
                        +{statement.currency}{" "}
                        {reconciliation.income.toLocaleString("en-KE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Expenses
                      </span>

                      <span className="font-medium">
                        -{statement.currency}{" "}
                        {reconciliation.expenses.toLocaleString("en-KE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    {reconciliation.transfers > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Transfers
                        </span>

                        <span className="font-medium">
                          {statement.currency}{" "}
                          {reconciliation.transfers.toLocaleString("en-KE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}

                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>
                        Expected Closing
                      </span>

                      <span>
                        {statement.currency}{" "}
                        {reconciliation.expectedClosing.toLocaleString("en-KE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                  </div>

                </div>
              )}

              {/* RECONCILIATION RESULT */}

              {reconciliation.reconciled === true && (
                <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/5 p-4">

                  <div className="flex items-start gap-3">

                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />

                    <div>
                      <p className="text-sm font-medium">
                        Statement reconciles
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        The detected transactions account for the
                        statement closing balance.
                      </p>
                    </div>

                  </div>

                </div>
              )}

              {reconciliation.reconciled === false && (
                <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">

                  <div className="flex items-start gap-3">

                    <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />

                    <div className="min-w-0">

                      <p className="text-sm font-medium">
                        Statement does not fully reconcile
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        The detected transactions differ from the
                        statement closing balance by{" "}
                        <span className="font-medium text-foreground">
                          {statement.currency}{" "}
                          {Math.abs(
                            reconciliation.difference ?? 0
                          ).toLocaleString("en-KE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>.
                      </p>

                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

          {/* FAILED CHUNKS WARNING */}

          {previewImport.data?.data?.failedChunks &&
            previewImport.data.data.failedChunks
              .length > 0 && (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">

                <div className="flex gap-2">

                  <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />

                  <div>

                    <p className="font-medium text-sm">
                      Some parts of the statement
                      could not be analyzed
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                      The AI could not process{" "}
                      {
                        previewImport.data
                          .data.failedChunks
                          .length
                      } section
                      {previewImport.data.data.failedChunks
                        .length === 1
                        ? ""
                        : "s"}{" "}
                      of the statement.
                    </p>

                  </div>

                </div>

              </div>
            )}

          {/* TABLE */}

          <div className="rounded-xl border overflow-hidden">

            <div className="max-h-[500px] overflow-auto">

              <table className="w-full text-sm">

                <thead className="sticky top-0 bg-muted z-10">

                  <tr>

                    <th className="p-3 text-left">
                      Date
                    </th>

                    <th className="p-3 text-left">
                      Description
                    </th>

                    <th className="p-3 text-right">
                      Amount
                    </th>

                    <th className="p-3 text-left">
                      Type
                    </th>

                    <th className="p-3 text-left min-w-[250px]">
                      Category / Transfer To
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {preview.map(
                    (row, index) => {

                      const needsCategory =
                        !row.categoryId;


                      return (
                        <tr
                          key={`${row.date}-${index}`}
                          className={`border-t ${needsCategory
                            ? "bg-yellow-500/5"
                            : ""
                            }`}
                        >

                          {/* DATE */}

                          <td className="p-3 whitespace-nowrap">
                            {row.date}
                          </td>

                          {/* DESCRIPTION */}

                          <td className="p-3 max-w-[320px]">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="truncate">
                                  {row.description}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p>{row.description}</p>
                              </TooltipContent>
                            </Tooltip>
                            {row.duplicate && (
                              <Badge
                                variant="secondary"
                                className="mt-1 text-xs"
                              >
                                Possible duplicate
                              </Badge>
                            )}

                            {row.error && (
                              <p className="text-xs text-destructive mt-1">
                                {row.error}
                              </p>
                            )}

                          </td>

                          {/* AMOUNT */}

                          <td className="p-3 text-right font-medium whitespace-nowrap">

                            KES{" "}
                            {Number(
                              row.amount,
                            ).toLocaleString(
                              "en-KE",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}

                          </td>

                          {/* TYPE */}

                          <td className="p-3">
                            <Select
                              value={row.type}
                              onValueChange={(value) =>
                                updateType(
                                  index,
                                  value as "income" | "expense" | "transfer",
                                )
                              }
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue />
                              </SelectTrigger>

                              <SelectContent>
                                <SelectItem value="income">
                                  Income
                                </SelectItem>

                                <SelectItem value="expense">
                                  Expense
                                </SelectItem>

                                <SelectItem value="transfer">
                                  Transfer
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </td>

                          {/* CATEGORY / TRANSFER DESTINATION */}

                          <td className="p-3">
                            {row.type === "transfer" ? (
                              <Select
                                value={row.transferAccountId || ""}
                                onValueChange={(value) => {
                                  setPreview((current) =>
                                    current.map((item, i) =>
                                      i === index
                                        ? {
                                          ...item,
                                          transferAccountId: value,
                                        }
                                        : item
                                    )
                                  );
                                }}
                              >
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Transfer to..." />
                                </SelectTrigger>

                                <SelectContent>
                                  {getTransferAccounts(accountId).map((account) => (
                                    <SelectItem
                                      key={account.id}
                                      value={account.id}
                                    >
                                      {account.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Select
                                value={row.categoryId || ""}
                                onValueChange={(value) => {
                                  if (value === "__add_new_category__") {
                                    openAddCategory(index);
                                    return;
                                  }

                                  updateCategory(index, value);
                                }}
                              >
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>

                                <SelectContent>
                                  {categories
                                    .filter(
                                      (category) =>
                                        category.type === row.type,
                                    )
                                    .map((category) => (
                                      <SelectItem
                                        key={category.id}
                                        value={category.id}
                                      >
                                        {category.name}
                                      </SelectItem>
                                    ))}

                                  <SelectItem
                                    value="__add_new_category__"
                                    className="font-medium"
                                  >
                                    + Add New Category
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </td>

                        </tr>
                      );
                    },
                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* REVIEW WARNING */}

          {!canConfirm && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">

              <div className="flex gap-3">

                <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0" />

                <div>

                  <p className="font-medium text-sm">
                    Review required
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    {uncategorizedRows.length > 0
                      ? `${uncategorizedRows.length} transaction${uncategorizedRows.length === 1 ? "" : "s"
                      } ${uncategorizedRows.length === 1 ? "does" : "do"
                      } not have a category. Select an existing category or create a new one.`
                      : transfersNeedingReview.length > 0
                        ? `${transfersNeedingReview.length} transfer${transfersNeedingReview.length === 1 ? "" : "s"
                        } ${transfersNeedingReview.length === 1 ? "does" : "do"
                        } not have a destination account.`
                        : "Some transactions still require review before they can be imported."}
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* CONFIRM */}

          <Button
            className="w-full"
            size="lg"
            onClick={() =>
              confirmImport.mutate(
                preview,
              )
            }
            disabled={
              confirmImport.isPending ||
              !canConfirm
            }
          >

            {confirmImport.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing transactions...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Confirm Import (
                {preview.length})
              </>
            )}

          </Button>

        </div>
      )}

      {/* ======================================================
          READY STATE
      ====================================================== */}

      {!preview.length &&
        !previewImport.isPending &&
        file && (
          <div className="rounded-xl border border-dashed p-8 text-center">

            <Sparkles className="mx-auto h-8 w-8 text-muted-foreground mb-3" />

            <p className="font-medium">
              Ready to analyze
            </p>

            <p className="text-sm text-muted-foreground">
              Click "Analyze with AI" to extract
              transactions from your statement.
            </p>

          </div>
        )}

      <TransactionCategoryDialog
        open={categoryDialogOpen}
        onOpenChange={(open) => {
          setCategoryDialogOpen(open);

          if (!open) {
            setCategoryRowIndex(null);
          }
        }}
        type={
          categoryRowIndex !== null
            ? preview[categoryRowIndex]?.type === "income"
              ? "income"
              : "expense"
            : "expense"
        }
        onCategoryCreated={handleCategoryCreated}
      />
    </div>
  );

}
