export interface Investment {
  maturityDate: any;
  sumAssured: any;
  premium: any;
  id: string;
  name: string;
  type: string;
  symbol?: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: number;
}