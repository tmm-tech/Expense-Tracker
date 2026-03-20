import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { apiFetch } from "@/lib/api";
import type { Investment } from "@/types/investment";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/* ---------------- TYPES ---------------- */

interface InvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  investments: Investment[];
}

/* ---------------- CONSTANTS ---------------- */

const INVESTMENT_TYPES = [
  "Stocks",
  "Bonds",
  "Crypto",
  "Real Estate",
  "Mutual Funds",
  "Money Market Fund",
  "ETFs",
  "Insurance (With-Profit)",
  "Other",
] as const;

type InvestmentType = (typeof INVESTMENT_TYPES)[number];

/* ---------------- COMPONENT ---------------- */

export function InvestmentDialog({
  open,
  onOpenChange,
  editingId,
  investments,
}: InvestmentDialogProps) {
  const queryClient = useQueryClient();

  const editingInvestment = editingId
    ? investments.find((i) => i.id === editingId)
    : null;

  const [type, setType] = useState<InvestmentType>("Stocks");
  const [premium, setPremium] = useState("");
  const [sumAssured, setSumAssured] = useState("");
  const [maturityDate, setMaturityDate] = useState("");

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const isInsurance = type === "Insurance (With-Profit)";
  const isMMF = type === "Money Market Fund";
  /* ---------- Sync form ---------- */

  useEffect(() => {
    if (editingInvestment) {
      setType(editingInvestment.type as InvestmentType);
      setName(editingInvestment.name);
      setPurchasePrice(editingInvestment.purchasePrice?.toString() || "");
      setCurrentPrice(editingInvestment.currentPrice?.toString() || "");

      setPurchaseDate(
        editingInvestment.purchaseDate
          ? format(new Date(editingInvestment.purchaseDate), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
      );
    } else {
      resetForm();
    }
  }, [editingInvestment, open]);

  const resetForm = () => {
    setType("Stocks");
    setName("");
    setSymbol("");
    setQuantity("");
    setPurchasePrice("");
    setCurrentPrice("");
    setPurchaseDate(format(new Date(), "yyyy-MM-dd"));
  };

  /* ---------- Mutations ---------- */
  type InvestmentPayload = Omit<Investment, "id"> & {
    quantity?: number;
    purchasePrice?: number;
    currentPrice?: number;
  };
  const createInvestment = useMutation({
    mutationFn: (payload: InvestmentPayload) =>
      apiFetch<Investment>("/investments", {
        method: "POST",
        body: JSON.stringify(payload),
      }),

    onMutate: async (newInvestment) => {
      await queryClient.cancelQueries({ queryKey: ["investments"] });

      const previous =
        queryClient.getQueryData<Investment[]>(["investments"]) ?? [];

      const optimistic: Investment = {
        id: `temp-${Date.now()}`,
        ...newInvestment,
      };

      queryClient.setQueryData<Investment[]>(
        ["investments"],
        [optimistic, ...previous],
      );

      return { previous };
    },

    onError: (_err, _payload, ctx) => {
      queryClient.setQueryData(["investments"], ctx?.previous);
      toast.error("Failed to add investment");
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast.success("Investment added");
      resetForm();
      onOpenChange(false);
    },
  });

  const updateInvestment = useMutation({
    mutationFn: (payload: Investment) =>
      apiFetch<Investment>(`/investments/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),

    onMutate: async (updated) => {
      await queryClient.cancelQueries({ queryKey: ["investments"] });

      const previous =
        queryClient.getQueryData<Investment[]>(["investments"]) ?? [];

      queryClient.setQueryData<Investment[]>(["investments"], (old = []) =>
        old.map((i) => (i.id === updated.id ? updated : i)),
      );

      return { previous };
    },

    onError: (_err, _payload, ctx) => {
      queryClient.setQueryData(["investments"], ctx?.previous);
      toast.error("Failed to update investment");
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      toast.success("Investment updated");
      resetForm();
      onOpenChange(false);
    },
  });

  
  /* ---------- Submit ---------- */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !purchasePrice || !currentPrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    const qty = Number(quantity) || 0;
    const buyPrice = Number(purchasePrice) || 0;
    const currPrice = Number(currentPrice) || 0;

    let principal = 0;
    let currentValue = 0;

    if (isInsurance) {
      principal = Number(premium || 0);
      currentValue = Number(sumAssured || 0);
    } else if (isMMF) {
      principal = Number(purchasePrice || 0); // deposit
      currentValue = Number(currentPrice || 0); // current balance
    } else {
      principal = qty * buyPrice;
      currentValue = qty * currPrice;
    }

    const payload = {
      type,
      name,
      symbol: isInsurance ? undefined : symbol || undefined,

      // ✅ REQUIRED (fixes your TS errors)
      principal,
      currentValue,

      // ✅ OPTIONAL UI fields (safe)
      quantity: isInsurance || isMMF ? 1 : qty,
      purchasePrice: buyPrice,
      currentPrice: currPrice,
      purchaseDate: purchaseDate ? new Date(purchaseDate).getTime() : undefined,

      premium: isInsurance ? Number(premium || 0) : undefined,
      sumAssured: isInsurance ? Number(sumAssured || 0) : undefined,
      maturityDate: maturityDate ? new Date(maturityDate).getTime() : undefined,
    };

    if (editingInvestment) {
      updateInvestment.mutate({
        id: editingInvestment.id,
        ...payload,
      });
    } else {
      createInvestment.mutate(payload);
    }
  };

  /* ---------- UI ---------- */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {editingId ? "Edit Investment" : "Add Investment"}
          </DialogTitle>
          <DialogDescription>
            {editingId
              ? "Update your investment details"
              : "Add a new investment to your portfolio"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type / Symbol */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as InvestmentType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVESTMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isInsurance && (
              <div className="space-y-2">
                <Label>Symbol</Label>
                <Input
                  placeholder="AAPL, BTC"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                />
              </div>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              placeholder="Apple Inc, Bitcoin"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Quantity / Date */}
          <div className="grid grid-cols-2 gap-4">
            {!isInsurance && !isMMF && (
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  step="0.00000001"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Purchase Date *</Label>
              <Input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {" "}
                {isMMF ? "Deposit Amount (KES)" : "Purchase Price *"}
              </Label>
              <Input
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {" "}
                {isMMF ? "Current Value (KES)" : "Current Price *"}
              </Label>
              <Input
                type="number"
                step="0.01"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
              />
            </div>
          </div>
          {isInsurance && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Premium (KES)</Label>
                <Input
                  type="number"
                  value={premium}
                  onChange={(e) => setPremium(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Sum Assured (KES)</Label>
                <Input
                  type="number"
                  value={sumAssured}
                  onChange={(e) => setSumAssured(e.target.value)}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Maturity Date</Label>
                <Input
                  type="date"
                  value={maturityDate}
                  onChange={(e) => setMaturityDate(e.target.value)}
                />
              </div>
            </div>
          )}
          {isMMF && (
            <p className="text-xs text-muted-foreground">
              Interest Earned:{" "}
              <span className="text-accent font-medium">
                KES{" "}
                {(
                  Number(currentPrice || 0) - Number(purchasePrice || 0)
                ).toFixed(2)}
              </span>
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingId ? "Update" : "Add"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
