import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeUser } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeUser();
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { firstName: true, lastName: true, email: true },
      },
      participants: {
        include: {
          student: {
            include: { department: true, programme: true },
          },
        },
      },
      notes: {
        include: {
          author: { select: { firstName: true, lastName: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      actionItems: {
        include: {
          student: { select: { fullName: true, institutionalId: true } },
        },
      },
    },
  });

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  // Check access authorization
  const isStudent = auth.user.role === "STUDENT";
  if (isStudent) {
    const isParticipant = meeting.participants.some(
      (p: any) => p.student.userId === auth.user.id
    );
    if (!isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Filter notes by visibility level
  const filteredNotes = meeting.notes.filter((note: any) => {
    if (isStudent) return note.visibilityLevel === "STUDENT_VISIBLE";
    if (note.visibilityLevel === "RESTRICTED_COUNSELLING") return note.authorId === auth.user.id;
    return true;
  });

  return NextResponse.json({
    success: true,
    meeting: { ...meeting, notes: filteredNotes },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeUser(["ADMIN", "HOD", "TEACHER"]);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const meeting = await prisma.meeting.findUnique({ where: { id } });
  if (!meeting) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

  // Only creator, HoD or Admin can modify
  if (auth.user.role === "TEACHER" && meeting.createdById !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden: Only meeting host can update session records." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { status, cancellationReason, attendanceUpdates, newNote } = body;

    await prisma.$transaction(async (tx: any) => {
      // 1. Update meeting status if provided
      if (status) {
        await tx.meeting.update({
          where: { id },
          data: {
            status,
            cancellationReason: cancellationReason || null,
          },
        });
      }

      // 2. Update participant attendance
      if (attendanceUpdates && Array.isArray(attendanceUpdates)) {
        for (const att of attendanceUpdates) {
          await tx.meetingParticipant.update({
            where: {
              meetingId_studentId: {
                meetingId: id,
                studentId: att.studentId,
              },
            },
            data: {
              attendanceStatus: att.attendanceStatus,
              feedbackNotes: att.feedbackNotes || undefined,
            },
          });
        }
      }

      // 3. Add note with explicit visibility
      if (newNote && newNote.content?.trim()) {
        await tx.meetingNote.create({
          data: {
            meetingId: id,
            authorId: auth.user.id,
            visibilityLevel: newNote.visibilityLevel || "STUDENT_VISIBLE",
            noteContent: newNote.content.trim(),
          },
        });
      }
    });

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorRole: auth.user.role,
      action: "MEETING_UPDATED",
      entityType: "Meeting",
      entityId: id,
      details: { status, hasNewNote: !!newNote },
    });

    return NextResponse.json({ success: true, message: "Meeting records updated successfully." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update meeting" }, { status: 400 });
  }
}
