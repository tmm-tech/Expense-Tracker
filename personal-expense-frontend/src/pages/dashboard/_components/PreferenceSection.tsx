import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings2 } from "lucide-react";
import { toast } from "sonner";

const CURRENCIES = [
  { value: "KES", label: "KES - Kenyan Shilling" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
];

const DATE_FORMATS = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (US)" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (UK)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (ISO)" },
];

const FISCAL_MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

type Preferences = {
  currency: string;
  dateFormat: string;
  fiscalYearStart: number;
};

export default function PreferencesSection() {
  const queryClient = useQueryClient();

  const [currency, setCurrency] = useState("KES");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [fiscalYearStart, setFiscalYearStart] = useState(1);

  // 🔐 Auth user
  const { data: authUser } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  // ⚙️ Preferences
  const { data: preferences, isLoading } = useQuery<Preferences>({
    queryKey: ["preferences"],
    enabled: !!authUser,
    queryFn: () => apiFetch("/api/users/me/preferences"),
  });

  useEffect(() => {
    if (preferences) {
      setCurrency(preferences.currency);
      setDateFormat(preferences.dateFormat);
      setFiscalYearStart(preferences.fiscalYearStart);
    }
  }, [preferences]);

  const updatePreferences = useMutation({
    mutationFn: (payload: Preferences) =>
      apiFetch("/api/users/me/preferences", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.success("Preferences updated successfully");
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
    },
    onError: () => {
      toast.error("Failed to update preferences");
    },
  });

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 space-y-4 animate-pulse">
          <div className="h-4 w-40 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Display Preferences
        </CardTitle>
        <CardDescription>
          Customize how information is displayed
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Currency */}
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date format */}
        <div className="space-y-2">
          <Label>Date Format</Label>
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger className="glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_FORMATS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fiscal year */}
        <div className="space-y-2">
          <Label>Fiscal Year Start</Label>
          <Select
            value={fiscalYearStart.toString()}
            onValueChange={(v) => setFiscalYearStart(Number(v))}
          >
            <SelectTrigger className="glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FISCAL_MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          className="w-full"
          disabled={updatePreferences.isPending}
          onClick={() =>
            updatePreferences.mutate({
              currency,
              dateFormat,
              fiscalYearStart,
            })
          }
        >
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
}