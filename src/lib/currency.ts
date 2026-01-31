import { Currency } from "@/types";

const EXCHANGE_RATES: Record<string, number> = {
  EUR: 1, // Base
  USD: 1.08,
  JPY: 161.5,
  CHF: 0.94,
};

export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  
  const fromRate = EXCHANGE_RATES[from] || 1;
  const toRate = EXCHANGE_RATES[to] || 1;

  // Convert to EUR first, then to target
  const amountInEur = amount / fromRate;
  const converted = amountInEur * toRate;
  
  return parseFloat(converted.toFixed(2));
}

export function formatCurrency(amount: number, currency: Currency): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
    }).format(amount);
}
