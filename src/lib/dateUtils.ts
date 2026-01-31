import { addMonths, addWeeks, addYears, isBefore, startOfDay, isSameDay } from "date-fns";
import { Frequency } from "@/types";

export function getNextPaymentDate(baseDate: Date, frequency: Frequency): Date {
  const today = startOfDay(new Date());
  // If baseDate is today or future, return it.
  if (!isBefore(baseDate, today)) {
    return baseDate;
  }

  let nextDate = new Date(baseDate);

  // Iterate adding periods until we pass or reach today
  // Optimized for performance could be done with math, but while loop is safer for leap years/variable month lengths
  while (isBefore(nextDate, today)) {
    switch (frequency) {
      case 'weekly':
        nextDate = addWeeks(nextDate, 1);
        break;
      case 'monthly':
        nextDate = addMonths(nextDate, 1);
        break;
      case 'bimonthly':
        nextDate = addMonths(nextDate, 2);
        break;
      case 'yearly':
        nextDate = addYears(nextDate, 1);
        break;
    }
  }

  return nextDate;
}
