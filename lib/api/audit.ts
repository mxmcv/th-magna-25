// Audit logging service
// Tracks all critical operations for compliance and debugging

import { prisma } from '@/lib/prisma';
import { AuditAction } from '@prisma/client';

interface AuditLogParams {
  entityType: string;
  entityId: string;
  action: AuditAction;
  userId: string;
  userType: 'company' | 'investor';
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Creates an audit log entry
 * This should be called for all critical operations
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        userId: params.userId,
        userType: params.userType,
        changes: params.changes || {},
        metadata: params.metadata || {},
      },
    });
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    // But log the error for monitoring
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Compares two objects and returns the differences
 * Useful for tracking changes in UPDATE operations
 */
export function getChanges<T extends Record<string, any>>(
  oldData: T,
  newData: Partial<T>
): Record<string, { from: any; to: any }> {
  const changes: Record<string, { from: any; to: any }> = {};

  for (const key in newData) {
    if (newData[key] !== oldData[key]) {
      changes[key] = {
        from: oldData[key],
        to: newData[key],
      };
    }
  }

  return changes;
}

/**
 * Retrieves audit logs for a specific entity
 */
export async function getEntityAuditLogs(
  entityType: string,
  entityId: string,
  limit: number = 50
) {
  return await prisma.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: limit,
  });
}

/**
 * Retrieves audit logs for a specific user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50
) {
  return await prisma.auditLog.findMany({
    where: {
      userId,
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: limit,
  });
}

/**
 * Helper functions for common audit log scenarios
 */
export const auditHelpers = {
  logRoundCreated: (roundId: string, companyId: string, roundData: any) =>
    createAuditLog({
      entityType: 'Round',
      entityId: roundId,
      action: 'CREATE',
      userId: companyId,
      userType: 'company',
      changes: { created: roundData },
    }),

  logRoundUpdated: (
    roundId: string,
    companyId: string,
    oldData: any,
    newData: any
  ) =>
    createAuditLog({
      entityType: 'Round',
      entityId: roundId,
      action: 'UPDATE',
      userId: companyId,
      userType: 'company',
      changes: getChanges(oldData, newData),
    }),

  logRoundClosed: (roundId: string, companyId: string) =>
    createAuditLog({
      entityType: 'Round',
      entityId: roundId,
      action: 'CLOSE_ROUND',
      userId: companyId,
      userType: 'company',
    }),

  logContributionCreated: (
    contributionId: string,
    investorId: string,
    contributionData: any
  ) =>
    createAuditLog({
      entityType: 'Contribution',
      entityId: contributionId,
      action: 'CONTRIBUTE',
      userId: investorId,
      userType: 'investor',
      changes: { created: contributionData },
    }),

  logContributionConfirmed: (
    contributionId: string,
    companyId: string,
    contributionData: any
  ) =>
    createAuditLog({
      entityType: 'Contribution',
      entityId: contributionId,
      action: 'CONFIRM_CONTRIBUTION',
      userId: companyId,
      userType: 'company',
      changes: contributionData,
    }),

  logInvitationSent: (invitationId: string, companyId: string, invitationData: any) =>
    createAuditLog({
      entityType: 'Invitation',
      entityId: invitationId,
      action: 'INVITE',
      userId: companyId,
      userType: 'company',
      changes: { created: invitationData },
    }),

  logInvestorCreated: (investorId: string, companyId: string, investorData: any) =>
    createAuditLog({
      entityType: 'Investor',
      entityId: investorId,
      action: 'CREATE',
      userId: companyId,
      userType: 'company',
      changes: { created: investorData },
    }),

  logInvestorUpdated: (
    investorId: string,
    companyId: string,
    oldData: any,
    newData: any
  ) =>
    createAuditLog({
      entityType: 'Investor',
      entityId: investorId,
      action: 'UPDATE',
      userId: companyId,
      userType: 'company',
      changes: getChanges(oldData, newData),
    }),
};

