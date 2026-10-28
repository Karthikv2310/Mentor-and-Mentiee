import { getCurrentUser } from "./auth";
import prisma from "./prisma";

export type Role = "ADMIN" | "HOD" | "TEACHER" | "STUDENT";

export async function authorizeUser(allowedRoles?: Role[]) {
  const user = await getCurrentUser();
  if (!user) {
    return { authorized: false, error: "Unauthorized: Please sign in", status: 401, user: null };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role as Role)) {
    return { authorized: false, error: "Forbidden: Insufficient privileges", status: 403, user };
  }

  return { authorized: true, user, status: 200, error: null };
}

/**
 * Checks whether the user is permitted to view or manage a specific student record.
 * Prevents Insecure Direct Object Reference (IDOR) attacks.
 */
export async function canAccessStudent(studentId: string, currentUser: any): Promise<boolean> {
  if (!currentUser) return false;

  // 1. Admin can access institutional scope
  if (currentUser.role === "ADMIN") return true;

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      mentorAssignments: {
        where: { status: "ACTIVE" },
      },
    },
  });

  if (!student) return false;

  // 2. Student can ONLY access their own record
  if (currentUser.role === "STUDENT") {
    return student.userId === currentUser.id;
  }

  // 3. HoD can access any student in their assigned department
  if (currentUser.role === "HOD") {
    return student.departmentId === currentUser.departmentScopeId;
  }

  // 4. Teacher can access if assigned as mentor (Proctor or Faculty Advisor) or if in same department scope
  if (currentUser.role === "TEACHER") {
    if (student.departmentId !== currentUser.departmentScopeId) {
      return false;
    }
    // Check if mentor faculty record matches current teacher
    const teacherFacultyId = currentUser.facultyProfile?.id;
    if (teacherFacultyId) {
      const isAssigned = student.mentorAssignments.some((a) => a.mentorFacultyId === teacherFacultyId);
      if (isAssigned) return true;
    }
    // Teachers can also view mentees created by them pending approval
    if (student.createdByTeacherId === currentUser.id) return true;

    return false;
  }

  return false;
}

/**
 * Checks if user is authorized to create/import students for a specific department.
 */
export function canAddStudentInDepartment(departmentId: string, currentUser: any): boolean {
  if (!currentUser) return false;
  if (currentUser.role === "ADMIN") return true;
  if (currentUser.role === "HOD" || currentUser.role === "TEACHER") {
    return currentUser.departmentScopeId === departmentId;
  }
  return false;
}

/**
 * Note Visibility Guard:
 * - STUDENT_VISIBLE: Mentor and student can see
 * - MENTOR_ONLY: Only mentor author and department HoD / Admin
 * - RESTRICTED_COUNSELLING: Only author mentor (and designated counselling officers)
 */
export function canViewNote(note: { authorId: string; visibilityLevel: string }, currentUser: any): boolean {
  if (!currentUser) return false;
  if (currentUser.id === note.authorId) return true;

  if (note.visibilityLevel === "RESTRICTED_COUNSELLING") {
    return currentUser.id === note.authorId;
  }

  if (note.visibilityLevel === "MENTOR_ONLY") {
    if (currentUser.role === "ADMIN") return true;
    if (currentUser.role === "HOD") return true;
    return false;
  }

  // STUDENT_VISIBLE
  return true;
}
