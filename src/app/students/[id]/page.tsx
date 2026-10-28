"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Calendar,
  CheckSquare,
  UserCheck,
  Clock,
  ArrowLeft,
  AlertTriangle,
  FileText,
  Shield,
  PlusCircle,
  Eye,
  CheckCircle2,
} from "lucide-react";

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [student, setStudent] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New action item modal/form state
  const [newActionTitle, setNewActionTitle] = useState("");
  const [newActionDue, setNewActionDue] = useState("");
  const [newActionPriority, setNewActionPriority] = useState("MEDIUM");
  const [addingAction, setAddingAction] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, stuRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch(`/api/students/${id}`),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);
        }

        if (!stuRes.ok) {
          const errData = await stuRes.json();
          setError(errData.error || "Failed to load student record (Access Denied)");
          return;
        }

        const stuData = await stuRes.json();
        setStudent(stuData.student);
      } catch {
        setError("Network error occurred while fetching student profile.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const handleAddActionItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle || !newActionDue) return;

    try {
      const res = await fetch("/api/action-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: id,
          title: newActionTitle,
          dueDate: newActionDue,
          priority: newActionPriority,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStudent((prev: any) => ({
          ...prev,
          actionItems: [...(prev.actionItems || []), data.actionItem],
        }));
        setNewActionTitle("");
        setNewActionDue("");
        setAddingAction(false);
      }
    } catch (err) {
      console.error("Failed to add action item", err);
    }
  };

  const handleToggleActionStatus = async (actionId: string, currentStatus: string) => {
    const newStatus = currentStatus === "COMPLETED" ? "OPEN" : "COMPLETED";
    try {
      const res = await fetch("/api/action-items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: actionId,
          status: newStatus,
          outcomeNotes: newStatus === "COMPLETED" ? "Marked complete via student portal" : undefined,
        }),
      });

      if (res.ok) {
        setStudent((prev: any) => ({
          ...prev,
          actionItems: prev.actionItems.map((a: any) =>
            a.id === actionId ? { ...a, status: newStatus } : a
          ),
        }));
      }
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-400">Loading student dossier...</div>;
  }

  if (error || !student) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Access Restricted / Record Not Found</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
        <Link
          href="/students"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Directory</span>
        </Link>
      </div>
    );
  }

  const activeAssignments = student.mentorAssignments?.filter((a: any) => a.status === "ACTIVE") || [];
  const historicalAssignments = student.mentorAssignments?.filter((a: any) => a.status !== "ACTIVE") || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Students List</span>
        </Link>
      </div>

      {/* Header Profile Dossier Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-900 text-white tracking-wider">
                {student.institutionalId}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">
                {student.department.code}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                {student.enrolmentStatus}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{student.fullName}</h1>
            <p className="text-xs text-slate-500">
              {student.programme.name} • Batch {student.admissionYear} • Category: {student.admissionCategory}
            </p>
          </div>

          <div className="text-right space-y-1">
            <div className="text-2xl font-black text-rose-800">
              Semester {student.currentSemester}
            </div>
            <div className="text-xs text-slate-500 font-semibold">Section {student.section}</div>
            {student.institutionalEmail && (
              <div className="text-xs text-slate-400 font-mono">{student.institutionalEmail}</div>
            )}
          </div>
        </div>

        {/* Assigned Mentors Box */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Active Mentor Allocations
          </h2>
          {activeAssignments.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
              <span>No active mentor assigned currently.</span>
              {currentUser?.role !== "STUDENT" && (
                <Link
                  href="/mentors"
                  className="font-bold underline text-amber-900 hover:text-amber-950"
                >
                  Assign Mentor Now →
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAssignments.map((a: any) => (
                <div
                  key={a.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                      {a.roleType === "CLASS_PROCTOR" ? "Class Proctor" : "Faculty Advisor"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Effective: {new Date(a.effectiveStartDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {a.mentorFaculty.prefix} {a.mentorFaculty.fullName}
                  </div>
                  <div className="text-xs text-slate-600">
                    {a.mentorFaculty.designation} • {a.mentorFaculty.department.code}
                  </div>
                  {a.reassignmentReason && (
                    <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200 italic">
                      "{a.reassignmentReason}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Semester Progression History (Preserves Progression Without Losing History) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-rose-800" />
              <span>Semester Progression & Academic Standing</span>
            </h2>
            <p className="text-xs text-slate-500">
              Historical academic trajectory maintained across all previous terms.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Semester</th>
                <th className="py-2.5 px-3">Academic Term</th>
                <th className="py-2.5 px-3">Section</th>
                <th className="py-2.5 px-3 text-center">SGPA</th>
                <th className="py-2.5 px-3 text-center">CGPA</th>
                <th className="py-2.5 px-3 text-center">Attendance %</th>
                <th className="py-2.5 px-3">Academic Notes & Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {student.progressions?.map((prog: any) => (
                <tr key={prog.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-3 font-bold text-slate-900">
                    Semester {prog.semester}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{prog.academicYear?.name || "Term"}</td>
                  <td className="py-3 px-3">{prog.section}</td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900">
                    {prog.sgpa ? prog.sgpa.toFixed(2) : "—"}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900">
                    {prog.cgpa ? prog.cgpa.toFixed(2) : "—"}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        prog.attendanceShortageFlag
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {prog.attendancePercentage ? `${prog.attendancePercentage}%` : "100%"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-xs">
                    {prog.remarks || "No incidents recorded."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Split: Meetings with Tiered Notes & Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Mentoring Sessions & Notes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-800" />
              <span>Mentoring Sessions & Tiered Notes</span>
            </h2>
            {currentUser?.role !== "STUDENT" && (
              <Link
                href="/meetings"
                className="text-xs font-semibold text-rose-800 hover:underline"
              >
                + Schedule Session
              </Link>
            )}
          </div>

          {student.meetingParticipants?.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No sessions conducted yet with this mentee.
            </div>
          ) : (
            <div className="space-y-4">
              {student.meetingParticipants.map((mp: any) => {
                const m = mp.meeting;
                return (
                  <div
                    key={mp.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{m.title}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {mp.attendanceStatus}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(m.scheduledAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
                    </div>

                    {/* Tiered Notes list */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                        Session Notes & Guidance
                      </div>
                      {m.notes?.length === 0 ? (
                        <div className="text-[11px] text-slate-400 italic">No notes recorded.</div>
                      ) : (
                        m.notes.map((n: any) => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                              n.visibilityLevel === "STUDENT_VISIBLE"
                                ? "bg-white border-slate-200 text-slate-800"
                                : n.visibilityLevel === "RESTRICTED_COUNSELLING"
                                ? "bg-rose-50 border-rose-200 text-rose-900"
                                : "bg-amber-50 border-amber-200 text-amber-900"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {n.visibilityLevel === "STUDENT_VISIBLE"
                                  ? "Shared with Student"
                                  : n.visibilityLevel === "RESTRICTED_COUNSELLING"
                                  ? "Restricted Counselling Note"
                                  : "Mentor Only (Private)"}
                              </span>
                              <span className="font-normal text-slate-400">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed">{n.noteContent}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Action Items & Remediation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-rose-800" />
              <span>Agreed Goals & Action Items</span>
            </h2>
            {currentUser?.role !== "STUDENT" && (
              <button
                type="button"
                onClick={() => setAddingAction(!addingAction)}
                className="text-xs font-semibold text-rose-800 hover:underline flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Goal</span>
              </button>
            )}
          </div>

          {/* New Action Item Form Modal */}
          {addingAction && (
            <form onSubmit={handleAddActionItem} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="font-semibold text-slate-900">Create New Action Item</div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Goal / Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete MSE-1 remedial test in Mathematics"
                  value={newActionTitle}
                  onChange={(e) => setNewActionTitle(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Target Due Date</label>
                  <input
                    type="date"
                    required
                    value={newActionDue}
                    onChange={(e) => setNewActionDue(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Priority</label>
                  <select
                    value={newActionPriority}
                    onChange={(e) => setNewActionPriority(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent (MSE-1)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddingAction(false)}
                  className="px-3 py-1.5 rounded bg-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-rose-800 hover:bg-rose-700 text-white font-semibold"
                >
                  Save Goal
                </button>
              </div>
            </form>
          )}

          {student.actionItems?.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No active goals or action items assigned.
            </div>
          ) : (
            <div className="space-y-3">
              {student.actionItems.map((item: any) => {
                const isCompleted = item.status === "COMPLETED";
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition space-y-2 ${
                      isCompleted ? "bg-slate-50/60 border-slate-200" : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActionStatus(item.id, item.status)}
                          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition ${
                            isCompleted
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-300 hover:border-slate-500"
                          }`}
                        >
                          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <div>
                          <div className={`font-semibold text-xs ${isCompleted ? "line-through text-slate-400" : "text-slate-900"}`}>
                            {item.title}
                          </div>
                          {item.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-800"
                            : item.priority === "HIGH"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                      <span>Assigned to: <strong className="text-slate-700">{item.assignedToRole}</strong></span>
                      <span>Target: {new Date(item.dueDate).toLocaleDateString()}</span>
                    </div>

                    {item.outcomeNotes && (
                      <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
                        Outcome: {item.outcomeNotes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
