import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDate, getMonth, differenceInCalendarMonths, differenceInCalendarDays, isBefore, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Subscription } from '@/types';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getBrandIcon } from "@/components/icons/BrandIcons";
import * as LucideIcons from "lucide-react";

interface CalendarViewProps {
  subscriptions: Subscription[];
}

export function CalendarView({ subscriptions }: CalendarViewProps) {
  const { format: formatCurrency } = useCurrency();
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Offset for the first day of the week (Mon or Sun)
  // Let's assume standard grid starting Monday, using empty divs?
  // Or simple flex/grid. Grid with 7 cols is best.
  // We need to know which day of week monthStart is to add padding.
  // fr locale starts on Monday (1) usually.
  let startDay = monthStart.getDay(); // Sunday is 0
  startDay = startDay === 0 ? 7 : startDay; // Make Sunday 7 for 1-based index (Mon=1, ..., Sun=7)
  const paddingDays = Array.from({ length: startDay - 1 });

  const getSubsForDay = (day: Date) => {
    return subscriptions.filter(sub => {
       const subNextDate = sub.nextPaymentDate instanceof Date ? sub.nextPaymentDate : (sub.nextPaymentDate as any).toDate();
       const dayNum = getDate(day);
       
       // Don't show payments before the next payment date (simplified logic)
       // actually we might want to see history if we go back, but for now lets stick to forward projection relative to nextPaymentDate
       // But wait, if nextPaymentDate is in the future (next month), and we look at *current* month, we might technically have passed a payment?
       // Let's assume nextPaymentDate is the *next* one. So we only project forward or on that date.
       // However, for consistency in calendar navigation, if I navigate 2 years forward, I want to see it.
       
       // Better logic: Calculate if 'day' is a valid payment occurrence relative to 'subNextDate'
       // We only care about matching the pattern.
       
       // Base checks: Day must be same/after the start of the subscription? We don't have start date, only nextPaymentDate.
       // Let's assume the pattern anchors on nextPaymentDate.
       
       // If day < startOfDay(subNextDate), generally we shouldn't show it if we assume nextPaymentDate is strict. 
       // But if nextPaymentDate is in 2 months, does that mean no payment this month? Yes.
       // if (isBefore(day, startOfDay(subNextDate))) return false; // Allowed past occurrences for history view

       if (sub.frequency === 'monthly') {
          const targetDay = Math.min(getDate(subNextDate), getDate(monthEnd));
          return dayNum === targetDay;
       } 
       
       if (sub.frequency === 'yearly') {
          return getDate(subNextDate) === dayNum && getMonth(subNextDate) === getMonth(day);
       }

       if (sub.frequency === 'bimonthly') {
          // Check if month difference is even
          const diffMonths = differenceInCalendarMonths(day, subNextDate);
          if (diffMonths % 2 !== 0) return false;
          
          const targetDay = Math.min(getDate(subNextDate), getDate(monthEnd));
          return dayNum === targetDay;
       }

       if (sub.frequency === 'weekly') {
           const diffDays = differenceInCalendarDays(day, subNextDate);
           return diffDays % 7 === 0;
       }

       return false;
    });
  };

  // Helper for icons
  const getIconComponent = (sub: Subscription) => {
      if (sub.icon) {
          const Brand = getBrandIcon(sub.icon);
          if (Brand) return Brand;
          const Lucide = (LucideIcons as any)[sub.icon];
          if (Lucide) return Lucide;
      }
      return LucideIcons.HelpCircle;
  };

  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [selectedDayInfo, setSelectedDayInfo] = useState<{ day: Date; subs: Subscription[] } | null>(null);

  const handleDayClick = (day: Date, daySubs: Subscription[]) => {
      if (daySubs.length > 0) {
          setSelectedDayInfo({ day, subs: daySubs });
      } else {
          setSelectedDayInfo(null);
      }
  };

  return (
    <div className="bg-[#1e1e2e] rounded-3xl p-6 shadow-2xl text-white w-full h-full flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </h2>
        <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5 text-zinc-400" />
            </button>
             <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ChevronRight className="w-5 h-5 text-zinc-400" />
            </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 grid-rows-auto gap-1 sm:gap-2 text-center flex-1 min-h-[300px]">
         {/* Weekday Headers */}
         {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
             <div key={`${d}-${i}`} className="text-zinc-500 text-xs sm:text-sm font-medium py-2">
                 {d}
             </div>
         ))}
         
         {/* Padding Days */}
         {paddingDays.map((_, i) => <div key={`pad-${i}`} />)}

         {/* Days */}
         {days.map(day => {
             const daySubs = getSubsForDay(day);
             const isSelected = selectedDayInfo && isSameDay(day, selectedDayInfo.day);
             const isToday = isSameDay(day, new Date());
             const isPast = isBefore(day, startOfDay(new Date()));
             const hasSubs = daySubs.length > 0;
             
             return (
                 <div 
                    key={day.toString()} 
                    onClick={() => handleDayClick(day, daySubs)}
                    className={`aspect-square sm:aspect-auto flex flex-col items-center justify-center relative group rounded-xl transition-all cursor-pointer
                        ${isSelected 
                            ? 'bg-white/10 ring-2 ring-brand' 
                            : hasSubs 
                                ? (isPast ? 'bg-emerald-900/40 hover:bg-emerald-900/50' : 'bg-orange-500/15 hover:bg-orange-500/25')
                                : 'hover:bg-white/5'
                        }
                    `}
                 >
                     <span className={`text-lg sm:text-xl font-medium transition-all ${
                         isToday 
                         ? 'bg-brand text-white w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-lg shadow-brand/20' 
                         : 'text-zinc-400 group-hover:text-white'
                     }`}>
                        {getDate(day)}
                     </span>
                     
                     {/* Icons Overlay */}
                     {hasSubs && (
                         <div className="absolute bottom-1 right-1 flex -space-x-2 overflow-hidden">
                             {daySubs.slice(0, 3).map((sub, idx) => {
                                 const Icon = getIconComponent(sub);
                                 return (
                                     <div key={`${sub.id}-${idx}`} className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border-2 border-[#1e1e2e] flex items-center justify-center relative bg-zinc-800 text-white" style={{ backgroundColor: sub.color || '#333', zIndex: 10 + idx }}>
                                         <Icon className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-white" />
                                     </div>
                                 )
                             })}
                             {daySubs.length > 3 && (
                                  <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-zinc-700 border-2 border-[#1e1e2e] flex items-center justify-center text-[7px] sm:text-[9px] z-20 text-white">
                                      +{daySubs.length - 3}
                                  </div>
                             )}
                         </div>
                     )}
                 </div>
             )
         })}
      </div>

      {/* Details Overlay (Mobile/Desktop) */}
      {selectedDayInfo && (
        <div className="absolute inset-x-4 bottom-4 top-20 bg-black/80 backdrop-blur-md rounded-2xl p-4 z-50 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 flex flex-col" onClick={() => setSelectedDayInfo(null)}>
            <div className="flex justify-between items-center mb-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white">
                    {format(selectedDayInfo.day, 'd MMMM', { locale: fr })}
                </h3>
                <button onClick={() => setSelectedDayInfo(null)} className="p-2 hover:bg-white/10 rounded-full">
                    <LucideIcons.X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="space-y-2 flex-1" onClick={e => e.stopPropagation()}>
                {selectedDayInfo.subs.map(sub => {
                    const Icon = getIconComponent(sub);
                    return (
                        <div key={sub.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg" style={{ backgroundColor: sub.color || '#333' }}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-white truncate">{sub.name}</div>
                                <div className="text-xs text-zinc-400 truncate">{sub.category}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-brand text-lg">
                                    {formatCurrency(sub.price, sub.currency)}
                                </div>
                                <div className="text-xs text-zinc-500">
                                    {sub.frequency === 'monthly' ? '/ mois' : '/ an'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
             <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-end">
                <span className="text-zinc-400 pb-1">Total à payer</span>
                <span className="text-2xl font-bold text-white">
                    {formatCurrency(selectedDayInfo.subs.reduce((acc, s) => acc + s.price, 0), selectedDayInfo.subs[0]?.currency || 'EUR')}
                </span>
            </div>
        </div>
      )}
    </div>
  );
}
