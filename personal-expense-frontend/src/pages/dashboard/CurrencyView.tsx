import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  CoinsIcon,
  ArrowRightLeftIcon,
  TrendingUpIcon,
  CheckIcon,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

interface CurrencyData {
  code: string;
  name: string;
  symbol: string;
  rateToUSD: number;
}

export default function CurrencyView() {
  // ---------------- Queries ----------------
  const { data: currencies, isLoading: currenciesLoading } = useQuery<
    CurrencyData[]
  >({
    queryKey: ["currencies"],
    queryFn: async () => {
      const res = await fetch("/api/currencies");
      if (!res.ok) throw new Error("Failed to fetch currencies");
      return res.json();
    },
  });

  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await fetch("/api/users/current");
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (settings: { currency: string }) => {
      const res = await fetch("/api/users/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
  });

  // ---------------- Local state ----------------
  const [fromCurrency, setFromCurrency] = useState("KES");
  const [toCurrency, setToCurrency] = useState("USD");
  const [amount, setAmount] = useState("1000");

  const { data: exchangeRate } = useQuery({
    queryKey: ["exchangeRate", fromCurrency, toCurrency],
    queryFn: async () => {
      const res = await fetch(
        `/api/currencies/exchange-rate?from=${fromCurrency}&to=${toCurrency}`,
      );
      return res.json();
    },
    enabled: !!fromCurrency && !!toCurrency,
  });

  const { data: convertedAmount } = useQuery<number>({
    queryKey: ["convert", amount, fromCurrency, toCurrency],
    queryFn: async () => {
      const res = await fetch(
        `/api/currencies/convert?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`,
      );
      return res.json();
    },
    enabled: !!amount && !!fromCurrency && !!toCurrency,
  });

  const handleSetDefaultCurrency = async (code: string) => {
    try {
      await updateSettings.mutateAsync({ currency: code });
      toast.success(`Default currency set to ${code}`);
    } catch {
      toast.error("Failed to update default currency");
    }
  };

  // ---------------- Loading state ----------------
  if (currenciesLoading || userLoading || !currencies || !currentUser) {
    return <Skeleton className="h-96 w-full" />;
  }

  const userCurrency = currentUser.currency ?? "KES";

  // ---------------- UI ----------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500">
          <CoinsIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Currency Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage currencies and exchange rates
          </p>
        </div>
      </div>

      {/* Converter */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Converter</CardTitle>
          <CardDescription>Convert between currencies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code} – {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code} – {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {exchangeRate && convertedAmount !== undefined && (
            <div className="rounded border p-3">
              <p className="text-sm">
                1 {fromCurrency} = {exchangeRate.rate.toFixed(4)} {toCurrency}
              </p>
              <p className="text-lg font-bold text-emerald-500">
                {convertedAmount.toFixed(2)}
              </p>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => {
              setFromCurrency(toCurrency);
              setToCurrency(fromCurrency);
            }}
          >
            <ArrowRightLeftIcon className="mr-2 h-4 w-4" />
            Swap
          </Button>
        </CardContent>
      </Card>

      {/* Currency List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Currencies</CardTitle>
          <CardDescription>
            Default: <strong>{userCurrency}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {currencies.map((c) => {
            const isDefault = c.code === userCurrency;
            return (
              <div
                key={c.code}
                className="flex items-center justify-between rounded border p-3"
              >
                <div>
                  <p className="font-semibold">{c.code}</p>
                  <p className="text-xs text-muted-foreground">{c.name}</p>
                </div>

                {isDefault ? (
                  <Badge>Default</Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSetDefaultCurrency(c.code)}
                  >
                    Set Default
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}