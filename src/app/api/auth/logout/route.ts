import { NextResponse } from "next/server";
import { clearSession, getCurrentUser } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function POST() {
  const user = await getCurrentUser();
  if (user) {
    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "LOGOUT",
      entityType: "User",
      entityId: user.id,
    });
  }

  await clearSession();
  return NextResponse.json({ success: true });
}
