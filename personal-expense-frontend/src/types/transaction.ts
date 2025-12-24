  export interface Transaction {
    id: string;
    type: "income" | "expense";
    amount: number;
    category: string;
    description: string;
    date: number;
    accountId?: string | null;
  }