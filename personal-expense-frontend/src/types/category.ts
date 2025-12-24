export interface Category {
  id: string;
  name: string;
  type: "income" | "expense" | "goal";
  icon?: string;
  color?: string;
  isDefault?: boolean;
}