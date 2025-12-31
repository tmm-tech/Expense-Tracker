import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";

interface InsightsSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalInvested: number;
  currentValue: number;
  investmentReturn: number;
  returnPercentage: string;
  transactionCount: number;
  budgetCount: number;
  investmentCount: number;
}

interface AIInsightsResponse {
  insights: string;
  summary: InsightsSummary;
}

export function AIInsights() {
  const [insights, setInsights] = useState<string | null>(null);
  const [summary, setSummary] = useState<InsightsSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await apiFetch<AIInsightsResponse>("/ai/insights", {
        method: "POST",
      });

      setInsights(result.insights);
      setSummary(result.summary);
      toast.success("AI insights generated successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        `Failed to generate insights: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Financial Insights
              </CardTitle>
              <CardDescription>
                Get personalized financial advice powered by AI
              </CardDescription>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Loading State */}
      {isGenerating && !insights && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full mt-6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {insights && summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard
              title="Data Analyzed"
              rows={[
                ["Transactions", summary.transactionCount],
                ["Budgets", summary.budgetCount],
                ["Investments", summary.investmentCount],
              ]}
            />

            <SummaryCard
              title="Cash Flow"
              rows={[
                ["Income", `KES ${summary.totalIncome.toFixed(2)}`],
                ["Expenses", `KES ${summary.totalExpense.toFixed(2)}`],
                [
                  "Net",
                  `KES ${summary.balance.toFixed(2)}`,
                  summary.balance >= 0 ? "text-accent" : "text-destructive",
                ],
              ]}
            />

            <SummaryCard
              title="Investment Performance"
              rows={[
                ["Invested", `KES ${summary.totalInvested.toFixed(2)}`],
                ["Current", `KES ${summary.currentValue.toFixed(2)}`],
                [
                  "Return",
                  `${summary.investmentReturn >= 0 ? "+" : ""}KES ${summary.investmentReturn.toFixed(
                    2,
                  )} (${summary.returnPercentage}%)`,
                  summary.investmentReturn >= 0
                    ? "text-accent"
                    : "text-destructive",
                ],
              ]}
            />
          </div>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Your Personalized Financial Insights</CardTitle>
              <CardDescription>
                AI-powered analysis and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {insights}
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-muted bg-muted/20">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground text-center">
                <strong>Disclaimer:</strong> AI-generated insights are for
                informational purposes only and not financial advice.
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!insights && !isGenerating && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Insights Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Generate AI-powered analysis of your spending, budgets, and
              investments.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ---------- helper ---------- */

function SummaryCard({
  title,
  rows,
}: {
  title: string;
  rows: [string, React.ReactNode, string?][];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        {rows.map(([label, value, className], i) => (
          <div key={i} className="flex justify-between">
            <span className="text-muted-foreground">{label}:</span>
            <span className={`font-medium ${className ?? ""}`}>{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
