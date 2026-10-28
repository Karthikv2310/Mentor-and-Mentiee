import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authorizeUser } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit";

const actionItemCreateSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  meetingId: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  assignedToRole: z.enum(["STUDENT", "MENTOR"]).default("STUDENT"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid due date" }),
});

export async function GET(req: NextRequest) {
  const auth = await authorizeUser();
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const studentId = searchParams.get("studentId");

  const where: any = {};
  if (status) where.status = status;

  if (auth.user.role === "STUDENT") {
    const studentProfile = auth.user.studentProfile;
    if (!studentProfile) return NextResponse.json({ actionItems: [] });
    where.studentId = studentProfile.id;
  } else if (studentId) {
    where.studentId = studentId;
  } else if (auth.user.role === "TEACHER") {
    const facultyId = auth.user.facultyProfile?.id;
    if (facultyId) {
      where.student = {
        mentorAssignments: {
          some: { mentorFacultyId: facultyId, status: "ACTIVE" },
        },
      };
    }
  }

  const actionItems = await prisma.actionItem.findMany({
    where,
    include: {
      student: {
        select: { id: true, fullName: true, institutionalId: true, section: true, currentSemester: true },
      },
      meeting: {
        select: { id: true, title: true, scheduledAt: true },
      },
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    take: 100,
  });

  return NextResponse.json({ success: true, count: actionItems.length, actionItems });
}

export async function POST(req: NextRequest) {
  const auth = await authorizeUser(["ADMIN", "HOD", "TEACHER"]);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const result = actionItemCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;
    const actionItem = await prisma.actionItem.create({
      data: {
        studentId: data.studentId,
        meetingId: data.meetingId || null,
        title: data.title,
        description: data.description || null,
        assignedToRole: data.assignedToRole,
        priority: data.priority,
        status: "OPEN",
        dueDate: new Date(data.dueDate),
      },
    });

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorRole: auth.user.role,
      action: "ACTION_ITEM_CREATED",
      entityType: "ActionItem",
      entityId: actionItem.id,
      details: { title: actionItem.title, studentId: data.studentId },
    });

    return NextResponse.json({ success: true, actionItem }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create action item" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await authorizeUser();
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { id, status, outcomeNotes } = body;

    const existing = await prisma.actionItem.findUnique({
      where: { id },
      include: { student: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Action item not found" }, { status: 404 });
    }

    // Authorization check
    if (auth.user.role === "STUDENT") {
      if (existing.student.userId !== auth.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const updated = await prisma.actionItem.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(outcomeNotes && { outcomeNotes }),
        ...(status === "COMPLETED" && { completedAt: new Date() }),
      },
    });

    return NextResponse.json({ success: true, actionItem: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update action item" }, { status: 400 });
  }
}
