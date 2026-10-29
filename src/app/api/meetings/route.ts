import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authorizeUser } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit";

const meetingCreateSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  sessionType: z.enum(["ONE_ON_ONE", "GROUP"]).default("ONE_ON_ONE"),
  agendaCategory: z.enum([
    "ACADEMIC_PERFORMANCE",
    "ATTENDANCE_SHORTAGE",
    "MSE1_REVIEW",
    "CAREER_AND_INTERNSHIP",
    "PERSONAL_WELLBEING",
  ]).default("ACADEMIC_PERFORMANCE"),
  scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid scheduled date/time",
  }),
  durationMinutes: z.coerce.number().int().min(10).max(180).default(30),
  locationOrLink: z.string().default("Department Mentor Chamber"),
  studentIds: z.array(z.string()).min(1, "Select at least one mentee participant"),
  initialNote: z.string().optional(),
  initialNoteVisibility: z.enum(["STUDENT_VISIBLE", "MENTOR_ONLY", "RESTRICTED_COUNSELLING"]).default("STUDENT_VISIBLE"),
});

export async function GET(req: NextRequest) {
  const auth = await authorizeUser();
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: any = {};
  if (status) where.status = status;

  if (auth.user.role === "STUDENT") {
    // Student sees only meetings where they are a participant
    const studentProfile = auth.user.studentProfile;
    if (!studentProfile) return NextResponse.json({ meetings: [] });
    where.participants = {
      some: { studentId: studentProfile.id },
    };
  } else if (auth.user.role === "TEACHER") {
    // Teacher sees meetings created by them
    where.createdById = auth.user.id;
  } else if (auth.user.role === "HOD") {
    // HoD sees meetings conducted within their department
    where.createdBy = {
      departmentScopeId: auth.user.departmentScopeId,
    };
  }

  const meetings = await prisma.meeting.findMany({
    where,
    include: {
      createdBy: {
        select: { firstName: true, lastName: true, email: true },
      },
      participants: {
        include: {
          student: {
            select: { id: true, fullName: true, institutionalId: true, section: true, currentSemester: true },
          },
        },
      },
      notes: true,
      actionItems: true,
    },
    orderBy: { scheduledAt: "desc" },
    take: 50,
  });

  // Filter notes by visibility
  const isStudent = auth.user.role === "STUDENT";
  const sanitized = meetings.map((m: any) => ({
    ...m,
    notes: m.notes.filter((n: any) => {
      if (isStudent) return n.visibilityLevel === "STUDENT_VISIBLE";
      if (n.visibilityLevel === "RESTRICTED_COUNSELLING") return n.authorId === auth.user.id;
      return true;
    }),
  }));

  return NextResponse.json({ success: true, count: sanitized.length, meetings: sanitized });
}

export async function POST(req: NextRequest) {
  const auth = await authorizeUser(["ADMIN", "HOD", "TEACHER"]);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const result = meetingCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;
    const scheduledStart = new Date(data.scheduledAt);
    const scheduledEnd = new Date(scheduledStart.getTime() + data.durationMinutes * 60000);

    // Conflict detection: verify that the creator doesn't have an overlapping active meeting
    const conflict = await prisma.meeting.findFirst({
      where: {
        createdById: auth.user.id,
        status: { in: ["REQUESTED", "CONFIRMED"] },
        AND: [
          { scheduledAt: { lt: scheduledEnd } },
          {
            scheduledAt: {
              gte: new Date(scheduledStart.getTime() - 180 * 60000), // Within same window
            },
          },
        ],
      },
    });

    if (conflict) {
      // Check precise overlap
      const conflictStart = conflict.scheduledAt;
      const conflictEnd = new Date(conflictStart.getTime() + conflict.durationMinutes * 60000);
      if (scheduledStart < conflictEnd && scheduledEnd > conflictStart) {
        return NextResponse.json(
          {
            error: `Scheduling conflict: You already have a session "${conflict.title}" scheduled from ${conflictStart.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })} to ${conflictEnd.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}.`,
          },
          { status: 409 }
        );
      }
    }

    // Verify mentees are within authorized scope if Teacher
    if (auth.user.role === "TEACHER") {
      const teacherFacultyId = auth.user.facultyProfile?.id;
      if (!teacherFacultyId) {
        return NextResponse.json({ error: "Teacher profile not linked" }, { status: 400 });
      }
      // Check if teacher is assigned to these mentees
      const assignments = await prisma.mentorAssignment.findMany({
        where: {
          mentorFacultyId: teacherFacultyId,
          studentId: { in: data.studentIds },
          status: "ACTIVE",
        },
      });

      if (assignments.length !== data.studentIds.length) {
        return NextResponse.json(
          { error: "You can only schedule mentoring sessions with your assigned mentees." },
          { status: 403 }
        );
      }
    }

    const meeting = await prisma.$transaction(async (tx: any) => {
      const newMeeting = await tx.meeting.create({
        data: {
          title: data.title,
          description: data.description,
          sessionType: data.sessionType,
          agendaCategory: data.agendaCategory,
          scheduledAt: scheduledStart,
          durationMinutes: data.durationMinutes,
          locationOrLink: data.locationOrLink,
          status: "CONFIRMED",
          createdById: auth.user.id,
          participants: {
            create: data.studentIds.map((studentId) => ({
              studentId,
              attendanceStatus: "PRESENT",
            })),
          },
        },
      });

      if (data.initialNote && data.initialNote.trim()) {
        await tx.meetingNote.create({
          data: {
            meetingId: newMeeting.id,
            authorId: auth.user.id,
            visibilityLevel: data.initialNoteVisibility,
            noteContent: data.initialNote.trim(),
          },
        });
      }

      return newMeeting;
    });

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorRole: auth.user.role,
      action: "MEETING_SCHEDULED",
      entityType: "Meeting",
      entityId: meeting.id,
      details: {
        title: meeting.title,
        scheduledAt: scheduledStart.toISOString(),
        participantsCount: data.studentIds.length,
      },
    });

    return NextResponse.json({ success: true, meeting }, { status: 201 });
  } catch (err: any) {
    console.error("Meeting creation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to schedule meeting" },
      { status: 500 }
    );
  }
}
