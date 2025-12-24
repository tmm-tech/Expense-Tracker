import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Plus,
  Flame,
  Calendar,
  TrendingUp,
  Target,
  CheckCircle2,
  Award,
} from "lucide-react";

/* =========================
   Types (REST)
========================= */

interface Milestone {
  amount: number;
  achieved: boolean;
  achievedDate?: number;
  reward?: string;
}

interface Contribution {
  id: string;
  amount: number;
  date: number;
  notes?: string;
  weekNumber?: number;
}

interface SavingsChallenge {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  status: "active" | "paused" | "completed";
  startDate: number;
  endDate: number;
  streakDays: number;
  totalContributions: number;
  milestones: Milestone[];
}

interface ChallengeDetailDialogProps {
  challengeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* =========================
   Component
========================= */

export function ChallengeDetailDialog({
  challengeId,
  open,
  onOpenChange,
}: ChallengeDetailDialogProps) {
  const [challenge, setChallenge] = useState<SavingsChallenge | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [showAddContribution, setShowAddContribution] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* -------------------------
     Load data
  -------------------------- */
  useEffect(() => {
    if (!open) return;

    Promise.all([
      apiFetch(`/api/savings-challenges/${challengeId}`),
      apiFetch(`/api/savings-challenges/${challengeId}/contributions`),
    ])
      .then(([challengeRes, contributionsRes]) => {
        setChallenge(challengeRes as SavingsChallenge);
        setContributions(contributionsRes as Contribution[]);
      })
      .catch(() => {
        toast.error("Failed to load challenge details");
      });
  }, [challengeId, open]);

  if (!challenge) return null;

  const progressPercentage =
    (challenge.currentAmount / challenge.targetAmount) * 100;
  const remainingAmount =
    challenge.targetAmount - challenge.currentAmount;
  const isCompleted = challenge.status === "completed";

  /* -------------------------
     Actions
  -------------------------- */
const handleAddContribution = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    await apiFetch(
      `/api/savings-challenges/${challengeId}/contributions`,
      {
        method: "POST",
        body: JSON.stringify({
          amount: Number(amount),
          notes: notes || undefined,
        }),
      }
    );

    toast.success("Contribution added");
    setAmount("");
    setNotes("");
    setShowAddContribution(false);

    // Reload (TYPED)
    const [updatedChallenge, updatedContributions] =
      await Promise.all([
        apiFetch<SavingsChallenge>(
          `/api/savings-challenges/${challengeId}`
        ),
        apiFetch<Contribution[]>(
          `/api/savings-challenges/${challengeId}/contributions`
        ),
      ]);

    setChallenge(updatedChallenge);
    setContributions(updatedContributions);
  } catch {
    toast.error("Failed to add contribution");
  } finally {
    setIsSubmitting(false);
  }
};


  const handlePauseResume = async () => {
    try {
      await apiFetch(`/api/savings-challenges/${challengeId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status:
            challenge.status === "active" ? "paused" : "active",
        }),
      });

      toast.success(
        challenge.status === "active"
          ? "Challenge paused"
          : "Challenge resumed"
      );

      setChallenge({
        ...challenge,
        status:
          challenge.status === "active" ? "paused" : "active",
      });
    } catch {
      toast.error("Failed to update challenge");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this challenge? This cannot be undone."
      )
    )
      return;

    try {
      await apiFetch(`/api/savings-challenges/${challengeId}`, {
        method: "DELETE",
      });
      toast.success("Challenge deleted");
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete challenge");
    }
  };

  /* =========================
     UI
  ========================= */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">
            {challenge.name}
          </DialogTitle>
          {challenge.description && (
            <DialogDescription>
              {challenge.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Total Progress
              </span>
              <span className="font-bold">
                {progressPercentage.toFixed(1)}%
              </span>
            </div>

            <Progress value={progressPercentage} className="h-3" />

            <div className="flex justify-between text-sm">
              <span>
                KES {challenge.currentAmount.toLocaleString()}
              </span>
              <span>
                KES {challenge.targetAmount.toLocaleString()}
              </span>
            </div>

            {!isCompleted && (
              <div className="p-3 rounded-lg bg-primary/5 border">
                Remaining:{" "}
                <strong>
                  KES {remainingAmount.toLocaleString()}
                </strong>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat icon={<TrendingUp />} label="Contributions" value={challenge.totalContributions} />
            <Stat icon={<Flame />} label="Streak" value={`${challenge.streakDays} days`} />
            <Stat icon={<Calendar />} label="Start" value={format(challenge.startDate, "MMM dd")} />
            <Stat icon={<Target />} label="End" value={format(challenge.endDate, "MMM dd")} />
          </div>

          {/* Add Contribution */}
          {!isCompleted && challenge.status === "active" && (
            <>
              {!showAddContribution ? (
                <Button onClick={() => setShowAddContribution(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contribution
                </Button>
              ) : (
                <form
                  onSubmit={handleAddContribution}
                  className="space-y-3 p-4 border rounded-lg"
                >
                  <Label>Amount (KES)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />

                  <Label>Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddContribution(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            {!isCompleted && (
              <Button
                variant="outline"
                onClick={handlePauseResume}
                className="flex-1"
              >
                {challenge.status === "active" ? "Pause" : "Resume"}
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* =========================
   Helper
========================= */

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}