  export interface Debt {
    id: string;
    name: string;
    type:
      | "Credit Card"
      | "Personal Loan"
      | "Mortgage"
      | "Auto Loan"
      | "Student Loan"
      | "Medical Debt"
      | "Other";
    creditor: string;
    originalAmount: number;
    currentBalance: number;
    interestRate: number;
    minimumPayment: number;
    dueDay: number;
    startDate: number;
    status?: "active" | "paid-off" | "defaulted";
    accountId?: string;
    notes?: string;
  }