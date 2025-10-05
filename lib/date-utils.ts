// Date utility functions
// Reusable date calculation and formatting functions

/**
 * Calculates days remaining between now and a future date
 * @param endDate - The end date
 * @returns Number of days remaining (rounded up)
 */
export function calculateDaysRemaining(endDate: string | Date): number {
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const now = new Date();
  const diffInMs = end.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffInDays);
}

/**
 * Checks if a date is in the past
 * @param date - The date to check
 * @returns Boolean indicating if date is in the past
 */
export function isDateInPast(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * Checks if a date is in the future
 * @param date - The date to check
 * @returns Boolean indicating if date is in the future
 */
export function isDateInFuture(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
}

/**
 * Checks if a date range is currently active
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns Boolean indicating if date range is active
 */
export function isDateRangeActive(
  startDate: string | Date,
  endDate: string | Date
): boolean {
  const now = new Date();
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  return now >= start && now <= end;
}

/**
 * Gets a human-readable time remaining string
 * @param endDate - The end date
 * @returns Human-readable string (e.g., "5 days", "2 hours", "ending soon")
 */
export function getTimeRemainingText(endDate: string | Date): string {
  const daysRemaining = calculateDaysRemaining(endDate);
  
  if (daysRemaining === 0) {
    return 'Ending today';
  }
  
  if (daysRemaining === 1) {
    return '1 day remaining';
  }
  
  if (daysRemaining <= 7) {
    return `${daysRemaining} days remaining`;
  }
  
  const weeksRemaining = Math.floor(daysRemaining / 7);
  if (weeksRemaining === 1) {
    return '1 week remaining';
  }
  
  if (weeksRemaining < 4) {
    return `${weeksRemaining} weeks remaining`;
  }
  
  const monthsRemaining = Math.floor(daysRemaining / 30);
  if (monthsRemaining === 1) {
    return '1 month remaining';
  }
  
  return `${monthsRemaining} months remaining`;
}

/**
 * Checks if a round is ending soon (within 7 days)
 * @param endDate - The end date
 * @returns Boolean indicating if round is ending soon
 */
export function isEndingSoon(endDate: string | Date): boolean {
  const daysRemaining = calculateDaysRemaining(endDate);
  return daysRemaining > 0 && daysRemaining <= 7;
}

