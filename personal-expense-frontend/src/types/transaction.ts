  export interface Transaction {
    id: string;
    type: "income" | "expense";
    amount: number;
    categoryId?: string;
    description: string;
    date: number;
    accountId?: string | null;
  }