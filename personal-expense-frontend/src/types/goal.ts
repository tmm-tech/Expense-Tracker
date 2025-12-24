export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: number;
  category: string;
  description?: string;
  status: "active" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high";
  notes?: string;
}