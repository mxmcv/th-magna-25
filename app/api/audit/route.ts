// Audit Logs API
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/api/responses';
import { requireAuth } from '@/lib/api/auth';
import type { Prisma } from '@prisma/client';

// GET /api/audit - Get audit logs
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: Prisma.AuditLogWhereInput = {};
    
    // Companies can see all audit logs for their resources
    // Investors can only see their own audit logs
    if (session.userType === 'investor') {
      where.userId = session.userId;
    }

    if (entityType && entityType !== 'all') {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    if (action && action !== 'all') {
      where.action = action as Prisma.EnumAuditActionFilter;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.auditLog.count({ where });

    return successResponse({
      logs,
      total,
      limit,
      offset,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
