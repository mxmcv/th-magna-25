// Application constants
// Centralized configuration values

export const CURRENCY = {
  SYMBOL: '$',
  LOCALE: 'en-US',
  CURRENCY_CODE: 'USD',
} as const;

export const TOKENS = {
  USDC: 'USDC',
  USDT: 'USDT',
} as const;

export const ROUND_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  CLOSED: 'closed',
  COMPLETED: 'completed',
} as const;

export const INVESTOR_STATUS = {
  INVITED: 'invited',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const STATUS_COLORS = {
  // Round statuses
  active: 'bg-primary/10 text-primary',
  completed: 'bg-green-500/10 text-green-500',
  draft: 'bg-muted text-muted-foreground',
  closed: 'bg-muted text-muted-foreground',
  
  // Investor statuses
  invited: 'bg-blue-500/10 text-blue-500',
  inactive: 'bg-muted text-muted-foreground',
  
  // Contribution statuses
  pending: 'bg-yellow-500/10 text-yellow-500',
  confirmed: 'bg-green-500/10 text-green-500',
  failed: 'bg-red-500/10 text-red-500',
} as const;

export const DATE_FORMATS = {
  SHORT: 'MMM DD, YYYY',
  LONG: 'MMMM DD, YYYY',
  WITH_TIME: 'MMM DD, YYYY HH:mm',
} as const;

export const VALIDATION = {
  MIN_CONTRIBUTION: 1000,
  MAX_CONTRIBUTION: 10000000,
  MIN_TARGET: 10000,
  MAX_TARGET: 1000000000,
} as const;

