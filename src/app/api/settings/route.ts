import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeUser } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  const settings = await prisma.institutionalSetting.findMany({
    orderBy: { settingKey: "asc" },
  });
  return NextResponse.json({ success: true, settings });
}

export async function PATCH(req: NextRequest) {
  const auth = await authorizeUser(["ADMIN"]);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { settingKey, settingValue } = body;

    const updated = await prisma.institutionalSetting.update({
      where: { settingKey },
      data: { settingValue },
    });

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorRole: auth.user.role,
      action: "SETTING_UPDATED",
      entityType: "InstitutionalSetting",
      entityId: settingKey,
      details: { key: settingKey, newValue: settingValue },
    });

    return NextResponse.json({ success: true, setting: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update setting" }, { status: 400 });
  }
}
