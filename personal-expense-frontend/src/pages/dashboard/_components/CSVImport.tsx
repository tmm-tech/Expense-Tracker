"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload } from "lucide-react";
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

  // Import validation
  valid?: boolean;
  error?: string;

  // Duplicate detection
  duplicate?: boolean;

  // Original imported data
  originalRow?: number;
}
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

  /* =========================
     PREVIEW
  ========================= */

  const previewImport = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("Select file");
      if (!accountId) throw new Error("Select account");

      const formData = new FormData();

      formData.append("file", file);
      formData.append("accountId", accountId);

      const fileType = file.type === "application/pdf" ? "pdf" : "csv";

      formData.append("fileType", fileType);
      return apiFetch<{
        success: boolean;
        data: {
          rows: PreviewRow[];
          accountId: string;
        };
      }>("/import/preview", {
        method: "POST",
        body: formData,
      });
    },

 onSuccess: (response) => {
  setPreview(response.data.rows);
},

    onError: () => {
      toast.error("Preview failed");
    },
  });

  /* =========================
     UPDATE CATEGORY
  ========================= */

  const updateCategory = (index: number, categoryId: string) => {
    const updated = [...preview];
    updated[index].categoryId = categoryId;
    setPreview(updated);
  };

  /* =========================
     CONFIRM IMPORT
  ========================= */

  const confirmImport = useMutation({
    mutationFn: (rows: PreviewRow[]) =>
      apiFetch("/import/confirm", {
        method: "POST",
        body: JSON.stringify({
          rows,
          accountId,
        }),
      }),

    /* optimistic update */
    onMutate: async (rows) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      const previous =
        queryClient.getQueryData<Transaction[]>(["transactions"]) ?? [];

      const optimistic: Transaction[] = rows.map((r, i) => ({
        id: `import-${Date.now()}-${i}`,
        description: r.description,
        amount: r.amount,
        type: r.type,
        categoryId: r.categoryId!,
        accountId,
        date: new Date(r.date).getTime(),
      }));

      queryClient.setQueryData<Transaction[]>(
        ["transactions"],
        [...optimistic, ...previous],
      );

      return { previous };
    },

    onError: (_err, _rows, ctx) => {
      queryClient.setQueryData(["transactions"], ctx?.previous);
      toast.error("Import failed");
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });

      toast.success("Transactions imported");

      setPreview([]);
      setFile(null);
    },
  });

  return (
    <div className="space-y-4">
      {/* ACCOUNT */}
      <Select value={accountId} onValueChange={setAccountId}>
        <SelectTrigger>
          <SelectValue placeholder="Select Account" />
        </SelectTrigger>

        <SelectContent>
          {accounts.map((acc) => (
            <SelectItem key={acc.id} value={acc.id}>
              {acc.name} ({acc.type})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* FILE */}
      <div className="flex gap-2">
        <Input
          type="file"
          accept=".csv,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <Button
          onClick={() => previewImport.mutate()}
          disabled={previewImport.isPending}
        >
          <Upload className="w-4 h-4 mr-2" />
          {previewImport.isPending ? "Analyzing..." : "Analyze with AI"}
        </Button>
      </div>

      {/* PREVIEW TABLE */}
      {preview.length > 0 && (
        <>
          <div className="border rounded-lg overflow-auto max-h-[450px]">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Description</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Category</th>
                </tr>
              </thead>

              <tbody>
                {preview.map((row, i) => {
                  const filtered = categories.filter(
                    (c) => c.type === row.type,
                  );

                  return (
                    <tr key={i} className="border-t">
                      <td className="p-2">{row.date}</td>
                      <td className="p-2">{row.description}</td>
                      <td className="p-2">{row.amount}</td>
                      <td className="p-2">{row.type}</td>

                      <td className="p-2">
                        <Select
                          value={row.categoryId || ""}
                          onValueChange={(v) => updateCategory(i, v)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>

                          <SelectContent>
                            {filtered.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Button
            onClick={() => confirmImport.mutate(preview)}
            disabled={confirmImport.isPending}
            className="w-full"
          >
            {confirmImport.isPending ? "Importing..." : "Confirm Import"}
          </Button>
        </>
      )}
    </div>
  );
}
