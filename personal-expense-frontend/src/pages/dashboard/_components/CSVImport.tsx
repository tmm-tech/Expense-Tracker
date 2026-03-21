import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";

import { useState } from "react";
import { toast } from "sonner";

import type { Account } from "@/types/account";
import type { Category } from "@/types/category";

interface Props {
  accounts: Account[];
  categories: Category[];
}

interface ParsedRow {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
}

export function CSVImport({ accounts, categories }: Props) {
  const [accountId, setAccountId] = useState("");
  const [fileType, setFileType] = useState<"csv" | "pdf">("csv");
  const [file, setFile] = useState<File | null>(null);

  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [loading, setLoading] = useState(false);

  /* parse only */
  const handleParse = async () => {
    if (!file || !accountId) {
      toast.error("Select file and account");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("accountId", accountId);
    formData.append("fileType", fileType);

    setLoading(true);

    try {
      const res = await fetch("https://expense-tracker-u6ge.onrender.com/api/import/preview", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setPreview(data.rows);
    } catch {
      toast.error("Parse failed");
    } finally {
      setLoading(false);
    }
  };

  /* confirm import */
  const handleImport = async () => {
    setLoading(true);

    try {
      await fetch("https://expense-tracker-u6ge.onrender.com/api/import/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId,
          rows: preview,
        }),
      });

      toast.success("Imported successfully");
      setPreview([]);
    } catch {
      toast.error("Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Statement Import</CardTitle>
        <CardDescription>Upload CSV or PDF bank statements</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Select value={accountId} onValueChange={setAccountId}>
          <SelectTrigger>
            <SelectValue placeholder="Account" />
          </SelectTrigger>

          <SelectContent>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={fileType}
          onValueChange={(v: "csv" | "pdf") => setFileType(v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="File Type" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="file"
          accept={fileType === "csv" ? ".csv" : ".pdf"}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <Button onClick={handleParse} disabled={loading}>
          {loading ? "Parsing..." : "Preview Import"}
        </Button>

        {preview.length > 0 && (
          <>
            <div className="border rounded p-2 max-h-60 overflow-y-auto">
              {preview.map((r, i) => (
                <div key={i} className="grid grid-cols-4 text-sm py-1">
                  <div>{r.date}</div>
                  <div>{r.description}</div>
                  <div>{r.amount}</div>
                  <div>{r.category}</div>
                </div>
              ))}
            </div>

            <Button onClick={handleImport} className="w-full">
              Confirm Import
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
