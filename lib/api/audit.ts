// audit logging - tracks all critical operations for compliance
// went with immutable logs stored in postgres rather than external service
// makes it easier to query and keeps everything in one place

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

// core logging function - intentionally fails silently so audit issues don't break user flows
// in production would want to alert on audit failures though
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
    console.error('Failed to create audit log:', error);
  }
}

// helper for diffing objects - makes audit logs more readable
// only tracks what actually changed
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

// helper functions for common audit actions
// keeps api routes cleaner and ensures consistency
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
      changes: { confirmed: contributionData },
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

  logInvestorDeleted: (investorId: string, companyId: string, investorData: any) =>
    createAuditLog({
      entityType: 'Investor',
      entityId: investorId,
      action: 'DELETE',
      userId: companyId,
      userType: 'company',
      changes: { deleted: investorData },
    }),

  logRoundDeleted: (roundId: string, companyId: string, roundData: any) =>
    createAuditLog({
      entityType: 'Round',
      entityId: roundId,
      action: 'DELETE',
      userId: companyId,
      userType: 'company',
      changes: { deleted: roundData },
    }),

  // auth-related audit logs - important for security monitoring
  logUserLogin: (userId: string, userType: 'company' | 'investor', metadata?: any) =>
    createAuditLog({
      entityType: userType === 'company' ? 'Company' : 'Investor',
      entityId: userId,
      action: 'LOGIN',
      userId,
      userType,
      metadata,
    }),

  logUserLogout: (userId: string, userType: 'company' | 'investor') =>
    createAuditLog({
      entityType: userType === 'company' ? 'Company' : 'Investor',
      entityId: userId,
      action: 'LOGOUT',
      userId,
      userType,
    }),

  logUserRegistration: (userId: string, userType: 'company' | 'investor', userData: any) =>
    createAuditLog({
      entityType: userType === 'company' ? 'Company' : 'Investor',
      entityId: userId,
      action: 'REGISTER',
      userId,
      userType,
      changes: { created: userData },
    }),

  // token allocation feature - my "one extra feature"
  // tracks when companies generate allocation reports
  logTokenAllocationGenerated: (roundId: string, companyId: string, metadata: any) =>
    createAuditLog({
      entityType: 'Round',
      entityId: roundId,
      action: 'TOKEN_ALLOCATION',
      userId: companyId,
      userType: 'company',
      metadata,
    }),

  logTokenExport: (roundId: string, companyId: string, metadata: any) =>
    createAuditLog({
      entityType: 'Round',
      entityId: roundId,
      action: 'TOKEN_EXPORT',
      userId: companyId,
      userType: 'company',
      metadata,
    }),
};
