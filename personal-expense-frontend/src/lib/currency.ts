// Currency formatting utilities

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

// Common currencies
export const CURRENCIES: Record<string, Currency> = {
  KES: { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  USD: { code: "USD", symbol: "$", name: "US Dollar" },
  EUR: { code: "EUR", symbol: "€", name: "Euro" },
  GBP: { code: "GBP", symbol: "£", name: "British Pound" },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee" },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  CHF: { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
};

/**
 * Format an amount with currency symbol
 * @param amount - The numeric amount to format
 * @param currencyCode - The currency code (defaults to KES)
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = "KES",
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
  }
): string {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
  } = options || {};

  const currency = CURRENCIES[currencyCode] || CURRENCIES.KES;
  
  const formattedAmount = amount.toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return showSymbol ? `${currency.symbol}${formattedAmount}` : formattedAmount;
}

/**
 * Get currency symbol from code
 * @param currencyCode - The currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currencyCode: string = "KES"): string {
  return CURRENCIES[currencyCode]?.symbol || currencyCode;
}

/**
 * Get currency name from code
 * @param currencyCode - The currency code
 * @returns Currency name
 */
export function getCurrencyName(currencyCode: string = "KES"): string {
  return CURRENCIES[currencyCode]?.name || currencyCode;
}

/**
 * Parse a currency string to a number
 * @param value - The currency string to parse
 * @returns Numeric amount
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and whitespace
  const cleaned = value.replace(/[^0-9.-]/g, "");
  return parseFloat(cleaned) || 0;
}