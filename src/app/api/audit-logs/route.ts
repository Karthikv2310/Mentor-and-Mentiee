import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeUser } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const auth = await authorizeUser(["ADMIN", "HOD"]);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const entityType = searchParams.get("entityType");

  const where: any = {};
  if (action) where.action = action;
  if (entityType) where.entityType = entityType;

  const logs = await prisma.auditEvent.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  return NextResponse.json({ success: true, count: logs.length, logs });
}
