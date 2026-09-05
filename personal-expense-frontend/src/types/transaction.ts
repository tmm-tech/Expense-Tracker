export interface Transaction {
  id: string;

  type: "income" | "expense" | "transfer";

  amount: number;

  categoryId?: string | null;

  description: string;

  date: number | string;

  accountId?: string | null;

  transferId?: string | null;

  transferAccountId?: string | null;

  transferDirection?: "outgoing" | "incoming" | null;
}


export interface Transfer {
  id: string;
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransferResponse {
  success: boolean;
  message: string;
  data: {
    transfer: Transfer;
    outgoingTransaction: Transaction;
    incomingTransaction: Transaction;
  };
}