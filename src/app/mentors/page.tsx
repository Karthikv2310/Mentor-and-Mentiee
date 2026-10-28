"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck,
  Users,
  AlertCircle,
  CheckCircle2,
  Filter,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function MentorsAssignmentPage() {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [roleType, setRoleType] = useState<"CLASS_PROCTOR" | "FACULTY_ADVISOR">("CLASS_PROCTOR");
  const [reassignmentReason, setReassignmentReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [facRes, stuRes] = await Promise.all([
        fetch("/api/faculty/staging?status=APPROVED"),
        fetch("/api/students?unassigned=true"),
      ]);

      if (facRes.ok) {
        const facData = await facRes.json();
        setFaculty(facData.faculty || []);
      }

      if (stuRes.ok) {
        const stuData = await stuRes.json();
        setUnassignedStudents(stuData.students || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === unassignedStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(unassignedStudents.map((s) => s.id));
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0 || !selectedMentorId) {
      setStatusMessage({ type: "error", text: "Select at least one student and a faculty mentor." });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/mentors/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: selectedStudentIds,
          mentorFacultyId: selectedMentorId,
          roleType,
          reassignmentReason: reassignmentReason || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatusMessage({ type: "error", text: data.error || "Assignment failed" });
        return;
      }

      setStatusMessage({ type: "success", text: data.message });
      setSelectedStudentIds([]);
      setReassignmentReason("");
      loadData();
    } catch {
      setStatusMessage({ type: "error", text: "Network error processing assignment." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold mb-1">
          <UserCheck className="w-4 h-4" />
          <span>Institutional Allocation Engine</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Mentor–Mentee Assignment & Workload
        </h1>
        <p className="text-xs text-slate-500">
          Allocate students to Class Proctors (group tracking) or Faculty Advisors (individual intervention). Workload capacity is enforced.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main 2-column Grid: Assignment Form & Faculty Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Unassigned Students Selection & Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleAssign} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Step 1: Select Unassigned Students ({unassignedStudents.length} available)
                </h2>
                <p className="text-[11px] text-slate-400">Students with no active proctor or advisor</p>
              </div>
              {unassignedStudents.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-semibold text-rose-800 hover:underline"
                >
                  {selectedStudentIds.length === unassignedStudents.length ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>

            {/* Students List Box */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50">
              {unassignedStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  All enrolled students within scope are currently assigned!
                </div>
              ) : (
                unassignedStudents.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-3 p-3 hover:bg-slate-100/80 cursor-pointer select-none transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(s.id)}
                      onChange={() => handleToggleStudent(s.id)}
                      className="rounded text-rose-800 focus:ring-rose-800"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{s.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {s.institutionalId} • {s.department.code} (Sem {s.currentSemester}-{s.section})
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>

            {/* Step 2: Target Mentor Selection */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Step 2: Assignee & Role Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Target Faculty Mentor <span className="text-rose-600">*</span>
                  </label>
                  <select
                    required
                    value={selectedMentorId}
                    onChange={(e) => setSelectedMentorId(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
                  >
                    <option value="">-- Choose Approved Mentor --</option>
                    {faculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.prefix} {f.fullName} ({f.department.code} - {f._count?.mentorAssignments || 0}/25 mentees)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mentoring Role Type <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={roleType}
                    onChange={(e) => setRoleType(e.target.value as any)}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
                  >
                    <option value="CLASS_PROCTOR">Class Proctor (Class Section Tracking)</option>
                    <option value="FACULTY_ADVISOR">Faculty Advisor (Academic Remediation)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Reassignment Reason (Preserved in Historical Audit)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Allocated per NMAMIT Class Section allotment for 2026-27 or PCM remediation"
                    value={reassignmentReason}
                    onChange={(e) => setReassignmentReason(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting || selectedStudentIds.length === 0 || !selectedMentorId}
                className="px-5 py-2.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {submitting ? "Allocating..." : `Confirm Assignment (${selectedStudentIds.length} students)`}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Mentor Workload Ceiling Table */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Faculty Workload Ceiling</h2>
              <p className="text-xs text-slate-500">
                Institutional maximum ceiling: 25 active mentees per faculty member.
              </p>
            </div>

            <div className="space-y-3">
              {faculty.map((f) => {
                const count = f._count?.mentorAssignments || 0;
                const max = 25;
                const percent = Math.min(100, Math.round((count / max) * 100));
                return (
                  <div key={f.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        {f.prefix} {f.fullName}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-slate-700">
                        {count} / {max}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          percent > 80 ? "bg-rose-600" : percent > 50 ? "bg-amber-500" : "bg-emerald-600"
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>{f.designation}</span>
                      <span>{f.department.code}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
