export type BudgetPeriod = "weekly" | "monthly" | "yearly";

export interface Budget {
  id: string;
  name: string;
  amount: number;
  startDate: number;
  endDate: number;
  categoryIds: string[];
  period: BudgetPeriod;
  limit: number;
}

export type CreateBudgetInput = {
  name: string;
  amount: number;
  startDate: number;
  endDate: number;
  categoryIds: string[];
  period: BudgetPeriod;
  limit: number;
};

export type UpdateBudgetInput = {
  id: string;
} & Partial<CreateBudgetInput>;
