export interface RecurringTransaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  startDate: number;
  endDate?: number;
}