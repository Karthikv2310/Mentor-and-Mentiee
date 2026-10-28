import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Starting NMAMIT Database Seeding...");

  // 1. Institutional Settings
  const settings = [
    {
      settingKey: "INSTITUTION_NAME",
      settingValue: "NMAM Institute of Technology, Nitte",
      description: "Official institutional entity name",
    },
    {
      settingKey: "STUDENT_ID_LABEL",
      settingValue: "USN / NDU Registration Number",
      description: "Display label for institutional student identifiers",
    },
    {
      settingKey: "MAX_MENTEES_PER_PROCTOR",
      settingValue: "25",
      description: "Configurable proctor capacity ceiling per faculty member",
    },
    {
      settingKey: "DEFAULT_TIMEZONE",
      settingValue: "Asia/Kolkata",
      description: "Standard institutional timezone for calendar and meetings",
    },
    {
      settingKey: "DATA_RETENTION_YEARS",
      settingValue: "7",
      description: "Policy archival duration for graduation cohorts",
    },
    {
      settingKey: "MSE1_INTERVENTION_MANDATORY",
      settingValue: "true",
      description: "Mandatory mentoring review for slow learners following Mid-Sem Exam 1",
    },
  ];

  for (const s of settings) {
    await prisma.institutionalSetting.upsert({
      where: { settingKey: s.settingKey },
      update: { settingValue: s.settingValue, description: s.description },
      create: s,
    });
  }

  // 2. Source Verification Records
  const verifications = [
    {
      entityType: "INSTITUTION",
      entityIdentifier: "NMAMIT_NITTE",
      verifiedField: "GOVERNANCE_AND_NAME",
      verifiedValue: "Nitte Mahalinga Adyanthaya Memorial Institute of Technology, Constituent college of Nitte DU",
      sourceUrl: "https://nitte.edu.in/nmamit/about-nmamit-nitte.php",
      verificationStatus: "VERIFIED",
    },
    {
      entityType: "MENTORING_POLICY",
      entityIdentifier: "DUAL_MENTORING_SYSTEM",
      verifiedField: "FACULTY_ADVISOR_AND_PROCTOR",
      verifiedValue: "Class Proctor (2 per class for attendance/sessional exams) and Faculty Advisor (PUC PCM <65%, NRI, slow learners)",
      sourceUrl: "https://nitte.edu.in/nmamit/student-mentoring.php",
      verificationStatus: "VERIFIED",
    },
    {
      entityType: "DEPARTMENT",
      entityIdentifier: "CSE_DEPT",
      verifiedField: "PROGRAMS_AND_HOD",
      verifiedValue: "B.Tech CSE (360 intake), M.Tech, Ph.D; HoD: Dr. Raju K",
      sourceUrl: "https://nitte.edu.in/nmamit/department-computer-science.php",
      verificationStatus: "VERIFIED",
    },
    {
      entityType: "DEPARTMENT",
      entityIdentifier: "ISE_DEPT",
      verifiedField: "PROGRAMS_AND_HOD",
      verifiedValue: "B.Tech ISE; HoD: Dr. Ashwini B",
      sourceUrl: "https://nitte.edu.in/nmamit/department-information-science.php",
      verificationStatus: "VERIFIED",
    },
  ];

  for (const v of verifications) {
    const existing = await prisma.sourceVerificationRecord.findFirst({
      where: { entityIdentifier: v.entityIdentifier, verifiedField: v.verifiedField },
    });
    if (!existing) {
      await prisma.sourceVerificationRecord.create({ data: v });
    }
  }

  // 3. Departments
  const departmentsData = [
    { code: "CSE", name: "Computer Science & Engineering", intakeCapacity: 360 },
    { code: "ISE", name: "Information Science & Engineering", intakeCapacity: 180 },
    { code: "ECE", name: "Electronics & Communication Engineering", intakeCapacity: 180 },
    { code: "AI_DS", name: "Artificial Intelligence & Data Science", intakeCapacity: 120 },
    { code: "AI_ML", name: "Artificial Intelligence & Machine Learning", intakeCapacity: 60 },
    { code: "CCE", name: "Computer & Communication Engineering", intakeCapacity: 60 },
    { code: "CS_CY", name: "Computer Science & Engineering (Cyber Security)", intakeCapacity: 60 },
    { code: "EEE", name: "Electrical & Electronics Engineering", intakeCapacity: 60 },
    { code: "MECH", name: "Mechanical Engineering", intakeCapacity: 60 },
    { code: "CIVIL", name: "Civil Engineering", intakeCapacity: 60 },
    { code: "BT", name: "Biotechnology", intakeCapacity: 60 },
    { code: "RAI", name: "Robotics & Artificial Intelligence", intakeCapacity: 60 },
  ];

  const createdDepartments: Record<string, string> = {};
  for (const dept of departmentsData) {
    const d = await prisma.department.upsert({
      where: { code: dept.code },
      update: { name: dept.name, intakeCapacity: dept.intakeCapacity },
      create: dept,
    });
    createdDepartments[dept.code] = d.id;
  }

  // 4. Programmes
  const programmesData = [
    { code: "BTECH_CSE", departmentId: createdDepartments["CSE"], name: "B.Tech in Computer Science & Engineering", degreeLevel: "UG", durationYears: 4 },
    { code: "BTECH_ISE", departmentId: createdDepartments["ISE"], name: "B.Tech in Information Science & Engineering", degreeLevel: "UG", durationYears: 4 },
    { code: "BTECH_ECE", departmentId: createdDepartments["ECE"], name: "B.Tech in Electronics & Communication Engineering", degreeLevel: "UG", durationYears: 4 },
    { code: "MTECH_CSE", departmentId: createdDepartments["CSE"], name: "M.Tech in Computer Science & Engineering", degreeLevel: "PG", durationYears: 2 },
  ];

  const createdProgrammes: Record<string, string> = {};
  for (const prog of programmesData) {
    const p = await prisma.programme.upsert({
      where: { code: prog.code },
      update: { name: prog.name, degreeLevel: prog.degreeLevel },
      create: prog,
    });
    createdProgrammes[prog.code] = p.id;
  }

  // 5. Academic Years
  const academicYears = [
    { name: "2024-2025", isCurrent: false, startDate: new Date("2024-08-01"), endDate: new Date("2025-06-30") },
    { name: "2025-2026", isCurrent: false, startDate: new Date("2025-08-01"), endDate: new Date("2026-06-30") },
    { name: "2026-2027", isCurrent: true, startDate: new Date("2026-08-01"), endDate: new Date("2027-06-30") },
  ];

  const createdAYs: Record<string, string> = {};
  for (const ay of academicYears) {
    const a = await prisma.academicYear.upsert({
      where: { name: ay.name },
      update: { isCurrent: ay.isCurrent },
      create: ay,
    });
    createdAYs[ay.name] = a.id;
  }

  // 6. Batch Sections
  const batchSectionData = [
    { programmeId: createdProgrammes["BTECH_CSE"], academicYearId: createdAYs["2026-2027"], admissionYear: 2023, semester: 5, sectionName: "A", capacity: 60 },
    { programmeId: createdProgrammes["BTECH_CSE"], academicYearId: createdAYs["2026-2027"], admissionYear: 2023, semester: 5, sectionName: "B", capacity: 60 },
    { programmeId: createdProgrammes["BTECH_CSE"], academicYearId: createdAYs["2026-2027"], admissionYear: 2024, semester: 3, sectionName: "A", capacity: 60 },
    { programmeId: createdProgrammes["BTECH_ISE"], academicYearId: createdAYs["2026-2027"], admissionYear: 2023, semester: 5, sectionName: "A", capacity: 60 },
  ];

  for (const bs of batchSectionData) {
    await prisma.batchSection.upsert({
      where: {
        programmeId_academicYearId_semester_sectionName: {
          programmeId: bs.programmeId,
          academicYearId: bs.academicYearId,
          semester: bs.semester,
          sectionName: bs.sectionName,
        },
      },
      update: { capacity: bs.capacity },
      create: bs,
    });
  }

  // 7. Staged Faculty (Verified Public Data from official nitte.edu.in pages)
  const stagedFaculty = [
    {
      stagingRefId: "FAC52",
      employeeCode: "EMP_CSE_001",
      prefix: "Dr.",
      fullName: "Niranjan N. Chiplunkar",
      designation: "Principal & Professor",
      departmentId: createdDepartments["CSE"],
      officialProfileUrl: "https://nitte.edu.in/nmamit/department-computer-science.php",
      photoUrl: "https://nitte.edu.in/admin/photo/3/faculty/5/52.jpg",
      approvalStatus: "APPROVED",
      isVerified: true,
    },
    {
      stagingRefId: "FAC62",
      employeeCode: "EMP_CSE_002",
      prefix: "Dr.",
      fullName: "Raju K",
      designation: "Professor & Head",
      departmentId: createdDepartments["CSE"],
      officialProfileUrl: "https://nitte.edu.in/nmamit/department-computer-science.php",
      photoUrl: "https://nitte.edu.in/admin/photo/3/faculty/5/62.jpg",
      approvalStatus: "APPROVED",
      isVerified: true,
    },
    {
      stagingRefId: "FAC56",
      employeeCode: "EMP_CSE_003",
      prefix: "Dr.",
      fullName: "Jyothi Shetty",
      designation: "Professor",
      departmentId: createdDepartments["CSE"],
      officialProfileUrl: "https://nitte.edu.in/nmamit/department-computer-science.php",
      photoUrl: "https://nitte.edu.in/admin/photo/3/faculty/5/56.jpg",
      approvalStatus: "APPROVED",
      isVerified: true,
    },
    {
      stagingRefId: "FAC59",
      employeeCode: "EMP_CSE_004",
      prefix: "Dr.",
      fullName: "Sudeepa K B",
      designation: "Associate Professor",
      departmentId: createdDepartments["CSE"],
      officialProfileUrl: "https://nitte.edu.in/nmamit/department-computer-science.php",
      photoUrl: "https://nitte.edu.in/admin/photo/3/faculty/5/59.jpg",
      approvalStatus: "APPROVED",
      isVerified: true,
    },
    {
      stagingRefId: "FAC87",
      employeeCode: "EMP_CSE_005",
      prefix: "Dr.",
      fullName: "Shashank Shetty",
      designation: "Associate Professor & Lead - Innovation",
      departmentId: createdDepartments["CSE"],
      officialProfileUrl: "https://nitte.edu.in/nmamit/department-computer-science.php",
      photoUrl: "https://nitte.edu.in/admin/photo/3/faculty/5/87.jpg",
      approvalStatus: "STAGED", // Staged awaiting admin review
      isVerified: true,
    },
    {
      stagingRefId: "FAC186",
      employeeCode: "EMP_ISE_001",
      prefix: "Dr.",
      fullName: "Ashwini B",
      designation: "Professor & Head",
      departmentId: createdDepartments["ISE"],
      officialProfileUrl: "https://nitte.edu.in/nmamit/department-information-science.php",
      photoUrl: "https://nitte.edu.in/admin/photo/3/faculty/8/186.jpg",
      approvalStatus: "APPROVED",
      isVerified: true,
    },
    {
      stagingRefId: "FAC177",
      employeeCode: "EMP_ISE_002",
      prefix: "Dr.",
      fullName: "Balasubramani R",
      designation: "Professor",
      departmentId: createdDepartments["ISE"],
      officialProfileUrl: "https://nitte.edu.in/nmamit/department-information-science.php",
      photoUrl: "https://nitte.edu.in/admin/photo/3/faculty/8/177.jpg",
      approvalStatus: "STAGED", // Staged awaiting review
      isVerified: true,
    },
  ];

  const facultyRecords: Record<string, any> = {};
  for (const fac of stagedFaculty) {
    const f = await prisma.facultyProfile.upsert({
      where: { employeeCode: fac.employeeCode },
      update: {
        designation: fac.designation,
        approvalStatus: fac.approvalStatus,
        officialProfileUrl: fac.officialProfileUrl,
        photoUrl: fac.photoUrl,
      },
      create: fac,
    });
    facultyRecords[fac.stagingRefId] = f;
  }

  // 8. Demonstration Users (Strictly labeled synthetic demo credentials)
  const defaultPassword = await bcrypt.hash("NmamitPortal@2026", 10);
  const adminPassword = await bcrypt.hash("NmamitAdmin@2026", 10);
  const hodPassword = await bcrypt.hash("NmamitHod@2026", 10);
  const mentorPassword = await bcrypt.hash("NmamitMentor@2026", 10);
  const studentPassword = await bcrypt.hash("NmamitStudent@2026", 10);

  // Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@nmamit.in" },
    update: { role: "ADMIN", isActive: true },
    create: {
      email: "admin@nmamit.in",
      passwordHash: adminPassword,
      role: "ADMIN",
      firstName: "Institutional",
      lastName: "Administrator",
      isActive: true,
    },
  });

  // HoD User (Linked to Dr. Raju K, HoD CSE)
  const hodUser = await prisma.user.upsert({
    where: { email: "hod.cse@nmamit.in" },
    update: { role: "HOD", departmentScopeId: createdDepartments["CSE"], isActive: true },
    create: {
      email: "hod.cse@nmamit.in",
      passwordHash: hodPassword,
      role: "HOD",
      firstName: "Raju",
      lastName: "K",
      departmentScopeId: createdDepartments["CSE"],
      isActive: true,
    },
  });
  await prisma.facultyProfile.update({
    where: { id: facultyRecords["FAC62"].id },
    data: { userId: hodUser.id },
  });

  // Teacher / Mentor User (Linked to Dr. Sudeepa K B)
  const mentorUser = await prisma.user.upsert({
    where: { email: "mentor.cse@nmamit.in" },
    update: { role: "TEACHER", departmentScopeId: createdDepartments["CSE"], isActive: true },
    create: {
      email: "mentor.cse@nmamit.in",
      passwordHash: mentorPassword,
      role: "TEACHER",
      firstName: "Sudeepa",
      lastName: "K B",
      departmentScopeId: createdDepartments["CSE"],
      isActive: true,
    },
  });
  await prisma.facultyProfile.update({
    where: { id: facultyRecords["FAC59"].id },
    data: { userId: mentorUser.id },
  });

  // Synthetic Demo Student
  const studentUser = await prisma.user.upsert({
    where: { email: "student.demo@nmamit.in" },
    update: { role: "STUDENT", isActive: true },
    create: {
      email: "student.demo@nmamit.in",
      passwordHash: studentPassword,
      role: "STUDENT",
      firstName: "Aditya",
      lastName: "Rao",
      isActive: true,
    },
  });

  const demoStudent = await prisma.studentProfile.upsert({
    where: { institutionalId: "4NM23CS042" },
    update: {
      fullName: "Aditya Rao (Demo Mentee)",
      currentSemester: 5,
      section: "A",
      departmentId: createdDepartments["CSE"],
      programmeId: createdProgrammes["BTECH_CSE"],
    },
    create: {
      userId: studentUser.id,
      institutionalId: "4NM23CS042",
      fullName: "Aditya Rao (Demo Mentee)",
      institutionalEmail: "student.demo@nmamit.in",
      departmentId: createdDepartments["CSE"],
      programmeId: createdProgrammes["BTECH_CSE"],
      admissionYear: 2023,
      currentSemester: 5,
      section: "A",
      admissionCategory: "REGULAR",
      enrolmentStatus: "ACTIVE",
      approvalStatus: "APPROVED",
    },
  });

  // Additional Synthetic Demo Students for Workload & Reports
  const demoStudent2 = await prisma.studentProfile.upsert({
    where: { institutionalId: "4NM23CS088" },
    update: {},
    create: {
      institutionalId: "4NM23CS088",
      fullName: "Kavya S. Shetty (Demo Mentee)",
      institutionalEmail: "kavya.demo@nmamit.in",
      departmentId: createdDepartments["CSE"],
      programmeId: createdProgrammes["BTECH_CSE"],
      admissionYear: 2023,
      currentSemester: 5,
      section: "A",
      admissionCategory: "REGULAR",
      enrolmentStatus: "ACTIVE",
      approvalStatus: "APPROVED",
    },
  });

  const demoStudent3 = await prisma.studentProfile.upsert({
    where: { institutionalId: "NNM24CS115" },
    update: {},
    create: {
      institutionalId: "NNM24CS115",
      fullName: "Mohammed Farhan (Demo Mentee)",
      institutionalEmail: "farhan.demo@nmamit.in",
      departmentId: createdDepartments["CSE"],
      programmeId: createdProgrammes["BTECH_CSE"],
      admissionYear: 2024,
      currentSemester: 3,
      section: "B",
      admissionCategory: "NRI", // NRI student with <65% PCM flagged for Faculty Advisor
      enrolmentStatus: "ACTIVE",
      approvalStatus: "APPROVED",
    },
  });

  // 9. Student Progressions
  await prisma.studentProgression.upsert({
    where: { studentId_semester: { studentId: demoStudent.id, semester: 4 } },
    update: {},
    create: {
      studentId: demoStudent.id,
      academicYearId: createdAYs["2025-2026"],
      semester: 4,
      section: "A",
      sgpa: 8.42,
      cgpa: 8.35,
      attendancePercentage: 88.5,
      attendanceShortageFlag: false,
      pcmPercentagePUC: 78.0,
      remarks: "Consistent academic progress in Design and Analysis of Algorithms.",
    },
  });

  await prisma.studentProgression.upsert({
    where: { studentId_semester: { studentId: demoStudent3.id, semester: 2 } },
    update: {},
    create: {
      studentId: demoStudent3.id,
      academicYearId: createdAYs["2025-2026"],
      semester: 2,
      section: "B",
      sgpa: 6.2,
      cgpa: 6.4,
      attendancePercentage: 74.0,
      attendanceShortageFlag: true, // Flagged under NMAMIT mentoring policy (<75%)
      pcmPercentagePUC: 62.5,       // Flagged under NMAMIT policy (<65%)
      remarks: "Attendance shortage in Engineering Mathematics-II. Recommended for remedial tutoring.",
    },
  });

  // 10. Mentor Assignments (Class Proctor & Faculty Advisor)
  await prisma.mentorAssignment.create({
    data: {
      studentId: demoStudent.id,
      mentorFacultyId: facultyRecords["FAC59"].id,
      roleType: "CLASS_PROCTOR",
      status: "ACTIVE",
      assignedById: adminUser.id,
      effectiveStartDate: new Date("2024-08-10"),
    },
  });

  await prisma.mentorAssignment.create({
    data: {
      studentId: demoStudent3.id,
      mentorFacultyId: facultyRecords["FAC59"].id,
      roleType: "FACULTY_ADVISOR",
      status: "ACTIVE",
      assignedById: hodUser.id,
      reassignmentReason: "Allotted Faculty Advisor as per NMAMIT criteria (PCM PUC <65% and MSE-1 Mathematics intervention)",
      effectiveStartDate: new Date("2024-09-01"),
    },
  });

  // 11. Initial Meeting with Tiered Notes
  const meetingDate = new Date();
  meetingDate.setDate(meetingDate.getDate() - 3); // 3 days ago

  const demoMeeting = await prisma.meeting.create({
    data: {
      title: "Mid-Semester Performance & Career Goal Review (MSE-1)",
      description: "Review of MSE-1 performance, attendance consistency, and skill roadmap for 5th semester.",
      sessionType: "ONE_ON_ONE",
      agendaCategory: "MSE1_REVIEW",
      scheduledAt: meetingDate,
      durationMinutes: 30,
      locationOrLink: "Faculty Chamber - Block 2, Room 204",
      status: "COMPLETED",
      createdById: mentorUser.id,
      participants: {
        create: {
          studentId: demoStudent.id,
          attendanceStatus: "PRESENT",
          feedbackNotes: "Discussed data structures revision and mini-project timeline.",
        },
      },
      notes: {
        createMany: {
          data: [
            {
              authorId: mentorUser.id,
              visibilityLevel: "STUDENT_VISIBLE",
              noteContent: "Agreed to complete two LeetCode Medium problems weekly on Trees and Dynamic Programming. Maintain minimum 85% attendance in OS and DBMS.",
            },
            {
              authorId: mentorUser.id,
              visibilityLevel: "MENTOR_ONLY",
              noteContent: "Student appears confident in coding but expresses mild anxiety regarding MSE-2 theory paper time management. Mentor will follow up after next mock quiz.",
            },
          ],
        },
      },
    },
  });

  // 12. Action Items
  const dueNextWeek = new Date();
  dueNextWeek.setDate(dueNextWeek.getDate() + 7);

  await prisma.actionItem.create({
    data: {
      studentId: demoStudent.id,
      meetingId: demoMeeting.id,
      title: "Submit DBMS Mini-Project ER Diagram draft",
      description: "Prepare and share the normalized database design schema for the student hospital portal.",
      assignedToRole: "STUDENT",
      priority: "HIGH",
      status: "OPEN",
      dueDate: dueNextWeek,
    },
  });

  await prisma.actionItem.create({
    data: {
      studentId: demoStudent.id,
      meetingId: demoMeeting.id,
      title: "Confirm remedial class schedule with Math faculty",
      description: "Mentor will coordinate with Department of Mathematics for Friday afternoon tutorial slot.",
      assignedToRole: "MENTOR",
      priority: "MEDIUM",
      status: "COMPLETED",
      dueDate: meetingDate,
      completedAt: new Date(),
      outcomeNotes: "Confirmed with Dr. Mathematics instructor; tutorial scheduled Fridays 3:30 PM.",
    },
  });

  // 13. Audit Log Sample
  await prisma.auditEvent.create({
    data: {
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      actorRole: "ADMIN",
      action: "INSTITUTIONAL_INIT",
      entityType: "System",
      entityId: "PORTAL_INIT",
      ipAddress: "127.0.0.1",
      userAgent: "NMAMIT Portal Seed Utility",
      detailsJson: JSON.stringify({ message: "NMAMIT initial seeding completed with verified public departments and staged faculty." }),
    },
  });

  console.log("✅ NMAMIT Database Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
