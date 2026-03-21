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

/* =========================
   Types
========================= */

interface PreviewRow {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  categoryId?: string;
}

/* =========================
   Component
========================= */

export function CSVImport({
  accounts,
  categories,
}: {
  accounts: Account[];
  categories: Category[];
}) {
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [accountId, setAccountId] = useState("");
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(false);

  /* =========================
     Preview Import
  ========================= */

  const handlePreview = async () => {
    if (!file) {
      toast.error("Select file");
      return;
    }

    if (!accountId) {
      toast.error("Select account");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("accountId", accountId);

      const res = await fetch("/api/import/preview", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setPreview(data.rows);
    } catch {
      toast.error("Preview failed");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Update Category
  ========================= */

  const updateCategory = (index: number, categoryId: string) => {
    const updated = [...preview];
    updated[index].categoryId = categoryId;
    setPreview(updated);
  };

  /* =========================
     Confirm Import
  ========================= */

  const confirmImport = useMutation({
    mutationFn: () =>
      apiFetch("/import/confirm", {
        method: "POST",
        body: JSON.stringify({
          rows: preview,
          accountId,
        }),
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });

      toast.success("Transactions imported");

      setPreview([]);
      setFile(null);
    },

    onError: () => {
      toast.error("Import failed");
    },
  });

  /* =========================
     UI
  ========================= */

  return (
    <div className="space-y-4">
      {/* Account selector */}
      <Select value={accountId} onValueChange={setAccountId}>
        <SelectTrigger>
          <SelectValue placeholder="Select account" />
        </SelectTrigger>

        <SelectContent>
          {accounts.map((acc) => (
            <SelectItem key={acc.id} value={acc.id}>
              {acc.name} ({acc.type})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* File upload */}
      <div className="flex gap-2">
        <Input
          type="file"
          accept=".csv,.pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <Button onClick={handlePreview} disabled={loading}>
          <Upload className="w-4 h-4 mr-2" />
          Preview
        </Button>
      </div>

      {/* Preview Table */}
      {preview.length > 0 && (
        <>
          <div className="border rounded-lg overflow-auto max-h-[450px]">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Category</th>
                </tr>
              </thead>

              <tbody>
                {preview.map((row, i) => {
                  const filtered = categories.filter(
                    (c) =>
                      c.type !== "goal" &&
                      c.type === row.type
                  );

                  return (
                    <tr key={i} className="border-t">
                      <td className="p-2">{row.date}</td>

                      <td className="p-2">{row.description}</td>

                      <td className="p-2">
                        {row.amount.toLocaleString()}
                      </td>

                      <td className="p-2">{row.type}</td>

                      <td className="p-2">
                        <Select
                          value={row.categoryId || ""}
                          onValueChange={(v) =>
                            updateCategory(i, v)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>

                          <SelectContent>
                            {filtered.map((c) => (
                              <SelectItem
                                key={c.id}
                                value={c.id}
                              >
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

          {/* Confirm Import */}
          <Button
            onClick={() => confirmImport.mutate()}
            disabled={confirmImport.isPending}
            className="w-full"
          >
            {confirmImport.isPending
              ? "Importing..."
              : "Confirm Import"}
          </Button>
        </>
      )}
    </div>
  );
}