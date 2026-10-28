import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nmamit-portal-secure-production-ready-secret-key-2026-nitte"
);

export const SESSION_COOKIE_NAME = "nmamit_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "HOD" | "TEACHER" | "STUDENT";
  firstName: string;
  lastName: string;
  departmentScopeId?: string | null;
}

// In-memory sliding rate limiter for authentication & sensitive endpoints
const rateLimitMap = new Map<string, { count: number; firstRequestTime: number }>();

export function checkRateLimit(key: string, limit = 5, windowMs = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry) {
    rateLimitMap.set(key, { count: 1, firstRequestTime: now });
    return { allowed: true, remaining: limit - 1 };
  }

  if (now - entry.firstRequestTime > windowMs) {
    rateLimitMap.set(key, { count: 1, firstRequestTime: now });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      facultyProfile: {
        include: { department: true },
      },
      studentProfile: {
        include: {
          department: true,
          programme: true,
          mentorAssignments: {
            where: { status: "ACTIVE" },
            include: { mentorFaculty: true },
          },
        },
      },
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return user;
}
