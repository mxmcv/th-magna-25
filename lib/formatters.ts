// formatting utilities - consistent display across all UI components
// using Intl API for proper locale support, keeps formatting logic centralized

import { CURRENCY } from './constants';

/**
 * formats numbers as USD currency
 * compact mode gives us readable abbreviations like $1.5M for dashboards
 */
export function formatCurrency(
  amount: number,
  options?: {
    compact?: boolean;
    decimals?: number;
  }
): string {
  if (options?.compact) {
    return formatCompactCurrency(amount);
  }

  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: 'currency',
    currency: CURRENCY.CURRENCY_CODE,
    minimumFractionDigits: options?.decimals ?? 0,
    maximumFractionDigits: options?.decimals ?? 0,
  }).format(amount);
}

/**
 * Formats a number as compact currency (e.g., $1.2M, $450K)
 * @param amount - The numeric amount to format
 * @returns Compact formatted currency string
 */
export function formatCompactCurrency(amount: number): string {
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 1000000) {
    return `${CURRENCY.SYMBOL}${(amount / 1000000).toFixed(1)}M`;
  }
  
  if (absAmount >= 1000) {
    return `${CURRENCY.SYMBOL}${(amount / 1000).toFixed(1)}K`;
  }
  
  return formatCurrency(amount);
}

/**
 * Calculates percentage with proper rounding
 * @param value - The current value
 * @param total - The total value
 * @returns Percentage number
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Formats a date string to a readable format
 * @param date - Date string or Date object
 * @param format - Optional format type
 * @returns Formatted date string
 */
export function formatDate(date: string | Date | null | undefined, format: 'short' | 'long' = 'short'): string {
  if (!date) return 'Unknown';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  if (format === 'long') {
    return new Intl.DateTimeFormat(CURRENCY.LOCALE, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  }
  
  return new Intl.DateTimeFormat(CURRENCY.LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Formats a relative time string (e.g., "2 hours ago")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return 'Unknown';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Unknown';
  }
  
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInMinutes < 1) {
    return 'Just now';
  }
  
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
  }
  
  if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  }
  
  if (diffInDays === 1) {
    return '1 day ago';
  }
  
  return `${diffInDays} days ago`;
}

/**
 * Formats a number with thousands separators
 * @param num - The number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat(CURRENCY.LOCALE).format(num);
}

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Gets the status color class for badges
 * @param status - The status string
 * @returns Tailwind CSS classes for the badge
 */
export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();
  
  // Map of status to color classes
  const statusColors: Record<string, string> = {
    active: 'bg-primary/10 text-primary',
    completed: 'bg-green-500/10 text-green-500',
    draft: 'bg-muted text-muted-foreground',
    closed: 'bg-muted text-muted-foreground',
    invited: 'bg-blue-500/10 text-blue-500',
    inactive: 'bg-muted text-muted-foreground',
    pending: 'bg-yellow-500/10 text-yellow-500',
    verified: 'bg-green-500/10 text-green-500',
    rejected: 'bg-red-500/10 text-red-500',
  };
  
  return statusColors[statusLower] || 'bg-muted text-muted-foreground';
}

