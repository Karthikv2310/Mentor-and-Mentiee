"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  PlusCircle,
  Upload,
  UserCheck,
  Filter,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const [unassignedFilter, setUnassignedFilter] = useState(false);

  useEffect(() => {
    fetch("/api/reference-data")
      .then((r) => r.json())
      .then((d) => setDepartments(d.departments || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (deptFilter) params.set("departmentId", deptFilter);
        if (semFilter) params.set("semester", semFilter);
        if (unassignedFilter) params.set("unassigned", "true");

        const res = await fetch(`/api/students?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
        }
      } catch (err) {
        console.error("Failed to load students:", err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(loadStudents, 250);
    return () => clearTimeout(timer);
  }, [search, deptFilter, semFilter, unassignedFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-rose-800 font-semibold mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Institutional Student Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Enrolled Student Directory
          </h1>
          <p className="text-xs text-slate-500">
            Real student records are populated exclusively via authorized single creation or approved bulk import.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/students/add"
            className="px-4 py-2 rounded-lg bg-rose-800 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Single Student</span>
          </Link>

          <Link
            href="/students/import"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk CSV Import</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by student name or USN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={semFilter}
            onChange={(e) => setSemFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 flex items-center justify-end">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={unassignedFilter}
              onChange={(e) => setUnassignedFilter(e.target.checked)}
              className="rounded text-rose-800 focus:ring-rose-800"
            />
            <span className="text-slate-700 font-medium">Unassigned Only</span>
          </label>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading student roster...
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-slate-700 font-semibold text-sm">No student records found</div>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              No students match the selected department, semester, or search filter within your permitted scope.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">USN / Identifier</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Department & Programme</th>
                  <th className="py-3 px-4">Sem & Sec</th>
                  <th className="py-3 px-4">Assigned Mentor</th>
                  <th className="py-3 px-4 text-center">Open Tasks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((student) => {
                  const activeAssignment = student.mentorAssignments?.find((a: any) => a.status === "ACTIVE");
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {student.institutionalId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{student.fullName}</div>
                        {student.institutionalEmail && (
                          <div className="text-[11px] text-slate-400">{student.institutionalEmail}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{student.department.code}</span>
                        <div className="text-[11px] text-slate-500">{student.programme.name}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-800">
                          Sem {student.currentSemester} - {student.section}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {activeAssignment ? (
                          <div>
                            <div className="font-medium text-slate-900">
                              {activeAssignment.mentorFaculty.prefix} {activeAssignment.mentorFaculty.fullName}
                            </div>
                            <span className="inline-block text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-800 font-medium border border-rose-200">
                              {activeAssignment.roleType === "CLASS_PROCTOR" ? "Proctor" : "Faculty Advisor"}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                          {student._count?.actionItems || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/students/${student.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-rose-800 hover:text-white text-slate-700 font-semibold text-xs transition"
                        >
                          <span>Profile</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
