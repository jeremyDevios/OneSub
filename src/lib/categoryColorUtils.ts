import { Subscription, Currency } from '@/types';

export const CATEGORY_COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#06B6D4', // Cyan
];

export const getMonthlyPrice = (sub: Subscription) => {
    if (sub.frequency === 'yearly') return sub.price / 12;
    if (sub.frequency === 'bimonthly') return sub.price / 2;
    if (sub.frequency === 'weekly') return sub.price * 4;
    return sub.price;
}

export function generateCategoryColorMap(
    subscriptions: Subscription[], 
    preferredCurrency: Currency, 
    convertCurrency: (amount: number, from: Currency, to: Currency) => number
): Record<string, string> {
    
    // 1. Calculate value per category
    const categoryValues = subscriptions.reduce((acc, sub) => {
        const monthly = getMonthlyPrice(sub);
        const value = convertCurrency(monthly, sub.currency, preferredCurrency);
        acc[sub.category] = (acc[sub.category] || 0) + value;
        return acc;
    }, {} as Record<string, number>);

    // 2. Sort by value descending
    const sortedCategories = Object.entries(categoryValues)
        .sort((a, b) => b[1] - a[1])
        .map(([name]) => name);

    // 3. Assign colors
    const colorMap: Record<string, string> = {};
    sortedCategories.forEach((cat, index) => {
        colorMap[cat] = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
    });

    return colorMap;
}
