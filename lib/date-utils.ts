// date utilities - handling time-sensitive round logic
// rounds up days remaining so "less than 1 day" shows as "1 day" instead of 0

/**
 * calculates days left in a round
 * used for urgency indicators in the UI
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

/**
 * Formats a date as a relative time string (e.g., "2 hours ago", "just now")
 * @param date - The date to format
 * @returns Human-readable relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 10) {
    return 'just now';
  }

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }

  if (diffInMinutes === 1) {
    return '1 minute ago';
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  }

  if (diffInHours === 1) {
    return '1 hour ago';
  }

  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  }

  if (diffInDays === 1) {
    return '1 day ago';
  }

  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }

  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  const years = Math.floor(diffInDays / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

