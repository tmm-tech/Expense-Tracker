"use client";

import { useMemo, useState } from "react";
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
  FileUp,
  Loader2,
  Plus,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";

import type { Account } from "@/types/account";
import type { Category } from "@/types/category";
import type { Transaction } from "@/types/transaction";

interface PreviewRow {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";

  categoryId?: string;

  // AI/category matching
  categoryName?: string;
  categoryConfidence?: number;

  // Validation
  valid?: boolean;
  error?: string;

  // Duplicate detection
  duplicate?: boolean;

  // Original row
  originalRow?: number;
}

interface CSVImportProps {
  accounts: Account[];
  categories: Category[];
}

interface PreviewResponse {
  success: boolean;
  data: {
    rows: PreviewRow[];
    accountId: string;
  };
}

export function CSVImport({
  accounts,
  categories,
}: CSVImportProps) {
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [accountId, setAccountId] = useState("");
  const [pdfPassword, setPdfPassword] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);

  /* ============================================================
     CATEGORY HELPERS
  ============================================================ */

  const getCategoriesForType = (type: "income" | "expense") =>
    categories.filter((category) => category.type === type);

  const updateCategory = (
    index: number,
    categoryId: string,
  ) => {
    const category = categories.find(
      (c) => c.id === categoryId,
    );

    setPreview((current) =>
      current.map((row, i) =>
        i === index
          ? {
            ...row,
            categoryId,
            categoryName: category?.name,
            error: undefined,
          }
          : row,
      ),
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
      return apiFetch<Category>("/categories", {
        method: "POST",
        body: JSON.stringify({
          name,
          type,
        }),
      });
    },

    onSuccess: (category) => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });

      toast.success(`Category "${category.name}" created`);

      /*
       * If we are creating a category for a specific row,
       * the row index is handled below.
       */
    },

    onError: () => {
      toast.error("Failed to create category");
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
      const category = await createCategory.mutateAsync({
        name: name.trim(),
        type,
      });

      setPreview((current) =>
        current.map((row, i) =>
          i === index
            ? {
              ...row,
              categoryId: category.id,
              categoryName: category.name,
              error: undefined,
            }
            : row,
        ),
      );
    } catch {
      // mutation already handles toast
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

      const formData = new FormData();

      formData.append("file", file);
      formData.append("accountId", accountId);

      const fileType =
        file.type === "application/pdf"
          ? "pdf"
          : "csv";

      formData.append("fileType", fileType);

      /*
       * IMPORTANT:
       * Send the password to the backend.
       */
      if (fileType === "pdf" && pdfPassword) {
        formData.append("pdfPassword", pdfPassword);
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
      const rows = response.data.rows ?? [];

      setPreview(rows);

      /*
       * Backend may return password-protected status
       * through the normal error path, so once preview
       * succeeds we no longer need the password prompt.
       */
      setRequiresPassword(false);

      if (!rows.length) {
        toast.info(
          "No transactions were found in this statement.",
        );
        return;
      }

      toast.success(
        `${rows.length} transaction${rows.length === 1 ? "" : "s"
        } found`,
      );
    },

    onError: (error: any) => {
      const message = error?.message || "";

      if (
        message.toLowerCase().includes("password") ||
        message.toLowerCase().includes("protected")
      ) {
        setRequiresPassword(true);

        toast.error("This PDF is password protected");
        return;
      }

      toast.error("Preview failed");
    },
  });

  /* ============================================================
     CONFIRM IMPORT
  ============================================================ */

  const confirmImport = useMutation({
    mutationFn: (rows: PreviewRow[]) =>
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
      toast.error(
        error?.message || "Import failed",
      );
    },
  });

  /* ============================================================
     IMPORT VALIDATION
  ============================================================ */

  const rowsNeedingAttention = useMemo(
    () =>
      preview.filter(
        (row) =>
          !row.categoryId ||
          row.valid === false ||
          row.duplicate,
      ),
    [preview],
  );

  const canConfirm =
    preview.length > 0 &&
    rowsNeedingAttention.filter(
      (row) => !row.duplicate,
    ).length === 0;

  /* ============================================================
     FILE CHANGE
  ============================================================ */

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile =
      event.target.files?.[0] || null;

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

        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h3 className="font-semibold">
              AI Transaction Import
            </h3>

            <p className="text-sm text-muted-foreground">
              Upload a bank statement and AureX will
              automatically extract and categorize
              your transactions.
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

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Statement
          </label>

          <Input
            type="file"
            accept=".csv,.pdf"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setPdfPassword("");
              setRequiresPassword(false);
              setPreview([]);
            }}
          />

                  {requiresPassword && (
          <div className="rounded-lg border p-4 space-y-2">
            <label className="text-sm font-medium">
              Statement Password
            </label>

            <Input
              type="password"
              placeholder="Enter PDF password"
              value={pdfPassword}
              onChange={(e) => setPdfPassword(e.target.value)}
              autoFocus
            />

            <p className="text-xs text-muted-foreground">
              Your password is used only to unlock this PDF for import and is not
              stored by AureX.
            </p>
          </div>
        )}

        
          <Button
            onClick={() => previewImport.mutate()}
            disabled={
              previewImport.isPending ||
              !file ||
              !accountId ||
              (requiresPassword && !pdfPassword)
            }
          >
            <Upload className="mr-2 h-4 w-4" />

            {previewImport.isPending
              ? "Analyzing..."
              : requiresPassword
                ? "Unlock & Analyze"
                : "Analyze with AI"}
          </Button>

        </div>


      </div>


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
                Review the transactions before importing.
              </p>
            </div>

            <div className="flex gap-2">

              <Badge variant="outline">
                {preview.length} transactions
              </Badge>

              {rowsNeedingAttention.length > 0 && (
                <Badge variant="secondary">
                  {rowsNeedingAttention.length} need review
                </Badge>
              )}

            </div>
          </div>

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

                    <th className="p-3 text-left min-w-[220px]">
                      Category
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {preview.map((row, index) => {

                    const rowCategories =
                      getCategoriesForType(
                        row.type,
                      );

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

                        <td className="p-3 max-w-[300px]">
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
                          ).toLocaleString()}
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
                                row.categoryId ||
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
                                className={
                                  needsCategory
                                    ? "border-yellow-500"
                                    : ""
                                }
                              >
                                <SelectValue
                                  placeholder="Select category"
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

                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              title="Create category"
                              onClick={() =>
                                handleCreateCategory(
                                  index,
                                  row.type,
                                )
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>

                          </div>

                          {row.categoryName && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3 w-3" />
                              AI matched:{" "}
                              {row.categoryName}
                            </div>
                          )}

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          </div>

          {/* ==================================================
              REVIEW WARNING
          ================================================== */}

          {!canConfirm && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">

              <div className="flex gap-2">

                <AlertCircle className="h-5 w-5 text-yellow-500" />

                <div>

                  <p className="font-medium text-sm">
                    Review required
                  </p>

                  <p className="text-xs text-muted-foreground mt-1">
                    Some transactions do not have a
                    category. Select an existing category
                    or create a new one before importing.
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* ==================================================
              CONFIRM
          ================================================== */}

          <Button
            className="w-full"
            size="lg"
            onClick={() =>
              confirmImport.mutate(preview)
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
                Confirm Import ({preview.length})
              </>
            )}
          </Button>
        </div>
      )}

      {/* ======================================================
          EMPTY / INITIAL STATE
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
              Click "Analyze with AI" to extract the
              transactions from your statement.
            </p>

          </div>
        )}

    </div>
  );
}