import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import {
  Target,
  Trophy,
  Flame,
  Plus,
  Calendar,
  Award,
} from "lucide-react";
import { format } from "date-fns";
import { apiFetch } from "@/lib/api";
import { CreateChallengeDialog } from "@/pages/dashboard/_components/CreateChallengeDialog.tsx";
import { ChallengeDetailDialog } from "@/pages/dashboard/_components/ChallengeDetailsDialog.tsx";


export function SavingsChallengesView() {
    interface Milestone {
  achieved: boolean;
  reward?: string;
}

interface SavingsChallenge {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: "active" | "completed";
  currentAmount: number;
  targetAmount: number;
  endDate: number;
  streakDays: number;
  milestones: Milestone[];
}

interface ChallengesSummary {
  totalSaved: number;
  activeChallenges: number;
  completedChallenges: number;
  totalMilestones: number;
}

const { data: challenges, isLoading: challengesLoading } =
  useQuery<SavingsChallenge[]>({
    queryKey: ["savings-challenges"],
    queryFn: () => apiFetch("https://expense-tracker-u6ge.onrender.com/api/savings-challenges"),
  });

const { data: summary, isLoading: summaryLoading } =
  useQuery<ChallengesSummary>({
    queryKey: ["savings-challenges-summary"],
    queryFn: () => apiFetch("https://expense-tracker-u6ge.onrender.com/api/savings-challenges/summary"),
  });

const [createOpen, setCreateOpen] = useState(false);
const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);


  if (challenges === undefined || summary === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const activeChallenges = challenges.filter((c) => c.status === "active");
  const completedChallenges = challenges.filter((c) => c.status === "completed");

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="glass-card border-primary/20">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground">Total Saved</p>
                <p className="text-base md:text-xl font-bold truncate">KES {summary.totalSaved.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/20">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Flame className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground">Active</p>
                <p className="text-base md:text-xl font-bold">{summary.activeChallenges}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-green-500/20">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground">Completed</p>
                <p className="text-base md:text-xl font-bold">{summary.completedChallenges}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-yellow-500/20">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Award className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground">Milestones</p>
                <p className="text-base md:text-xl font-bold">{summary.totalMilestones}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Challenges */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold">Active Challenges</h2>
          <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Challenge</span>
          </Button>
        </div>

        {activeChallenges.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Target />
              </EmptyMedia>
              <EmptyTitle>No active challenges</EmptyTitle>
              <EmptyDescription>Start a savings challenge to reach your financial goals!</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" onClick={() => setCreateOpen(true)}>Create Challenge</Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid md:grid-cols-2 gap-3 md:gap-4">
            {activeChallenges.map((challenge) => (
              <Card
                key={challenge.id}
                className="glass-card hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setSelectedChallengeId(challenge.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base md:text-lg truncate">{challenge.name}</CardTitle>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">{challenge.description}</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 border-primary/20 shrink-0">
                      {getChallengeTypeLabel(challenge.type)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs md:text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">
                        {((challenge.currentAmount / challenge.targetAmount) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={(challenge.currentAmount / challenge.targetAmount) * 100}
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-xs mt-2">
                      <span className="text-muted-foreground">
                        KES {challenge.currentAmount.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        KES {challenge.targetAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Ends {format(challenge.endDate, "MMM dd, yyyy")}</span>
                    </div>
                    {challenge.streakDays > 0 && (
                      <div className="flex items-center gap-1 text-orange-500">
                        <Flame className="w-3 h-3" />
                        <span>{challenge.streakDays} day{challenge.streakDays !== 1 ? "s" : ""}</span>
                      </div>
                    )}
                  </div>

                  {/* Milestones */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {challenge.milestones.map((milestone, idx) => (
                      <div
                        key={idx}
                        className={`text-lg ${
                          milestone.achieved ? "opacity-100" : "opacity-30"
                        }`}
                      >
                        {milestone.reward?.split(" ")[0] || "🎯"}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-lg md:text-xl font-semibold">Completed Challenges</h2>
          <div className="grid md:grid-cols-2 gap-3 md:gap-4">
            {completedChallenges.map((challenge) => (
              <Card
                key={challenge.id}
                className="glass-card border-green-500/20 cursor-pointer hover:border-green-500/40 transition-colors"
                onClick={() => setSelectedChallengeId(challenge.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base md:text-lg truncate">{challenge.name}</CardTitle>
                      <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">{challenge.description}</p>
                    </div>
                    <Trophy className="w-5 h-5 text-green-500 shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Saved</span>
                    <span className="text-base md:text-lg font-bold text-green-500">
                      KES {challenge.currentAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {challenge.milestones.map((milestone, idx) => (
                      <span key={idx} className="text-lg">
                        {milestone.reward?.split(" ")[0] || "🎯"}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <CreateChallengeDialog open={createOpen} onOpenChange={setCreateOpen} />
      {selectedChallengeId && (
        <ChallengeDetailDialog
          challengeId={selectedChallengeId}
          open={!!selectedChallengeId}
          onOpenChange={(open) => !open && setSelectedChallengeId(null)}
        />
      )}
    </div>
  );
}

function getChallengeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    "52-week": "52 Week",
    "no-spend": "No Spend",
    "custom-amount": "Custom",
    "percentage-save": "Percentage",
    "round-up": "Round Up",
  };
  return labels[type] || type;
}