"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  Shield,
  Save,
  UserCheck,
  MapPin,
  Lock,
} from "lucide-react";

export default function MeetingRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [meeting, setMeeting] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Note State
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteVisibility, setNewNoteVisibility] = useState<"STUDENT_VISIBLE" | "MENTOR_ONLY" | "RESTRICTED_COUNSELLING">("STUDENT_VISIBLE");

  // Attendance State
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: string; feedback: string }>>({});

  useEffect(() => {
    async function loadMeeting() {
      try {
        const [meRes, meetRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch(`/api/meetings/${id}`),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);
        }

        if (!meetRes.ok) {
          const errData = await meetRes.json();
          setError(errData.error || "Failed to load meeting record (Access Denied)");
          return;
        }

        const data = await meetRes.json();
        setMeeting(data.meeting);

        // Initialize attendance map
        const att: Record<string, { status: string; feedback: string }> = {};
        data.meeting.participants?.forEach((p: any) => {
          att[p.studentId] = {
            status: p.attendanceStatus || "PRESENT",
            feedback: p.feedbackNotes || "",
          };
        });
        setAttendanceMap(att);
      } catch {
        setError("Network error loading meeting session.");
      } finally {
        setLoading(false);
      }
    }

    loadMeeting();
  }, [id]);

  const handleSaveMeetingUpdates = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    const attendanceUpdates = Object.entries(attendanceMap).map(([studentId, val]) => ({
      studentId,
      attendanceStatus: val.status,
      feedbackNotes: val.feedback,
    }));

    const payload: any = {
      attendanceUpdates,
    };

    if (newNoteContent.trim()) {
      payload.newNote = {
        content: newNoteContent.trim(),
        visibilityLevel: newNoteVisibility,
      };
    }

    try {
      const res = await fetch(`/api/meetings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Update failed");
        return;
      }

      setSuccessMsg("Meeting record and attendance updated successfully.");
      setNewNoteContent("");
      // Refresh record
      const refreshRes = await fetch(`/api/meetings/${id}`);
      if (refreshRes.ok) {
        const refreshed = await refreshRes.json();
        setMeeting(refreshed.meeting);
      }
    } catch {
      setError("Network error while updating meeting.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      const res = await fetch(`/api/meetings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (res.ok) {
        setMeeting((prev: any) => ({ ...prev, status: "COMPLETED" }));
        setSuccessMsg("Session marked as COMPLETED.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-400">Loading meeting session...</div>;
  }

  if (error || !meeting) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">Meeting Session Restricted</h1>
        <p className="text-xs text-slate-500">{error}</p>
        <Link
          href="/meetings"
          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Calendar</span>
        </Link>
      </div>
    );
  }

  const isStudent = currentUser?.role === "STUDENT";
  const isHost = meeting.createdById === currentUser?.id || currentUser?.role === "ADMIN";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/meetings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Mentoring Calendar</span>
        </Link>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Session Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                {meeting.agendaCategory.replace(/_/g, " ")}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  meeting.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {meeting.status}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">{meeting.title}</h1>
            {meeting.description && (
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{meeting.description}</p>
            )}
          </div>

          {isHost && meeting.status !== "COMPLETED" && (
            <button
              onClick={handleMarkComplete}
              className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs shrink-0 transition"
            >
              Mark Session Completed
            </button>
          )}
        </div>

        {/* Schedule Meta Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <div className="text-slate-400 text-[11px]">Scheduled Time</div>
            <div className="font-semibold text-slate-900">
              {new Date(meeting.scheduledAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Duration</div>
            <div className="font-semibold text-slate-900">{meeting.durationMinutes} Minutes</div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Host Mentor</div>
            <div className="font-semibold text-slate-900">
              {meeting.createdBy.firstName} {meeting.createdBy.lastName}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Location / Venue</div>
            <div className="font-semibold text-slate-900">{meeting.locationOrLink}</div>
          </div>
        </div>

        {/* Participant Attendance Table */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Mentee Participants & Attendance Verification
          </h2>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">USN / Identifier</th>
                  <th className="py-2.5 px-3">Attendance Status</th>
                  <th className="py-2.5 px-3">Mentee Observation / Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {meeting.participants?.map((p: any) => {
                  const s = p.student;
                  const currentAtt = attendanceMap[s.id] || { status: "PRESENT", feedback: "" };
                  return (
                    <tr key={p.id}>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <Link href={`/students/${s.id}`} className="hover:text-rose-800 underline">
                          {s.fullName}
                        </Link>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">{s.institutionalId}</td>
                      <td className="py-3 px-3">
                        {isHost ? (
                          <select
                            value={currentAtt.status}
                            onChange={(e) =>
                              setAttendanceMap((prev) => ({
                                ...prev,
                                [s.id]: { ...currentAtt, status: e.target.value },
                              }))
                            }
                            className="py-1 px-2 border border-slate-300 rounded text-xs bg-white focus:outline-none"
                          >
                            <option value="PRESENT">PRESENT</option>
                            <option value="ABSENT">ABSENT</option>
                            <option value="EXCUSED">EXCUSED</option>
                          </select>
                        ) : (
                          <span className="font-bold text-slate-900">{p.attendanceStatus}</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {isHost ? (
                          <input
                            type="text"
                            placeholder="Observations or agreed targets..."
                            value={currentAtt.feedback}
                            onChange={(e) =>
                              setAttendanceMap((prev) => ({
                                ...prev,
                                [s.id]: { ...currentAtt, feedback: e.target.value },
                              }))
                            }
                            className="w-full py-1 px-2 border border-slate-300 rounded text-xs bg-white"
                          />
                        ) : (
                          <span>{p.feedbackNotes || "No specific feedback noted."}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tiered Notes System */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Documented Meeting Notes (Explicit Visibility Tiers)
            </h2>
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Shared with Student
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Mentor Only (Private)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Restricted Counselling
              </span>
            </div>
          </div>

          {/* Existing notes */}
          <div className="space-y-3">
            {meeting.notes?.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-100">
                No notes recorded yet for this session.
              </div>
            ) : (
              meeting.notes?.map((n: any) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    n.visibilityLevel === "STUDENT_VISIBLE"
                      ? "bg-white border-slate-200 text-slate-900"
                      : n.visibilityLevel === "RESTRICTED_COUNSELLING"
                      ? "bg-rose-50/70 border-rose-200 text-rose-950"
                      : "bg-amber-50/70 border-amber-200 text-amber-950"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      {n.visibilityLevel === "STUDENT_VISIBLE" && "Student Visible Summary"}
                      {n.visibilityLevel === "MENTOR_ONLY" && "Mentor-Only Observation (Confidential)"}
                      {n.visibilityLevel === "RESTRICTED_COUNSELLING" && "Restricted Counselling Note"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Author: {n.author?.firstName} {n.author?.lastName} • {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{n.noteContent}</p>
                </div>
              ))
            )}
          </div>

          {/* Add new note (Only if Host or Authorized) */}
          {isHost && (
            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <div className="font-semibold text-slate-900">Add New Session Note</div>

              {/* Note Visibility Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-start gap-2 p-3 rounded-xl border bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="newNoteVis"
                    value="STUDENT_VISIBLE"
                    checked={newNoteVisibility === "STUDENT_VISIBLE"}
                    onChange={(e) => setNewNoteVisibility(e.target.value as any)}
                    className="mt-0.5 text-rose-800 focus:ring-rose-800"
                  />
                  <div>
                    <div className="font-bold text-slate-900">Student Visible</div>
                    <div className="text-[10px] text-slate-500">Agreed goals, remedial instructions, visible to mentee.</div>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-3 rounded-xl border bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="newNoteVis"
                    value="MENTOR_ONLY"
                    checked={newNoteVisibility === "MENTOR_ONLY"}
                    onChange={(e) => setNewNoteVisibility(e.target.value as any)}
                    className="mt-0.5 text-rose-800 focus:ring-rose-800"
                  />
                  <div>
                    <div className="font-bold text-slate-900">Mentor Only (Private)</div>
                    <div className="text-[10px] text-slate-500">Internal mentor observations, invisible to mentee.</div>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-3 rounded-xl border bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    name="newNoteVis"
                    value="RESTRICTED_COUNSELLING"
                    checked={newNoteVisibility === "RESTRICTED_COUNSELLING"}
                    onChange={(e) => setNewNoteVisibility(e.target.value as any)}
                    className="mt-0.5 text-rose-800 focus:ring-rose-800"
                  />
                  <div>
                    <div className="font-bold text-slate-900">Restricted Counselling</div>
                    <div className="text-[10px] text-slate-500">Sensitive welfare note, strictly isolated to author mentor.</div>
                  </div>
                </label>
              </div>

              <textarea
                rows={3}
                placeholder="Enter meeting observations, remedial recommendations, or agreed next steps..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-800 text-xs bg-white"
              />
            </div>
          )}
        </div>

        {isHost && (
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              onClick={handleSaveMeetingUpdates}
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? "Saving Updates..." : "Save Record & Notes"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
