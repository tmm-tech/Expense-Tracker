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
  Plus,
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
import type { Transaction } from "@/types/transaction";
import { Progress } from "@/components/ui/progress";

/* ============================================================
   TYPES
============================================================ */

type CategoryConfidence =
  | "high"
  | "medium"
  | "low"
  | "none";

interface PreviewRow {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";

  categoryId?: string | null;
  categoryName?: string;

  categoryConfidence?: CategoryConfidence;

  needsCategoryReview?: boolean;

  valid?: boolean;
  error?: string;

  duplicate?: boolean;

  originalRow?: number;
}

interface ImportError {
  message?: string;
  error?: string;
  requiresPassword?: boolean;
}

interface PreviewResponse {
  success: boolean;

  data: {
    rows: PreviewRow[];
    accountId: string;

    totalRows?: number;
    categorizedRows?: number;
    uncategorizedRows?: number;
    failedChunks?: number[];
  };
}

interface CategoryCreateResponse {
  success: boolean;
  data: Category;
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
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [analysisStage, setAnalysisStage] = useState(
    "Preparing your statement...",
  );
  const analysisMessages = [
    "🔍 Looking for transactions...",
    "🧠 Understanding transaction descriptions...",
    "💰 Separating income from expenses...",
    "🏷️ Matching transactions to your categories...",
    "🧹 Checking for duplicate transactions...",
    "✨ Preparing your review...",
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) return;

    const interval = setInterval(() => {
      setAnalysisProgress((current) => {
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

  const getCategoriesForType = (
    type: "income" | "expense",
  ) => {
    return categories.filter(
      (category) => category.type === type,
    );
  };

  const findCategory = (categoryId?: string | null) => {
    if (!categoryId) return undefined;

    return categories.find(
      (category) => category.id === categoryId,
    );
  };

  /* ============================================================
     UPDATE CATEGORY
  ============================================================ */

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

          categoryName: category?.name,

          categoryConfidence: "high",

          needsCategoryReview: false,

          error: undefined,
        };
      }),
    );
  };

  /* ============================================================
     CREATE CATEGORY
  ============================================================ */

  const createCategory = useMutation({
    mutationFn: async ({
      name,
      type,
    }: {
      name: string;
      type: "income" | "expense";
    }) => {
      return apiFetch<CategoryCreateResponse>(
        "/categories",
        {
          method: "POST",

          body: JSON.stringify({
            name,
            type,
          }),
        },
      );
    },
  });

  const handleCreateCategory = async (
    index: number,
    type: "income" | "expense",
  ) => {
    const name = window.prompt(
      `Create ${type} category`,
    );

    if (!name?.trim()) return;

    try {
      const response =
        await createCategory.mutateAsync({
          name: name.trim(),
          type,
        });

      /*
       * Your categories API follows the standard
       * { success, data } response structure.
       */

      const category = response.data;

      if (!category) {
        throw new Error(
          "Category was not returned by the server",
        );
      }

      /*
       * Refresh categories everywhere.
       */
      queryClient.setQueryData(
        ["categories"],
        (current: any) => {
          if (!current) return current;

          return {
            ...current,
            data: [
              ...(current.data ?? []),
              category,
            ],
          };
        },
      );
      await queryClient.invalidateQueries({
        queryKey: ["categories"],
      });

      /*
       * Immediately assign the newly created category
       * to the transaction being edited.
       */

      setPreview((current) =>
        current.map((row, i) => {
          if (i !== index) return row;

          return {
            ...row,

            categoryId: category.id,

            categoryName: category.name,

            categoryConfidence: "high",

            needsCategoryReview: false,

            error: undefined,
          };
        }),
      );

      toast.success(
        `Category "${category.name}" created`,
      );
    } catch (error: any) {
      console.error(
        "Create category error:",
        error,
      );

      toast.error(
        error?.message ||
        "Failed to create category",
      );
    }
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
      setAnalysisProgress(5);
      setCurrentChunk(0);
      setTotalChunks(0);
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
      setCurrentChunk(0);
      setTotalChunks(0);
      setAnalysisStage("✨ Your statement is ready!");

      const rows =
        response?.data?.rows ?? [];

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
      setCurrentChunk(0);
      setTotalChunks(0);
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
    mutationFn: (
      rows: PreviewRow[],
    ) =>
      apiFetch("/import/confirm", {
        method: "POST",

        body: JSON.stringify({
          rows,
          accountId,
        }),
      }),

    onSuccess: () => {
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

      toast.success(
        "Transactions imported successfully",
      );

      setPreview([]);

      setFile(null);

      setPdfPassword("");

      setRequiresPassword(false);
    },

    onError: (error: any) => {
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

  const rowsNeedingAttention =
    useMemo(() => {
      return preview.filter(
        (row) =>
          row.needsCategoryReview ||
          !row.categoryId ||
          row.valid === false ||
          row.duplicate,
      );
    }, [preview]);

  const uncategorizedRows =
    useMemo(() => {
      return preview.filter(
        (row) => !row.categoryId,
      );
    }, [preview]);

  const categorizedRows =
    preview.length -
    uncategorizedRows.length;

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

              <p className="text-sm">
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

              <Badge variant="secondary">
                {categorizedRows} categorized
              </Badge>

              {uncategorizedRows.length > 0 && (
                <Badge variant="destructive">
                  {uncategorizedRows.length} need category
                </Badge>
              )}

            </div>

          </div>

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
                      Category
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {preview.map(
                    (row, index) => {

                      const rowCategories =
                        getCategoriesForType(
                          row.type,
                        );

                      const needsCategory =
                        !row.categoryId;

                      const matchedCategory =
                        findCategory(
                          row.categoryId,
                        );

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

                            <div className="truncate">
                              {row.description}
                            </div>

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

                            <Badge
                              variant={
                                row.type ===
                                  "income"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {row.type}
                            </Badge>

                          </td>

                          {/* CATEGORY */}

                          <td className="p-3">

                            <div className="flex gap-2">

                              <Select
                                value={
                                  row.categoryId ??
                                  ""
                                }
                                onValueChange={(
                                  value,
                                ) =>
                                  updateCategory(
                                    index,
                                    value,
                                  )
                                }
                              >

                                <SelectTrigger
                                  className={`flex-1 ${needsCategory
                                    ? "border-yellow-500"
                                    : ""
                                    }`}
                                >

                                  <SelectValue
                                    placeholder={
                                      "Select category"
                                    }
                                  />

                                </SelectTrigger>

                                <SelectContent>

                                  {rowCategories.map(
                                    (category) => (
                                      <SelectItem
                                        key={
                                          category.id
                                        }
                                        value={
                                          category.id
                                        }
                                      >
                                        {
                                          category.name
                                        }
                                      </SelectItem>
                                    ),
                                  )}

                                </SelectContent>

                              </Select>

                              {/* CREATE CATEGORY */}

                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                title={`Create ${row.type} category`}
                                onClick={() =>
                                  handleCreateCategory(
                                    index,
                                    row.type,
                                  )
                                }
                                disabled={
                                  createCategory.isPending
                                }
                              >
                                {createCategory.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Plus className="h-4 w-4" />
                                )}
                              </Button>

                            </div>

                            {/* AI MATCH */}

                            {matchedCategory && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">

                                <CheckCircle2 className="h-3 w-3" />

                                AI matched:{" "}
                                {matchedCategory.name}

                                {row.categoryConfidence &&
                                  row.categoryConfidence !==
                                  "none" && (
                                    <span>
                                      (
                                      {
                                        row.categoryConfidence
                                      }
                                      )
                                    </span>
                                  )}

                              </div>
                            )}

                            {/* REVIEW */}

                            {needsCategory && (
                              <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                                No suitable existing
                                category was found.
                              </p>
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
                      ? `${uncategorizedRows.length} transaction${uncategorizedRows.length ===
                        1
                        ? ""
                        : "s"
                      } ${uncategorizedRows.length ===
                        1
                        ? "does"
                        : "do"
                      } not have a category. Select an existing category or create a new one.`
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

    </div>
  );
}