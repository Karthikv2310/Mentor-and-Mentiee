import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeUser, canAccessStudent } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeUser();
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  // Enforce IDOR security guard
  const hasAccess = await canAccessStudent(id, auth.user);
  if (!hasAccess) {
    return NextResponse.json(
      { error: "Forbidden: You do not have permission to view this student's records." },
      { status: 403 }
    );
  }

  const student = await prisma.studentProfile.findUnique({
    where: { id },
    include: {
      department: true,
      programme: true,
      progressions: {
        include: { academicYear: true },
        orderBy: { semester: "desc" },
      },
      mentorAssignments: {
        include: {
          mentorFaculty: {
            include: { department: true },
          },
          assignedBy: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      actionItems: {
        orderBy: [{ status: "asc" }, { dueDate: "asc" }],
      },
      meetingParticipants: {
        include: {
          meeting: {
            include: {
              createdBy: {
                select: { firstName: true, lastName: true, email: true },
              },
              notes: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // Filter notes by caller visibility role
  const isStudent = auth.user.role === "STUDENT";
  const sanitizedStudent = {
    ...student,
    meetingParticipants: student.meetingParticipants.map((mp: any) => ({
      ...mp,
      meeting: {
        ...mp.meeting,
        notes: mp.meeting.notes.filter((note: any) => {
          if (isStudent) {
            return note.visibilityLevel === "STUDENT_VISIBLE";
          }
          if (note.visibilityLevel === "RESTRICTED_COUNSELLING") {
            return note.authorId === auth.user.id;
          }
          return true;
        }),
      },
    })),
  };

  return NextResponse.json({ success: true, student: sanitizedStudent });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeUser(["ADMIN", "HOD", "TEACHER"]);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const hasAccess = await canAccessStudent(id, auth.user);
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { currentSemester, section, enrolmentStatus, admissionCategory } = body;

    const student = await prisma.studentProfile.update({
      where: { id },
      data: {
        ...(currentSemester && { currentSemester: parseInt(currentSemester, 10) }),
        ...(section && { section: section.toUpperCase() }),
        ...(enrolmentStatus && { enrolmentStatus }),
        ...(admissionCategory && { admissionCategory }),
      },
    });

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorRole: auth.user.role,
      action: "STUDENT_UPDATED",
      entityType: "Student",
      entityId: id,
      details: { updatedFields: body },
    });

    return NextResponse.json({ success: true, student });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Update failed" }, { status: 400 });
  }
}
