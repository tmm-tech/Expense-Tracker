  export interface Transaction {
    id: string;
    type: "income" | "expense" | "transfer";
    amount: number;
    categoryId?: string | null;
    description: string;
    date: number;
    accountId?: string | null;
  }