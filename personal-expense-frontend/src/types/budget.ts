export type BudgetPeriod = "weekly" | "monthly" | "yearly";

export interface Budget {
  categoryIds: string[];
  limit: number;
  period: BudgetPeriod;
  startDate: number;
}

export interface UpdateBudgetInput extends Budget {
  id: string;
}


