import prisma from "@/lib/prisma";

export interface LogAuditParams {
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  details?: Record<string, unknown> | null;
}

export async function logAuditEvent(params: LogAuditParams) {
  try {
    return await prisma.auditEvent.create({
      data: {
        actorId: params.actorId || null,
        actorEmail: params.actorEmail || null,
        actorRole: params.actorRole || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        ipAddress: params.ipAddress || "127.0.0.1",
        userAgent: params.userAgent || "NMAMIT Portal Client",
        detailsJson: params.details ? JSON.stringify(params.details) : null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit event:", error);
    return null;
  }
}
