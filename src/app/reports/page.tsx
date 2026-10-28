"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  Download,
  AlertTriangle,
  CheckCircle2,
  Users,
  GraduationCap,
  Calendar,
  Clock,
  ShieldAlert,
} from "lucide-react";

export default function ReportsPage() {
  const [reportsData, setReportsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setReportsData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    if (!reportsData?.workloadSummary) return;

    let csv = "Faculty Name,Department,Designation,Active Mentees,Max Capacity,Utilization %\n";
    reportsData.workloadSummary.forEach((f: any) => {
      csv += `"${f.name}","${f.department}","${f.designation}",${f.activeMentees},${f.maxCapacity},${f.utilizationPercent}%\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `NMAMIT_Mentoring_Workload_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-400">Aggregating persistent database metrics...</div>;
  }

  if (!reportsData) {
    return <div className="p-16 text-center text-xs text-rose-600">Failed to load reports.</div>;
  }

  const { meta, metrics, unassignedStudents, workloadSummary, attendanceShortageStudents, recentImportFailures } = reportsData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Report Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Institutional Compliance & Operations</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Scoped Mentoring Operational Reports
          </h1>
          <div className="text-xs text-slate-500 flex items-center gap-3 pt-1">
            <span>Scope: <strong className="text-slate-800">{meta.scope}</strong></span>
            <span>•</span>
            <span>Generated: {new Date(meta.generatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
        >
          <Download className="w-3.5 h-3.5 text-rose-400" />
          <span>Export Workload (CSV)</span>
        </button>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-slate-500 font-medium">Mentee Coverage Rate</div>
          <div className="text-2xl font-bold text-slate-900">
            {metrics.totalStudents > 0
              ? `${Math.round((metrics.assignedCount / metrics.totalStudents) * 100)}%`
              : "0%"}
          </div>
          <div className="text-[11px] text-slate-400">
            {metrics.assignedCount} of {metrics.totalStudents} assigned
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-slate-500 font-medium">Unassigned Students</div>
          <div className="text-2xl font-bold text-amber-600">{metrics.unassignedCount}</div>
          <div className="text-[11px] text-slate-400">Pending coordinator allocation</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-slate-500 font-medium">Attendance Shortage (&lt;75%)</div>
          <div className="text-2xl font-bold text-rose-700">{metrics.attendanceShortageCount}</div>
          <div className="text-[11px] text-slate-400">Counseling intervention required</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-slate-500 font-medium">Meeting Completion</div>
          <div className="text-2xl font-bold text-emerald-600">
            {metrics.totalMeetings > 0
              ? `${Math.round((metrics.completedMeetings / metrics.totalMeetings) * 100)}%`
              : "100%"}
          </div>
          <div className="text-[11px] text-slate-400">
            {metrics.completedMeetings} of {metrics.totalMeetings} sessions
          </div>
        </div>
      </div>

      {/* Section 1: Mentor Workload Distribution */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Mentor Workload Distribution</h2>
            <p className="text-xs text-slate-500">
              Active mentees assigned vs configured capacity ceiling (25 per faculty).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Faculty Member</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Designation</th>
                <th className="py-2.5 px-3 text-center">Active Mentees</th>
                <th className="py-2.5 px-3 text-center">Ceiling</th>
                <th className="py-2.5 px-3">Capacity Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {workloadSummary.map((f: any) => (
                <tr key={f.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-3 font-semibold text-slate-900">{f.name}</td>
                  <td className="py-3 px-3 font-semibold">{f.department}</td>
                  <td className="py-3 px-3 text-slate-500">{f.designation}</td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900">{f.activeMentees}</td>
                  <td className="py-3 px-3 text-center font-mono text-slate-500">{f.maxCapacity}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            f.utilizationPercent > 80
                              ? "bg-rose-600"
                              : f.utilizationPercent > 50
                              ? "bg-amber-500"
                              : "bg-emerald-600"
                          }`}
                          style={{ width: `${Math.min(100, f.utilizationPercent)}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-[11px] text-slate-600">{f.utilizationPercent}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Attendance Shortage Tracking (<75% attendance) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>NMAMIT Attendance Shortage Intervention Queue</span>
            </h2>
            <p className="text-xs text-slate-500">
              Under NMAMIT policy, students falling below 75% attendance are identified for mandatory proctor counseling and parent reports.
            </p>
          </div>
        </div>

        {attendanceShortageStudents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
            No students currently flagged with attendance shortage within this department.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">USN</th>
                  <th className="py-2.5 px-3">Sem & Section</th>
                  <th className="py-2.5 px-3">Attendance %</th>
                  <th className="py-2.5 px-3">Assigned Mentor</th>
                  <th className="py-2.5 px-3">Intervention Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {attendanceShortageStudents.map((p: any) => {
                  const s = p.student;
                  const activeMentor = s.mentorAssignments?.find((a: any) => a.status === "ACTIVE")?.mentorFaculty;
                  return (
                    <tr key={p.id}>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <Link href={`/students/${s.id}`} className="hover:text-rose-800 underline">
                          {s.fullName}
                        </Link>
                      </td>
                      <td className="py-3 px-3 font-mono">{s.institutionalId}</td>
                      <td className="py-3 px-3">Sem {p.semester} - {p.section}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {p.attendancePercentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {activeMentor ? `${activeMentor.prefix || ""} ${activeMentor.fullName}` : "Unassigned"}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Counseling Scheduled
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3: Recent Import Validation Failures */}
      {recentImportFailures.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Recent Import Validation Failure Log</h2>
            <p className="text-xs text-slate-500">
              Audit record of rejected rows during bulk student CSV imports.
            </p>
          </div>

          <div className="space-y-2">
            {recentImportFailures.map((err: any) => (
              <div key={err.id} className="p-3 rounded-lg border border-rose-100 bg-rose-50/40 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-800">Row #{err.rowNumber}:</span>{" "}
                  <span className="text-slate-700">{err.errorMessage}</span>
                </div>
                <div className="text-[11px] text-slate-400">File: {err.importJob.fileName}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
