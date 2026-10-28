import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const [departments, programmes, academicYears, settings] = await Promise.all([
    prisma.department.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
      include: {
        programmes: true,
      },
    }),
    prisma.programme.findMany({
      orderBy: { code: "asc" },
    }),
    prisma.academicYear.findMany({
      orderBy: { name: "desc" },
    }),
    prisma.institutionalSetting.findMany(),
  ]);

  return NextResponse.json({
    success: true,
    departments,
    programmes,
    academicYears,
    settings: Object.fromEntries(settings.map((s) => [s.settingKey, s.settingValue])),
  });
}
