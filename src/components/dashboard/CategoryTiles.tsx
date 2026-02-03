import React, { useState } from 'react';
import { Subscription, Currency } from '@/types';
import { useCurrency } from '@/contexts/CurrencyContext';
import { generateCategoryColorMap, getMonthlyPrice } from '@/lib/categoryColorUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { getBrandIcon } from '@/components/icons/BrandIcons';
import { CreditCard } from 'lucide-react';

interface CategoryTilesProps {
  subscriptions: Subscription[];
  preferredCurrency: Currency;
}

export function CategoryTiles({ subscriptions, preferredCurrency }: CategoryTilesProps) {
  const { convert: convertCurrency, format: formatCurrency } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
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

  const categorySubscriptions = selectedCategory 
    ? subscriptions.filter(sub => sub.category === selectedCategory).sort((a, b) => b.price - a.price)
    : [];
    
  const selectedCategoryTotal = selectedCategory 
    ? categories.find(c => c.name === selectedCategory)?.value || 0
    : 0;

  return (
    <>
    <div className="w-full flex flex-wrap gap-1.5 sm:gap-2">
      {visibleCategories.map((cat) => {
        const percent = (cat.value / totalCost) * 100;
        const color = categoryColors[cat.name] || '#666';
        
        return (
          <div 
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className="rounded-xl flex flex-col items-center justify-center p-2 text-center overflow-hidden transition-transform hover:scale-[1.01] relative shadow-sm cursor-pointer hover:brightness-110 active:scale-95 duration-200"
            style={{ 
              backgroundColor: `${color}25`, 
              border: `1px solid ${color}40`,
              // Treemap-like sizing: larger categories take more space
              // Minimal width of ~15% ensures readability on mobile
              width: `${Math.max(percent, 15)}%`, 
              flexGrow: 0,
              flexShrink: 0,
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

    <Dialog open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white">
            <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-xl font-bold">
                <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[selectedCategory || ''] }}></span>
                    {selectedCategory}
                </span>
                <span className="text-lg font-normal text-zinc-400">
                    {formatCurrency(selectedCategoryTotal, preferredCurrency)}
                    <span className="text-xs ml-1 text-zinc-500">/mois</span>
                </span>
            </DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
               {categorySubscriptions.map(sub => {
                   const Icon = getBrandIcon(sub.name) || CreditCard;
                   return (
                   <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300">
                                <Icon className="h-5 w-5" /> 
                            </div>
                            <div>
                                <div className="font-semibold text-white">{sub.name}</div>
                                <div className="text-xs text-zinc-500 flex items-center gap-1">
                                    {sub.currency !== preferredCurrency && (
                                       <span>{formatCurrency(sub.price, sub.currency)} • </span>
                                    )}
                                    <span className="capitalize">{sub.periodicity || sub.frequency}</span>
                                </div>
                            </div>
                        </div>
                        <div className="font-bold text-white">
                            {formatCurrency(convertCurrency(getMonthlyPrice(sub), sub.currency, preferredCurrency), preferredCurrency)}
                            {sub.periodicity !== 'monthly' && sub.frequency !== 'monthly' && (
                                <span className="text-[10px] text-zinc-500 font-normal ml-1">/mois</span>
                            )}
                        </div>
                   </div>
                   )
               })}
            </div>
        </DialogContent>
    </Dialog>
    </>
  );
}
