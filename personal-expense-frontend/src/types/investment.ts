export interface Investment {
  id: string;
  name: string;
  type: string;

  // ✅ CORE (source of truth)
  principal: number;
  currentValue: number;

  // ✅ OPTIONAL (for UI only)
  quantity?: number;
  purchasePrice?: number;
  currentPrice?: number;
  symbol?: string;

  // other optional fields
  maturityDate?: any;
  sumAssured?: any;
  premium?: any;
  purchaseDate?: number;
}