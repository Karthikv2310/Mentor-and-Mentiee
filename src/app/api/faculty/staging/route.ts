import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { authorizeUser } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const auth = await authorizeUser();
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "ALL"; // "STAGED", "APPROVED", "ALL"
  const departmentId = searchParams.get("departmentId");

  const where: any = {};
  if (status !== "ALL") {
    where.approvalStatus = status;
  }
  if (departmentId) {
    where.departmentId = departmentId;
  }

  const faculty = await prisma.facultyProfile.findMany({
    where,
    include: {
      department: true,
      user: {
        select: { id: true, email: true, isActive: true, role: true },
      },
      _count: {
        select: {
          mentorAssignments: { where: { status: "ACTIVE" } },
        },
      },
    },
    orderBy: [{ department: { code: "asc" } }, { fullName: "asc" }],
  });

  return NextResponse.json({ success: true, count: faculty.length, faculty });
}

export async function POST(req: NextRequest) {
  const auth = await authorizeUser(["ADMIN"]);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { facultyProfileId, action, officialEmail, assignedRole = "TEACHER" } = body;

    const faculty = await prisma.facultyProfile.findUnique({
      where: { id: facultyProfileId },
      include: { department: true, user: true },
    });

    if (!faculty) {
      return NextResponse.json({ error: "Faculty profile not found" }, { status: 404 });
    }

    if (action === "APPROVE_DIRECTORY_ONLY") {
      // Approve for public listing without login account
      const updated = await prisma.facultyProfile.update({
        where: { id: facultyProfileId },
        data: {
          approvalStatus: "APPROVED",
          isVerified: true,
          verifiedAt: new Date(),
          verifiedBy: auth.user.email,
        },
      });

      await logAuditEvent({
        actorId: auth.user.id,
        actorEmail: auth.user.email,
        actorRole: auth.user.role,
        action: "STAGING_APPROVED_PUBLIC_ONLY",
        entityType: "FacultyProfile",
        entityId: facultyProfileId,
        details: { name: faculty.fullName, department: faculty.department.code },
      });

      return NextResponse.json({ success: true, faculty: updated });
    }

    if (action === "PROVISION_ACCOUNT") {
      if (!officialEmail || !officialEmail.includes("@")) {
        return NextResponse.json(
          { error: "A valid institutional email must be confirmed by the administrator to provision a login account." },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: officialEmail.toLowerCase().trim() },
      });

      if (existingUser && existingUser.id !== faculty.userId) {
        return NextResponse.json(
          { error: `An account with email '${officialEmail}' already exists.` },
          { status: 409 }
        );
      }

      // Generate single-use invitation token
      const invitationToken = crypto.randomBytes(32).toString("hex");
      const tempPasswordHash = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);

      const user = existingUser
        ? await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              role: assignedRole,
              departmentScopeId: faculty.departmentId,
              isActive: true,
            },
          })
        : await prisma.user.create({
            data: {
              email: officialEmail.toLowerCase().trim(),
              passwordHash: tempPasswordHash,
              role: assignedRole,
              firstName: faculty.fullName.split(" ")[0] || "Faculty",
              lastName: faculty.fullName.split(" ").slice(1).join(" ") || "Member",
              departmentScopeId: faculty.departmentId,
              isActive: true,
              mustChangePassword: true,
              invitationToken,
            },
          });

      const updatedFaculty = await prisma.facultyProfile.update({
        where: { id: facultyProfileId },
        data: {
          approvalStatus: "APPROVED",
          isVerified: true,
          verifiedAt: new Date(),
          verifiedBy: auth.user.email,
          userId: user.id,
        },
        include: { user: true, department: true },
      });

      await logAuditEvent({
        actorId: auth.user.id,
        actorEmail: auth.user.email,
        actorRole: auth.user.role,
        action: "FACULTY_ACCOUNT_PROVISIONED",
        entityType: "FacultyProfile",
        entityId: facultyProfileId,
        details: { email: officialEmail, role: assignedRole },
      });

      return NextResponse.json({
        success: true,
        message: "Faculty profile approved and login account provisioned.",
        faculty: updatedFaculty,
        invitationLink: `/auth/accept-invite?token=${invitationToken}`,
      });
    }

    if (action === "REJECT" || action === "ARCHIVE") {
      const updated = await prisma.facultyProfile.update({
        where: { id: facultyProfileId },
        data: {
          approvalStatus: action === "REJECT" ? "REJECTED" : "ARCHIVED",
        },
      });

      return NextResponse.json({ success: true, faculty: updated });
    }

    return NextResponse.json({ error: "Invalid action requested" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process staging action" }, { status: 500 });
  }
}
