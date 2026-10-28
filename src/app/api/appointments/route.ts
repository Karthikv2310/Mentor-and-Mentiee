import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authorizeUser } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit";

const appointmentRequestSchema = z.object({
  mentorFacultyId: z.string().min(1, "Mentor must be specified"),
  requestedDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  preferredTimeSlot: z.string().min(2, "Preferred time slot is required"),
  agenda: z.string().min(5, "Please describe the agenda for the appointment"),
});

export async function GET(req: NextRequest) {
  const auth = await authorizeUser();
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const where: any = {};

  if (auth.user.role === "STUDENT") {
    const studentProfile = auth.user.studentProfile;
    if (!studentProfile) return NextResponse.json({ appointments: [] });
    where.studentId = studentProfile.id;
  } else if (auth.user.role === "TEACHER") {
    const facultyId = auth.user.facultyProfile?.id;
    if (facultyId) where.mentorFacultyId = facultyId;
  }

  const appointments = await prisma.appointmentRequest.findMany({
    where,
    include: {
      student: { select: { id: true, fullName: true, institutionalId: true, section: true } },
      mentorFaculty: { select: { id: true, fullName: true, designation: true, prefix: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, appointments });
}

export async function POST(req: NextRequest) {
  const auth = await authorizeUser(["STUDENT"]);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const studentProfile = auth.user.studentProfile;
  if (!studentProfile) {
    return NextResponse.json({ error: "Student profile record not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const result = appointmentRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Verify mentor is assigned to this student
    const activeAssignment = await prisma.mentorAssignment.findFirst({
      where: {
        studentId: studentProfile.id,
        mentorFacultyId: data.mentorFacultyId,
        status: "ACTIVE",
      },
    });

    if (!activeAssignment) {
      return NextResponse.json(
        { error: "You can only request appointments with an assigned mentor." },
        { status: 403 }
      );
    }

    const appointment = await prisma.appointmentRequest.create({
      data: {
        studentId: studentProfile.id,
        mentorFacultyId: data.mentorFacultyId,
        requestedDate: new Date(data.requestedDate),
        preferredTimeSlot: data.preferredTimeSlot,
        agenda: data.agenda,
        status: "PENDING",
      },
    });

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorRole: auth.user.role,
      action: "APPOINTMENT_REQUESTED",
      entityType: "AppointmentRequest",
      entityId: appointment.id,
      details: { mentorFacultyId: data.mentorFacultyId, slot: data.preferredTimeSlot },
    });

    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create appointment request" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await authorizeUser(["ADMIN", "TEACHER"]);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { id, status, responseRemarks } = body;

    const appointment = await prisma.appointmentRequest.update({
      where: { id },
      data: {
        status, // "APPROVED", "DECLINED"
        responseRemarks: responseRemarks || null,
      },
      include: { student: true },
    });

    // If approved, optionally auto-create confirmed meeting session
    if (status === "APPROVED") {
      await prisma.meeting.create({
        data: {
          title: `Mentoring Session: ${appointment.agenda.slice(0, 40)}`,
          description: appointment.agenda,
          sessionType: "ONE_ON_ONE",
          agendaCategory: "ACADEMIC_PERFORMANCE",
          scheduledAt: appointment.requestedDate,
          durationMinutes: 30,
          status: "CONFIRMED",
          createdById: auth.user.id,
          participants: {
            create: {
              studentId: appointment.studentId,
              attendanceStatus: "PRESENT",
            },
          },
        },
      });
    }

    return NextResponse.json({ success: true, appointment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Update failed" }, { status: 400 });
  }
}
