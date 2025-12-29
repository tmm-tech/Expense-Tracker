 export interface Bill {
    id: string;
    name: string;
    category: string;
    amount: number;
    dueDay: number;
    frequency: "one-time" | "weekly" | "monthly" | "quarterly" | "yearly";
    reminderDays: number;
    status: "pending" | "paid" | "overdue";
    autoPayEnabled: boolean;
    isPaid: boolean;
    accountId?: string;
    notes?: string;
  }