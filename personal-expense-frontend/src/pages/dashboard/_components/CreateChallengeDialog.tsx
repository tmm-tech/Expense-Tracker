import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { addDays, addMonths } from "date-fns";
import { apiFetch } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

interface CreateChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ChallengeType =
  | "52-week"
  | "no-spend"
  | "custom-amount"
  | "percentage-save"
  | "round-up";

type Frequency = "daily" | "weekly" | "monthly";

export function CreateChallengeDialog({
  open,
  onOpenChange,
}: CreateChallengeDialogProps) {
  const qc = useQueryClient();

  const [type, setType] = useState<ChallengeType>("52-week");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [duration, setDuration] = useState("52");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setTargetAmount("");
    setFrequency("weekly");
    setDuration("52");
    setCategory("");
    setType("52-week");
  };

  const handleTypeChange = (value: string) => {
    const newType = value as ChallengeType;
    setType(newType);

    if (newType === "52-week") {
      setFrequency("weekly");
      setDuration("52");
      setTargetAmount("137800");
    } else if (newType === "no-spend") {
      setFrequency("daily");
      setDuration("30");
      setTargetAmount("0");
    } else if (newType === "custom-amount") {
      setFrequency("weekly");
      setDuration("12");
      setTargetAmount("");
    } else if (newType === "percentage-save") {
      setFrequency("monthly");
      setDuration("12");
      setTargetAmount("");
    } else if (newType === "round-up") {
      setFrequency("daily");
      setDuration("90");
      setTargetAmount("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const startDate = Date.now();
      const durationNum = Number(duration);

      let endDate: number;
      if (frequency === "daily") {
        endDate = addDays(startDate, durationNum).getTime();
      } else if (frequency === "weekly") {
        endDate = addDays(startDate, durationNum * 7).getTime();
      } else {
        endDate = addMonths(startDate, durationNum).getTime();
      }

      await apiFetch("/api/savings-challenges", {
        method: "POST",
        body: JSON.stringify({
          name: name || getChallengePresetName(type),
          type,
          description: description || getChallengePresetDescription(type),
          targetAmount:
            Number(targetAmount) || getChallengePresetTarget(type),
          startDate,
          endDate,
          frequency,
          category: category || undefined,
        }),
      });

      toast.success("Challenge created successfully!");
      qc.invalidateQueries({ queryKey: ["savings-challenges"] });
      qc.invalidateQueries({ queryKey: ["savings-challenges-summary"] });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create challenge");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Savings Challenge</DialogTitle>
          <DialogDescription>
            Start a new savings challenge to reach your financial goals
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Challenge Type</Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="52-week">52-Week Challenge</SelectItem>
                <SelectItem value="no-spend">No-Spend Challenge</SelectItem>
                <SelectItem value="custom-amount">Custom Amount</SelectItem>
                <SelectItem value="percentage-save">
                  Percentage Save
                </SelectItem>
                <SelectItem value="round-up">Round-Up Savings</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getChallengeTypeDescription(type)}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Challenge Name (Optional)</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={getChallengePresetName(type)}
            />
          </div>

          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={getChallengePresetDescription(type)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Target Amount (KES)</Label>
            <Input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={frequency}
                onValueChange={(v) => setFrequency(v as Frequency)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Duration (
                {frequency === "daily"
                  ? "days"
                  : frequency === "weekly"
                  ? "weeks"
                  : "months"}
                )
              </Label>
              <Input
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category (Optional)</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Emergency Fund"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Creating..." : "Create Challenge"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- helpers ---------------- */

function getChallengePresetName(type: string): string {
  return {
    "52-week": "52-Week Savings Challenge",
    "no-spend": "30-Day No-Spend Challenge",
    "custom-amount": "Custom Savings Goal",
    "percentage-save": "Monthly Percentage Savings",
    "round-up": "Round-Up Challenge",
  }[type] ?? "Savings Challenge";
}

function getChallengePresetDescription(type: string): string {
  return {
    "52-week": "Save an incrementing amount each week for 52 weeks",
    "no-spend": "Avoid non-essential spending for a set period",
    "custom-amount": "Set your own savings target and timeline",
    "percentage-save": "Save a percentage of your income monthly",
    "round-up": "Round up purchases and save the difference",
  }[type] ?? "";
}

function getChallengeTypeDescription(type: string): string {
  return {
    "52-week":
      "Save KES 100 week 1, KES 200 week 2, up to KES 5,200 (Total: 137,800)",
    "no-spend":
      "Commit to zero discretionary spending for a fixed duration",
    "custom-amount": "Choose your own target amount and schedule",
    "percentage-save": "Automatically save part of your income",
    "round-up": "Round up spending and save the extra",
  }[type] ?? "";
}

function getChallengePresetTarget(type: string): number {
  return {
    "52-week": 137800,
    "no-spend": 0,
    "custom-amount": 50000,
    "percentage-save": 100000,
    "round-up": 10000,
  }[type] ?? 50000;
}