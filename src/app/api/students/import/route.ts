import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import prisma from "@/lib/prisma";
import { authorizeUser, canAddStudentInDepartment } from "@/lib/rbac";
import { logAuditEvent } from "@/lib/audit";

interface ImportRow {
  institutionalId: string;
  fullName: string;
  institutionalEmail?: string;
  departmentCode: string;
  programmeCode: string;
  admissionYear: string | number;
  currentSemester: string | number;
  section: string;
  admissionCategory?: string;
  pcmPercentagePUC?: string | number;
}

interface RowValidationResult {
  rowNumber: number;
  data: ImportRow;
  isValid: boolean;
  errors: string[];
  isExisting: boolean;
  departmentId?: string;
  programmeId?: string;
}

export async function POST(req: NextRequest) {
  const auth = await authorizeUser(["ADMIN", "HOD", "TEACHER"]);
  if (!auth.authorized || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { csvContent, dryRun = true, allowUpdates = false, fileName = "import.csv" } = body;

    if (!csvContent || typeof csvContent !== "string") {
      return NextResponse.json({ error: "Missing or invalid CSV content" }, { status: 400 });
    }

    // Parse CSV
    const parsed = Papa.parse<Record<string, string>>(csvContent.trim(), {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        { error: "CSV Parsing error", details: parsed.errors },
        { status: 400 }
      );
    }

    const rows = parsed.data;
    if (rows.length === 0) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    }

    if (rows.length > 500) {
      return NextResponse.json(
        { error: "Batch limit exceeded. Maximum 500 rows allowed per import." },
        { status: 400 }
      );
    }

    // Fetch reference data for validation
    const departments = await prisma.department.findMany();
    const deptMapByCode = new Map<string, any>(departments.map((d: any) => [d.code.toUpperCase(), d]));
    const programmes = await prisma.programme.findMany();
    const progMapByCode = new Map<string, any>(programmes.map((p: any) => [p.code.toUpperCase(), p]));

    // Check existing institutional IDs in database
    const allUSNsInFile = rows
      .map((r: any) => (r.institutionalId || r.USN || r.RegistrationNo || "").trim().toUpperCase())
      .filter(Boolean);

    const existingStudents = await prisma.studentProfile.findMany({
      where: { institutionalId: { in: allUSNsInFile } },
      select: { institutionalId: true, fullName: true, departmentId: true },
    });
    const existingUSNMap = new Map<string, any>(existingStudents.map((s: any) => [s.institutionalId, s]));

    // Validate rows and detect intra-file duplicates
    const seenUSNsInFile = new Set<string>();
    const validationResults: RowValidationResult[] = [];
    let validCount = 0;
    let errorCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      const rowNum = i + 2; // Accounting for 1-based index + header row
      const errors: string[] = [];

      const usn = (raw.institutionalId || raw.USN || raw.RegistrationNo || "").trim().toUpperCase();
      const fullName = (raw.fullName || raw.Name || "").trim();
      const email = (raw.institutionalEmail || raw.Email || "").trim().toLowerCase();
      const deptCode = (raw.departmentCode || raw.Department || "").trim().toUpperCase();
      const progCode = (raw.programmeCode || raw.Programme || "BTECH_" + deptCode).trim().toUpperCase();
      const admYear = parseInt(raw.admissionYear || raw.AdmissionYear || "2024", 10);
      const sem = parseInt(raw.currentSemester || raw.Semester || "1", 10);
      const sec = (raw.section || raw.Section || "A").trim().toUpperCase();
      const cat = (raw.admissionCategory || raw.Category || "REGULAR").trim().toUpperCase();
      const pcm = parseFloat(raw.pcmPercentagePUC || raw.PCM || "0");

      if (!usn) {
        errors.push("Institutional ID / USN is required.");
      } else if (seenUSNsInFile.has(usn)) {
        errors.push(`Duplicate ID '${usn}' within the CSV file.`);
      } else {
        seenUSNsInFile.add(usn);
      }

      if (!fullName || fullName.length < 2) {
        errors.push("Full Name is required (minimum 2 characters).");
      }

      const dept: any = deptMapByCode.get(deptCode);
      if (!dept) {
        errors.push(`Unknown department code '${deptCode}'. Valid: ${Array.from(deptMapByCode.keys()).join(", ")}`);
      } else {
        // Enforce RBAC data scope
        if (!canAddStudentInDepartment(dept.id, auth.user)) {
          errors.push(`Not authorized to import students into department '${deptCode}'.`);
        }
      }

      const prog: any = progMapByCode.get(progCode);
      if (!prog && dept) {
        errors.push(`Unknown programme code '${progCode}'.`);
      }

      if (isNaN(sem) || sem < 1 || sem > 8) {
        errors.push("Current Semester must be between 1 and 8.");
      }

      if (isNaN(admYear) || admYear < 2015 || admYear > 2035) {
        errors.push("Admission Year must be between 2015 and 2035.");
      }

      const isExisting = existingUSNMap.has(usn);
      if (isExisting && !allowUpdates) {
        errors.push(`Student with ID '${usn}' already exists in database. Check 'Allow Updates' to overwrite.`);
      }

      const rowResult: RowValidationResult = {
        rowNumber: rowNum,
        data: {
          institutionalId: usn,
          fullName,
          institutionalEmail: email || undefined,
          departmentCode: deptCode,
          programmeCode: progCode,
          admissionYear: admYear,
          currentSemester: sem,
          section: sec,
          admissionCategory: ["REGULAR", "LATERAL_ENTRY", "NRI", "MANAGEMENT"].includes(cat) ? cat : "REGULAR",
          pcmPercentagePUC: isNaN(pcm) ? undefined : pcm,
        },
        isValid: errors.length === 0,
        errors,
        isExisting,
        departmentId: dept?.id,
        programmeId: prog?.id,
      };

      if (errors.length === 0) {
        validCount++;
      } else {
        errorCount++;
      }

      validationResults.push(rowResult);
    }

    // If dry run, return preview and row validation report without committing
    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        summary: {
          totalRows: rows.length,
          validRows: validCount,
          invalidRows: errorCount,
          existingRows: validationResults.filter((r) => r.isExisting).length,
        },
        preview: validationResults.slice(0, 50),
        rowErrors: validationResults.filter((r) => !r.isValid),
      });
    }

    // If actual commit requested, ensure at least some valid rows exist
    if (validCount === 0) {
      return NextResponse.json(
        { error: "No valid rows to import. Correct the errors and try again.", rowErrors: validationResults },
        { status: 400 }
      );
    }

    // Commit valid rows in a transactional batch
    const targetDeptId = validationResults.find((r) => r.departmentId)?.departmentId || auth.user.departmentScopeId || departments[0].id;

    const importJob = await prisma.importJob.create({
      data: {
        importedById: auth.user.id,
        fileName,
        fileType: "CSV",
        departmentId: targetDeptId,
        totalRows: rows.length,
        successfulRows: validCount,
        failedRows: errorCount,
        status: "PROCESSING",
      },
    });

    const currentAY = await prisma.academicYear.findFirst({ where: { isCurrent: true } });

    await prisma.$transaction(async (tx: any) => {
      for (const row of validationResults) {
        if (!row.isValid) {
          // Log row-level error
          await tx.importRowError.create({
            data: {
              importJobId: importJob.id,
              rowNumber: row.rowNumber,
              rawDataJson: JSON.stringify(row.data),
              errorMessage: row.errors.join("; "),
              fieldName: "Multiple",
            },
          });
          continue;
        }

        const d = row.data;
        const student = await tx.studentProfile.upsert({
          where: { institutionalId: d.institutionalId },
          update: {
            fullName: d.fullName,
            institutionalEmail: d.institutionalEmail || null,
            departmentId: row.departmentId!,
            programmeId: row.programmeId!,
            currentSemester: Number(d.currentSemester),
            section: d.section,
            admissionCategory: d.admissionCategory || "REGULAR",
          },
          create: {
            institutionalId: d.institutionalId,
            fullName: d.fullName,
            institutionalEmail: d.institutionalEmail || null,
            departmentId: row.departmentId!,
            programmeId: row.programmeId!,
            admissionYear: Number(d.admissionYear),
            currentSemester: Number(d.currentSemester),
            section: d.section,
            admissionCategory: d.admissionCategory || "REGULAR",
            createdByTeacherId: auth.user.id,
            approvalStatus: "APPROVED",
          },
        });

        if (currentAY) {
          await tx.studentProgression.upsert({
            where: {
              studentId_semester: {
                studentId: student.id,
                semester: Number(d.currentSemester),
              },
            },
            update: {
              section: d.section,
              pcmPercentagePUC: d.pcmPercentagePUC ? Number(d.pcmPercentagePUC) : null,
            },
            create: {
              studentId: student.id,
              academicYearId: currentAY.id,
              semester: Number(d.currentSemester),
              section: d.section,
              attendancePercentage: 100,
              pcmPercentagePUC: d.pcmPercentagePUC ? Number(d.pcmPercentagePUC) : null,
              remarks: "Bulk imported via CSV.",
            },
          });
        }
      }

      await tx.importJob.update({
        where: { id: importJob.id },
        data: { status: "COMPLETED" },
      });
    });

    await logAuditEvent({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorRole: auth.user.role,
      action: "BULK_IMPORT",
      entityType: "ImportJob",
      entityId: importJob.id,
      details: {
        fileName,
        total: rows.length,
        successful: validCount,
        failed: errorCount,
      },
    });

    return NextResponse.json({
      success: true,
      importJobId: importJob.id,
      summary: {
        totalRows: rows.length,
        importedRows: validCount,
        failedRows: errorCount,
      },
      errors: validationResults.filter((r) => !r.isValid),
    });
  } catch (err: any) {
    console.error("Bulk import error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process bulk import" },
      { status: 500 }
    );
  }
}
