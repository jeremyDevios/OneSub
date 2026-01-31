import React from 'react';
import { Subscription, Currency } from '@/types';
import { useCurrency } from '@/contexts/CurrencyContext';
import { generateCategoryColorMap, getMonthlyPrice } from '@/lib/categoryColorUtils';

interface CategoryTilesProps {
  subscriptions: Subscription[];
  preferredCurrency: Currency;
}

export function CategoryTiles({ subscriptions, preferredCurrency }: CategoryTilesProps) {
  const { convert: convertCurrency, format: formatCurrency } = useCurrency();
  const categoryColors = generateCategoryColorMap(subscriptions, preferredCurrency, convertCurrency);

  const totalCost = subscriptions.reduce((acc, sub) => {
    const monthly = getMonthlyPrice(sub);
    return acc + convertCurrency(monthly, sub.currency, preferredCurrency);
  }, 0);

  const categories = Object.entries(subscriptions.reduce((acc, sub) => {
    const monthly = getMonthlyPrice(sub);
    const value = convertCurrency(monthly, sub.currency, preferredCurrency);
    acc[sub.category] = (acc[sub.category] || 0) + value;
    return acc;
  }, {} as Record<string, number>))
  .map(([name, value]) => ({ name, value }))
  .sort((a, b) => b.value - a.value);

  // Filter out very small categories (< 1% instead of 3%) or show all
  const visibleCategories = categories.filter(c => (c.value / totalCost) > 0.01);

  return (
    <div className="w-full flex flex-wrap gap-1.5 sm:gap-2">
      {visibleCategories.map((cat) => {
        const percent = (cat.value / totalCost) * 100;
        const color = categoryColors[cat.name] || '#666';
        
        return (
          <div 
            key={cat.name}
            className="rounded-xl flex flex-col items-center justify-center p-2 text-center overflow-hidden transition-transform hover:scale-[1.01] relative shadow-sm"
            style={{ 
              backgroundColor: `${color}25`, 
              border: `1px solid ${color}40`,
              // Treemap-like sizing: larger categories take more space
              // Minimal width of ~15-20% ensures readability on mobile
              flexBasis: `${Math.max(percent, 20)}%`, 
              flexGrow: 1,
              minHeight: '80px',
            }}
          >
            <h3 className="text-white font-semibold text-xs sm:text-sm truncate w-full px-1">{cat.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
                <span className="text-white/70 text-[10px] sm:text-xs bg-black/20 px-1.5 py-0.5 rounded">{Math.round(percent)}%</span>
                <span className="text-white font-bold text-[10px] sm:text-sm" style={{ color: color }}>
                    {formatCurrency(cat.value, preferredCurrency)}
                </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
