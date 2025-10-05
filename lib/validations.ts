// Validation utilities
// Centralized validation functions for forms and data

import { VALIDATION } from './constants';

/**
 * Validates a contribution amount
 * @param amount - The contribution amount to validate
 * @param minContribution - Minimum allowed contribution
 * @param maxContribution - Maximum allowed contribution
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateContribution(
  amount: number,
  minContribution: number,
  maxContribution: number
): { isValid: boolean; error?: string } {
  if (amount < minContribution) {
    return {
      isValid: false,
      error: `Contribution must be at least $${minContribution.toLocaleString()}`,
    };
  }

  if (amount > maxContribution) {
    return {
      isValid: false,
      error: `Contribution cannot exceed $${maxContribution.toLocaleString()}`,
    };
  }

  return { isValid: true };
}

/**
 * Validates an email address
 * @param email - The email to validate
 * @returns Boolean indicating if email is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a fundraising target
 * @param target - The target amount
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateTarget(target: number): { isValid: boolean; error?: string } {
  if (target < VALIDATION.MIN_TARGET) {
    return {
      isValid: false,
      error: `Target must be at least $${VALIDATION.MIN_TARGET.toLocaleString()}`,
    };
  }

  if (target > VALIDATION.MAX_TARGET) {
    return {
      isValid: false,
      error: `Target cannot exceed $${VALIDATION.MAX_TARGET.toLocaleString()}`,
    };
  }

  return { isValid: true };
}

/**
 * Validates contribution limits (min/max)
 * @param minContribution - Minimum contribution amount
 * @param maxContribution - Maximum contribution amount
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateContributionLimits(
  minContribution: number,
  maxContribution: number
): { isValid: boolean; error?: string } {
  if (minContribution >= maxContribution) {
    return {
      isValid: false,
      error: 'Minimum contribution must be less than maximum contribution',
    };
  }

  if (minContribution < VALIDATION.MIN_CONTRIBUTION) {
    return {
      isValid: false,
      error: `Minimum contribution must be at least $${VALIDATION.MIN_CONTRIBUTION.toLocaleString()}`,
    };
  }

  return { isValid: true };
}

/**
 * Validates date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateDateRange(
  startDate: string | Date,
  endDate: string | Date
): { isValid: boolean; error?: string } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (start >= end) {
    return {
      isValid: false,
      error: 'End date must be after start date',
    };
  }

  if (end < now) {
    return {
      isValid: false,
      error: 'End date must be in the future',
    };
  }

  return { isValid: true };
}

/**
 * Validates wallet address (basic validation)
 * @param address - Wallet address to validate
 * @returns Boolean indicating if address is valid
 */
export function validateWalletAddress(address: string): boolean {
  // Basic Ethereum address validation
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

