import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

export function ImportPreviewDialog({
  open,
  onOpenChange,
  rows,
  accountId,
}: any) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);

    try {
      await apiFetch("/import/confirm", {
        method: "POST",
        body: JSON.stringify({
          rows,
          accountId,
        }),
      });

      toast.success("Transactions imported");
      onOpenChange(false);
    } catch {
      toast.error("Import failed");
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Preview Import</DialogTitle>
        </DialogHeader>

        <div className="max-h-[400px] overflow-auto border rounded">
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
              {rows.map((r: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{r.date}</td>
                  <td className="p-2">{r.description}</td>
                  <td className="p-2">{r.amount}</td>
                  <td className="p-2">{r.type}</td>
                  <td className="p-2">{r.categoryName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "Importing..." : "Confirm Import"}
          </Button>

          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}