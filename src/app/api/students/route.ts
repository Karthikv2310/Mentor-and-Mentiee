import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authorizeUser, canAddStudentInDepartment } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit";

const studentCreateSchema = z.object({
  institutionalId: z
    .string()
    .min(3, "Institutional ID/USN is required")
    .regex(/^[A-Za-z0-9_-]+$/, "Only alphanumeric characters and dashes allowed"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  institutionalEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  departmentId: z.string().min(1, "Department is required"),
  programmeId: z.string().min(1, "Programme is required"),
  admissionYear: z.coerce.number().int().min(2015).max(2035),
  currentSemester: z.coerce.number().int().min(1).max(8),
  section: z.string().min(1, "Section is required").max(5),
  admissionCategory: z.enum(["REGULAR", "LATERAL_ENTRY", "NRI", "MANAGEMENT"]).default("REGULAR"),
  assignedMentorId: z.string().optional(),
  mentorRoleType: z.enum(["CLASS_PROCTOR", "FACULTY_ADVISOR"]).default("CLASS_PROCTOR"),
  pcmPercentagePUC: z.coerce.number().min(0).max(100).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await authorizeUser(["ADMIN", "HOD", "TEACHER"]);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const departmentId = searchParams.get("departmentId") || "";
  const semester = searchParams.get("semester");
  const section = searchParams.get("section");
  const unassignedOnly = searchParams.get("unassigned") === "true";

  // Build scoped query filter
  const where: any = {};

  if (auth.user.role === "HOD") {
    // HoD can only see their department
    where.departmentId = auth.user.departmentScopeId;
  } else if (auth.user.role === "TEACHER") {
    const teacherScope = auth.user.departmentScopeId;
    const facultyId = auth.user.facultyProfile?.id;
    // Teacher sees their assigned mentees OR department students created by them
    where.departmentId = teacherScope;
    if (searchParams.get("myMentees") === "true" && facultyId) {
      where.mentorAssignments = {
        some: {
          mentorFacultyId: facultyId,
          status: "ACTIVE",
        },
      };
    }
  } else if (departmentId) {
    where.departmentId = departmentId;
  }

  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { institutionalId: { contains: search } },
    ];
  }

  if (semester) {
    where.currentSemester = parseInt(semester, 10);
  }

  if (section) {
    where.section = section;
  }

  if (unassignedOnly) {
    where.mentorAssignments = {
      none: {
        status: "ACTIVE",
      },
    };
  }

  const students = await prisma.studentProfile.findMany({
    where,
    include: {
      department: true,
      programme: true,
      mentorAssignments: {
        where: { status: "ACTIVE" },
        include: {
          mentorFaculty: true,
        },
      },
      progressions: {
        orderBy: { semester: "desc" },
        take: 1,
      },
      _count: {
        select: {
          actionItems: { where: { status: "OPEN" } },
        },
      },
    },
    orderBy: [{ currentSemester: "asc" }, { section: "asc" }, { fullName: "asc" }],
    take: 100,
  });

  return NextResponse.json({ success: true, count: students.length, students });
}

export async function POST(req: NextRequest) {
  const auth = await authorizeUser(["ADMIN", "HOD", "TEACHER"]);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const result = studentCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check scope authorization: can user add to this department?
    if (!canAddStudentInDepartment(data.departmentId, auth.user)) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to create students outside your assigned department." },
        { status: 403 }
      );
    }

    // Check duplicate institutionalId / USN
    const existing = await prisma.studentProfile.findUnique({
      where: { institutionalId: data.institutionalId.trim().toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A student with Institutional ID / USN '${data.institutionalId}' already exists.` },
        { status: 409 }
      );
    }

    // Execute creation in a transaction
    const student = await prisma.$transaction(async (tx) => {
      const newStudent = await tx.studentProfile.create({
        data: {
          institutionalId: data.institutionalId.trim().toUpperCase(),
          fullName: data.fullName.trim(),
          institutionalEmail: data.institutionalEmail ? data.institutionalEmail.trim().toLowerCase() : null,
          departmentId: data.departmentId,
          programmeId: data.programmeId,
          admissionYear: data.admissionYear,
          currentSemester: data.currentSemester,
          section: data.section.toUpperCase(),
          admissionCategory: data.admissionCategory,
          enrolmentStatus: "ACTIVE",
          approvalStatus: auth.user.role === "ADMIN" ? "APPROVED" : "APPROVED",
          createdByTeacherId: auth.user.id,
        },
      });

      // Record baseline progression
      const currentAY = await tx.academicYear.findFirst({ where: { isCurrent: true } });
      if (currentAY) {
        await tx.studentProgression.create({
          data: {
            studentId: newStudent.id,
            academicYearId: currentAY.id,
            semester: data.currentSemester,
            section: data.section.toUpperCase(),
            attendancePercentage: 100,
            attendanceShortageFlag: false,
            pcmPercentagePUC: data.pcmPercentagePUC || null,
            remarks: "Initial enrolment recorded.",
          },
        });
      }

      // Assign mentor if selected
      if (data.assignedMentorId) {
        // Enforce max capacity ceiling
        const maxSetting = await tx.institutionalSetting.findUnique({
          where: { settingKey: "MAX_MENTEES_PER_PROCTOR" },
        });
        const maxCapacity = maxSetting ? parseInt(maxSetting.settingValue, 10) : 25;

        const currentActiveCount = await tx.mentorAssignment.count({
          where: {
            mentorFacultyId: data.assignedMentorId,
            status: "ACTIVE",
          },
        });

        if (currentActiveCount >= maxCapacity) {
          throw new Error(`Selected mentor has reached the maximum permitted capacity (${maxCapacity} mentees).`);
        }

        await tx.mentorAssignment.create({
          data: {
            studentId: newStudent.id,
            mentorFacultyId: data.assignedMentorId,
            roleType: data.mentorRoleType,
            status: "ACTIVE",
            assignedById: auth.user.id,
          },
        });
      }

      return newStudent;
    });

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorRole: auth.user.role,
      action: "STUDENT_CREATED",
      entityType: "Student",
      entityId: student.id,
      details: {
        institutionalId: student.institutionalId,
        departmentId: student.departmentId,
        semester: student.currentSemester,
      },
    });

    return NextResponse.json({ success: true, student }, { status: 201 });
  } catch (err: any) {
    console.error("Student creation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create student record" },
      { status: 400 }
    );
  }
}
