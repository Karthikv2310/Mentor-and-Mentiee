import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { checkRateLimit, createSession } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Browser";

    // Rate limiting: max 5 login attempts per minute per IP
    const rateCheck = checkRateLimit(`login_${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait 1 minute before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        facultyProfile: true,
        studentProfile: true,
      },
    });

    if (!user || !user.isActive) {
      await logAuditEvent({
        actorEmail: email,
        action: "LOGIN_FAILED",
        entityType: "User",
        ipAddress: ip,
        userAgent,
        details: { reason: "User not found or deactivated" },
      });
      return NextResponse.json(
        { error: "Invalid institutional credentials or inactive account" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      await logAuditEvent({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "LOGIN_FAILED",
        entityType: "User",
        entityId: user.id,
        ipAddress: ip,
        userAgent,
        details: { reason: "Incorrect password" },
      });
      return NextResponse.json(
        { error: "Invalid institutional credentials" },
        { status: 401 }
      );
    }

    // Create session token & cookie
    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role as "ADMIN" | "HOD" | "TEACHER" | "STUDENT",
      firstName: user.firstName,
      lastName: user.lastName,
      departmentScopeId: user.departmentScopeId,
    });

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: "LOGIN_SUCCESS",
      entityType: "User",
      entityId: user.id,
      ipAddress: ip,
      userAgent,
      details: { role: user.role },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        departmentScopeId: user.departmentScopeId,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (err: unknown) {
    console.error("Login endpoint error:", err);
    return NextResponse.json(
      { error: "Internal server error occurred during authentication" },
      { status: 500 }
    );
  }
}
