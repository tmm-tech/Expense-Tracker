export type AccountType =
  | "Bank"
  | "MMF"
  | "SACCO"
  | "Cash"
  | "Mpesa"
  | "Credit Card"
  | "Debit Card"
  | "Other";
export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  institution?: string;
  accountNumber?: string;
  currency?: string;
  color?: string;
}