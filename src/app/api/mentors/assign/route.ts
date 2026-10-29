import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authorizeUser } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit";

const assignmentSchema = z.object({
  studentIds: z.array(z.string()).min(1, "At least one student must be selected"),
  mentorFacultyId: z.string().min(1, "Mentor must be selected"),
  roleType: z.enum(["CLASS_PROCTOR", "FACULTY_ADVISOR"]).default("CLASS_PROCTOR"),
  reassignmentReason: z.string().optional(),
  effectiveStartDate: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await authorizeUser(["ADMIN", "HOD"]);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const result = assignmentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { studentIds, mentorFacultyId, roleType, reassignmentReason, effectiveStartDate } = result.data;

    // Check mentor existence & approval status
    const mentor = await prisma.facultyProfile.findUnique({
      where: { id: mentorFacultyId },
      include: { department: true },
    });

    if (!mentor) {
      return NextResponse.json({ error: "Mentor faculty record not found" }, { status: 404 });
    }

    // Check HoD scoping: HoD can assign within assigned department
    if (auth.user.role === "HOD" && mentor.departmentId !== auth.user.departmentScopeId) {
      return NextResponse.json(
        { error: "Forbidden: You cannot assign mentors outside your department." },
        { status: 403 }
      );
    }

    // Check configurable capacity limit
    const capSetting = await prisma.institutionalSetting.findUnique({
      where: { settingKey: "MAX_MENTEES_PER_PROCTOR" },
    });
    const maxCapacity = capSetting ? parseInt(capSetting.settingValue, 10) : 25;

    const currentCount = await prisma.mentorAssignment.count({
      where: {
        mentorFacultyId,
        status: "ACTIVE",
      },
    });

    if (currentCount + studentIds.length > maxCapacity) {
      return NextResponse.json(
        {
          error: `Capacity exceeded: Assigning ${studentIds.length} students would exceed mentor's ceiling of ${maxCapacity} (currently mentoring ${currentCount}).`,
        },
        { status: 400 }
      );
    }

    const effectiveDate = effectiveStartDate ? new Date(effectiveStartDate) : new Date();

    // Execute assignments transactionally
    await prisma.$transaction(async (tx: any) => {
      for (const studentId of studentIds) {
        // Find any existing active assignment with this roleType and end it gracefully
        const existingAssignment = await tx.mentorAssignment.findFirst({
          where: {
            studentId,
            roleType,
            status: "ACTIVE",
          },
        });

        if (existingAssignment) {
          // If already assigned to this exact mentor, skip
          if (existingAssignment.mentorFacultyId === mentorFacultyId) {
            continue;
          }
          await tx.mentorAssignment.update({
            where: { id: existingAssignment.id },
            data: {
              status: "TRANSFERRED",
              effectiveEndDate: effectiveDate,
              reassignmentReason: reassignmentReason || "Reassigned to new mentor by coordinator.",
            },
          });
        }

        // Create new active assignment
        await tx.mentorAssignment.create({
          data: {
            studentId,
            mentorFacultyId,
            roleType,
            status: "ACTIVE",
            effectiveStartDate: effectiveDate,
            reassignmentReason: reassignmentReason || null,
            assignedById: auth.user.id,
          },
        });
      }
    });

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorRole: auth.user.role,
      action: "MENTOR_ASSIGNED",
      entityType: "Assignment",
      entityId: mentorFacultyId,
      details: {
        studentCount: studentIds.length,
        roleType,
        mentor: mentor.fullName,
        reason: reassignmentReason,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${studentIds.length} student(s) to ${mentor.prefix || ""} ${mentor.fullName}.`,
    });
  } catch (err: any) {
    console.error("Assignment error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process mentor assignments" },
      { status: 500 }
    );
  }
}
