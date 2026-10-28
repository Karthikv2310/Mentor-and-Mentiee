import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorizeUser } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const auth = await authorizeUser(["ADMIN", "HOD", "TEACHER"]);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const departmentId = searchParams.get("departmentId");

  // Determine scoped department
  let targetDepartmentId: string | undefined = undefined;
  if (auth.user.role === "HOD" || auth.user.role === "TEACHER") {
    targetDepartmentId = auth.user.departmentScopeId || undefined;
  } else if (departmentId) {
    targetDepartmentId = departmentId;
  }

  const studentWhere: any = {};
  if (targetDepartmentId) studentWhere.departmentId = targetDepartmentId;

  // 1. Total Enrolled Students
  const totalStudents = await prisma.studentProfile.count({ where: studentWhere });

  // 2. Students without Active Mentor
  const unassignedStudents = await prisma.studentProfile.findMany({
    where: {
      ...studentWhere,
      mentorAssignments: {
        none: { status: "ACTIVE" },
      },
    },
    include: { department: true, programme: true },
    take: 50,
  });

  // 3. Mentor Workload Distribution
  const facultyWhere: any = { approvalStatus: "APPROVED" };
  if (targetDepartmentId) facultyWhere.departmentId = targetDepartmentId;

  const facultyWorkload = await prisma.facultyProfile.findMany({
    where: facultyWhere,
    include: {
      department: true,
      _count: {
        select: {
          mentorAssignments: { where: { status: "ACTIVE" } },
        },
      },
    },
    orderBy: { fullName: "asc" },
  });

  // Capacity limit setting
  const capSetting = await prisma.institutionalSetting.findUnique({
    where: { settingKey: "MAX_MENTEES_PER_PROCTOR" },
  });
  const maxCapacity = capSetting ? parseInt(capSetting.settingValue, 10) : 25;

  const workloadSummary = facultyWorkload.map((f) => ({
    id: f.id,
    name: `${f.prefix || ""} ${f.fullName}`.trim(),
    department: f.department.code,
    designation: f.designation,
    activeMentees: f._count.mentorAssignments,
    maxCapacity,
    utilizationPercent: Math.round((f._count.mentorAssignments / maxCapacity) * 100),
  }));

  // 4. Meeting Statistics
  const meetingWhere: any = {};
  if (targetDepartmentId) {
    meetingWhere.createdBy = { departmentScopeId: targetDepartmentId };
  }

  const totalMeetings = await prisma.meeting.count({ where: meetingWhere });
  const completedMeetings = await prisma.meeting.count({
    where: { ...meetingWhere, status: "COMPLETED" },
  });
  const scheduledMeetings = await prisma.meeting.count({
    where: { ...meetingWhere, status: "CONFIRMED" },
  });

  // 5. Action Items Status
  const actionWhere: any = {};
  if (targetDepartmentId) {
    actionWhere.student = { departmentId: targetDepartmentId };
  }

  const totalActionItems = await prisma.actionItem.count({ where: actionWhere });
  const openActionItems = await prisma.actionItem.count({
    where: { ...actionWhere, status: "OPEN" },
  });
  const completedActionItems = await prisma.actionItem.count({
    where: { ...actionWhere, status: "COMPLETED" },
  });

  // 6. NMAMIT Attendance Shortage Count (<75% attendance)
  const attendanceShortageStudents = await prisma.studentProgression.findMany({
    where: {
      attendanceShortageFlag: true,
      ...(targetDepartmentId && { student: { departmentId: targetDepartmentId } }),
    },
    include: {
      student: {
        include: {
          department: true,
          mentorAssignments: {
            where: { status: "ACTIVE" },
            include: { mentorFaculty: true },
          },
        },
      },
    },
    take: 50,
  });

  // 7. Recent System Import Failures
  const recentImportFailures = await prisma.importRowError.findMany({
    take: 20,
    orderBy: { id: "desc" },
    include: {
      importJob: { select: { fileName: true, createdAt: true } },
    },
  });

  return NextResponse.json({
    success: true,
    meta: {
      generatedAt: new Date().toISOString(),
      timezone: "Asia/Kolkata",
      scope: targetDepartmentId ? `Department ${targetDepartmentId}` : "Institutional (All Departments)",
    },
    metrics: {
      totalStudents,
      unassignedCount: unassignedStudents.length,
      assignedCount: totalStudents - unassignedStudents.length,
      totalMeetings,
      completedMeetings,
      scheduledMeetings,
      totalActionItems,
      openActionItems,
      completedActionItems,
      attendanceShortageCount: attendanceShortageStudents.length,
    },
    unassignedStudents,
    workloadSummary,
    attendanceShortageStudents,
    recentImportFailures,
  });
}
