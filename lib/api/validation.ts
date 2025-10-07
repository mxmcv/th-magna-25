// server-side validation - never trust client input
// reuses shared validation functions from lib/validations.ts
// throws ApiError with structured codes for consistent error responses

import { ApiError, ErrorCodes } from './responses';
import {
  validateEmail,
  validateTarget,
  validateContribution,
  validateContributionLimits,
  validateDateRange,
} from '@/lib/validations';

/**
 * Validate round creation data
 */
export function validateRoundData(data: any): {
  name: string;
  description?: string;
  target: number;
  minContribution: number;
  maxContribution: number;
  acceptedTokens: string[];
  startDate: Date;
  endDate: Date;
} {
  // Required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    throw new ApiError('Round name is required', 400, ErrorCodes.MISSING_REQUIRED_FIELD);
  }

  // Validate target
  const target = parseFloat(data.target);
  if (isNaN(target)) {
    throw new ApiError('Target must be a valid number', 400, ErrorCodes.INVALID_INPUT);
  }

  const targetValidation = validateTarget(target);
  if (!targetValidation.isValid) {
    throw new ApiError(targetValidation.error!, 400, ErrorCodes.VALIDATION_ERROR);
  }

  // Validate contribution limits
  const minContribution = parseFloat(data.minContribution);
  const maxContribution = parseFloat(data.maxContribution);

  if (isNaN(minContribution) || isNaN(maxContribution)) {
    throw new ApiError('Contribution limits must be valid numbers', 400, ErrorCodes.INVALID_INPUT);
  }

  const limitsValidation = validateContributionLimits(minContribution, maxContribution);
  if (!limitsValidation.isValid) {
    throw new ApiError(limitsValidation.error!, 400, ErrorCodes.VALIDATION_ERROR);
  }

  // validate accepted tokens - must be USDC/USDT for now
  // keeping this flexible as an array for future token additions
  if (!Array.isArray(data.acceptedTokens) || data.acceptedTokens.length === 0) {
    throw new ApiError('At least one accepted token is required', 400, ErrorCodes.INVALID_INPUT);
  }

  const validTokens = ['USDC', 'USDT'];
  const invalidTokens = data.acceptedTokens.filter((t: string) => !validTokens.includes(t));
  if (invalidTokens.length > 0) {
    throw new ApiError(`Invalid tokens: ${invalidTokens.join(', ')}`, 400, ErrorCodes.INVALID_INPUT);
  }

  // Validate dates
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new ApiError('Invalid date format', 400, ErrorCodes.INVALID_INPUT);
  }

  const dateValidation = validateDateRange(startDate, endDate);
  if (!dateValidation.isValid) {
    throw new ApiError(dateValidation.error!, 400, ErrorCodes.VALIDATION_ERROR);
  }

  return {
    name: data.name.trim(),
    description: data.description?.trim(),
    target,
    minContribution,
    maxContribution,
    acceptedTokens: data.acceptedTokens,
    startDate,
    endDate,
  };
}

/**
 * Validate investor data
 */
export function validateInvestorData(data: any): {
  email: string;
  name: string;
  walletAddress?: string;
} {
  if (!data.email || typeof data.email !== 'string') {
    throw new ApiError('Email is required', 400, ErrorCodes.MISSING_REQUIRED_FIELD);
  }

  if (!validateEmail(data.email)) {
    throw new ApiError('Invalid email format', 400, ErrorCodes.INVALID_INPUT);
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    throw new ApiError('Name is required', 400, ErrorCodes.MISSING_REQUIRED_FIELD);
  }

  const result: any = {
    email: data.email.toLowerCase().trim(),
    name: data.name.trim(),
  };

  if (data.walletAddress) {
    result.walletAddress = data.walletAddress.trim();
  }

  return result;
}

/**
 * Validate contribution data
 */
export function validateContributionData(data: any, round: any): {
  roundId: string;
  investorId: string;
  amount: number;
  token: string;
  walletAddress?: string;
} {
  if (!data.roundId || typeof data.roundId !== 'string') {
    throw new ApiError('Round ID is required', 400, ErrorCodes.MISSING_REQUIRED_FIELD);
  }

  if (!data.investorId || typeof data.investorId !== 'string') {
    throw new ApiError('Investor ID is required', 400, ErrorCodes.MISSING_REQUIRED_FIELD);
  }

  const amount = parseFloat(data.amount);
  if (isNaN(amount) || amount <= 0) {
    throw new ApiError('Amount must be a positive number', 400, ErrorCodes.INVALID_INPUT);
  }

  // Validate amount against round limits
  const contributionValidation = validateContribution(
    amount,
    round.minContribution,
    round.maxContribution
  );
  if (!contributionValidation.isValid) {
    throw new ApiError(contributionValidation.error!, 400, ErrorCodes.VALIDATION_ERROR);
  }

  // Validate token
  if (!data.token || typeof data.token !== 'string') {
    throw new ApiError('Token is required', 400, ErrorCodes.MISSING_REQUIRED_FIELD);
  }

  if (!round.acceptedTokens.includes(data.token)) {
    throw new ApiError(
      `Token ${data.token} is not accepted for this round`,
      400,
      ErrorCodes.INVALID_INPUT
    );
  }

  const result: any = {
    roundId: data.roundId,
    investorId: data.investorId,
    amount,
    token: data.token,
  };

  if (data.walletAddress) {
    result.walletAddress = data.walletAddress.trim();
  }

  return result;
}

/**
 * Parse request body safely
 */
export async function parseRequestBody(request: Request): Promise<any> {
  try {
    return await request.json();
  } catch {
    throw new ApiError('Invalid JSON in request body', 400, ErrorCodes.INVALID_INPUT);
  }
}

