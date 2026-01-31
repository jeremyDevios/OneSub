"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Currency } from "@/types";

interface CurrencyContextType {
  rates: Record<string, number>;
  convert: (amount: number, from: string, to: string) => number;
  format: (amount: number, currency: string) => string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
    rates: {},
    convert: (amount) => amount,
    format: (amount, currency) => `${amount} ${currency}`,
    isLoading: true
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [rates, setRates] = useState<Record<string, number>>({
    EUR: 1,
    USD: 1.05,
    JPY: 157.0,
    CHF: 0.93,
    GBP: 0.83
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/EUR');
        const data = await res.json();
        if (data && data.rates) {
          // Ensure we have at least our supported currencies updated
          setRates(prev => ({ ...prev, ...data.rates }));
        }
      } catch (error) {
        console.error("Failed to fetch rates, using fallback", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRates();
  }, []);

  const convert = (amount: number, from: string, to: string): number => {
    if (from === to) return amount;
    // Base is EUR in our rates map usually
    // If rates are based on EUR:
    // Amount (From) / Rate (From) = Amount (EUR)
    // Amount (EUR) * Rate (To) = Amount (To)
    
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    
    const amountInEur = amount / fromRate;
    const converted = amountInEur * toRate;
    return parseFloat(converted.toFixed(2));
  }

  const format = (amount: number, currency: string): string => {
     try {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency,
        }).format(amount);
     } catch (e) {
        return `${amount.toFixed(2)} ${currency}`;
     }
  }

  return (
    <CurrencyContext.Provider value={{ rates, convert, format, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
