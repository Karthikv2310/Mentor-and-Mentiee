import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { checkRateLimit, createSession } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  institutionalId: z
    .string()
    .min(5, "USN must be at least 5 characters")
    .transform((val) => val.trim().toUpperCase()),
  email: z.string().email("Invalid email address").transform((val) => val.trim().toLowerCase()),
  password: z.string().min(6, "Password must be at least 6 characters"),
  departmentCode: z.string().optional(),
  departmentId: z.string().optional(),
  currentSemester: z.number().int().min(1).max(8).optional().default(1),
  section: z.string().optional().default("A"),
  admissionYear: z.number().int().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Browser";

    // Rate limiting: 5 registrations per 10 minutes per IP
    const rateCheck = checkRateLimit(`register_${ip}`, 5, 600000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please wait a few minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      fullName,
      institutionalId,
      email,
      password,
      departmentCode,
      departmentId,
      currentSemester,
      section,
    } = result.data;

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // Check if USN / institutional ID already registered
    const existingStudent = await prisma.studentProfile.findUnique({
      where: { institutionalId },
    });
    if (existingStudent && existingStudent.userId) {
      return NextResponse.json(
        { error: `USN ${institutionalId} is already linked to an active account. Please sign in.` },
        { status: 409 }
      );
    }

    // Resolve Department
    let department = null;
    if (departmentId) {
      department = await prisma.department.findUnique({ where: { id: departmentId } });
    }
    if (!department && departmentCode) {
      department = await prisma.department.findUnique({ where: { code: departmentCode.toUpperCase() } });
    }
    if (!department) {
      // Fallback to first available department (e.g. CSE or ISE)
      department = await prisma.department.findFirst({ where: { isActive: true } });
    }

    if (!department) {
      return NextResponse.json(
        { error: "No active academic departments configured in the database." },
        { status: 400 }
      );
    }

    // Resolve or find Programme
    let programme = await prisma.programme.findFirst({
      where: { departmentId: department.id },
    });
    if (!programme) {
      programme = await prisma.programme.create({
        data: {
          code: `BTECH_${department.code}`,
          name: `B.Tech in ${department.name}`,
          departmentId: department.id,
          degreeLevel: "UG",
          durationYears: 4,
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "Student";
    const admissionYear = result.data.admissionYear || new Date().getFullYear();

    // Create User and StudentProfile
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "STUDENT",
        firstName,
        lastName,
        isActive: true,
      },
    });

    let studentProfile = null;
    if (existingStudent) {
      // Connect existing unlinked profile
      studentProfile = await prisma.studentProfile.update({
        where: { id: existingStudent.id },
        data: {
          userId: user.id,
          fullName,
          institutionalEmail: email,
          departmentId: department.id,
          programmeId: programme.id,
          currentSemester,
          section,
        },
      });
    } else {
      studentProfile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          institutionalId,
          fullName,
          institutionalEmail: email,
          departmentId: department.id,
          programmeId: programme.id,
          admissionYear,
          currentSemester,
          section,
          admissionCategory: "REGULAR",
          enrolmentStatus: "ACTIVE",
          approvalStatus: "APPROVED",
        },
      });
    }

    // Create session cookie
    await createSession({
      userId: user.id,
      email: user.email,
      role: "STUDENT",
      firstName: user.firstName,
      lastName: user.lastName,
    });

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: "STUDENT",
      action: "STUDENT_CREATED",
      entityType: "User",
      entityId: user.id,
      ipAddress: ip,
      userAgent,
      details: {
        selfRegistered: true,
        usn: institutionalId,
        departmentCode: department.code,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        usn: institutionalId,
        studentProfileId: studentProfile.id,
      },
    });
  } catch (err: unknown) {
    console.error("Student registration error:", err);
    return NextResponse.json(
      { error: "Internal server error occurred during registration" },
      { status: 500 }
    );
  }
}
