export interface Investment {
  id: string;
  name: string;
  type: string;

  // ✅ CORE
  principal: number;
  currentValue: number;

  // ✅ OPTIONAL UI FIELDS (fixes your error)
  quantity?: number;
  purchasePrice?: number;
  currentPrice?: number;
  purchaseDate?: number;

  symbol?: string;

  // insurance
  premium?: number;
  sumAssured?: number;
  maturityDate?: number;
}