"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Users,
  MapPin,
  ArrowRight,
  Filter,
  Eye,
} from "lucide-react";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Meeting Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sessionType, setSessionType] = useState<"ONE_ON_ONE" | "GROUP">("ONE_ON_ONE");
  const [agendaCategory, setAgendaCategory] = useState("MSE1_REVIEW");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [locationOrLink, setLocationOrLink] = useState("Department Mentor Chamber - Room 204");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [initialNote, setInitialNote] = useState("");
  const [initialNoteVisibility, setInitialNoteVisibility] = useState("STUDENT_VISIBLE");

  // Student appointment request form
  const [reqDate, setReqDate] = useState("");
  const [reqSlot, setReqSlot] = useState("10:30 AM - 11:00 AM");
  const [reqAgenda, setReqAgenda] = useState("");

  const loadData = async () => {
    try {
      const [meRes, meetRes, stuRes, apptRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/meetings"),
        fetch("/api/students"),
        fetch("/api/appointments"),
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.user);
      }
      if (meetRes.ok) {
        const mData = await meetRes.json();
        setMeetings(mData.meetings || []);
      }
      if (stuRes.ok) {
        const sData = await stuRes.json();
        setStudents(sData.students || []);
      }
      if (apptRes.ok) {
        const aData = await apptRes.json();
        setAppointments(aData.appointments || []);
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

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0 || !title || !scheduledAt) return;

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          sessionType,
          agendaCategory,
          scheduledAt,
          durationMinutes,
          locationOrLink,
          studentIds: selectedStudentIds,
          initialNote,
          initialNoteVisibility,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to schedule meeting");
        return;
      }

      setScheduling(false);
      setTitle("");
      setDescription("");
      setSelectedStudentIds([]);
      loadData();
    } catch {
      setError("Network error scheduling meeting.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStudentRequestAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.studentProfile?.mentorAssignments?.[0]?.mentorFacultyId) {
      setError("No assigned mentor available to request appointment.");
      return;
    }

    const mentorId = currentUser.studentProfile.mentorAssignments[0].mentorFacultyId;
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorFacultyId: mentorId,
          requestedDate: reqDate,
          preferredTimeSlot: reqSlot,
          agenda: reqAgenda,
        }),
      });

      if (res.ok) {
        setReqAgenda("");
        setReqDate("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-400">Loading meeting calendar...</div>;
  }

  const isStudent = currentUser?.role === "STUDENT";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold mb-1">
            <Calendar className="w-4 h-4" />
            <span>Asia/Kolkata Institutional Calendar</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Mentoring Sessions & Follow-ups
          </h1>
          <p className="text-xs text-slate-500">
            One-to-one and group mentoring sessions with conflict prevention, attendance tracking, and tiered note visibility.
          </p>
        </div>

        {!isStudent && (
          <button
            onClick={() => setScheduling(!scheduling)}
            className="px-4 py-2 rounded-lg bg-rose-800 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Schedule Session</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Schedule Form Modal/Accordion */}
      {scheduling && (
        <form onSubmit={handleScheduleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="font-bold text-sm text-slate-900">Schedule Conflict-Free Mentoring Session</div>
            <button type="button" onClick={() => setScheduling(false)} className="text-slate-400 hover:text-slate-700">
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Session Title <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MSE-1 Academic Performance Review & Remedial Strategy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Agenda Category</label>
              <select
                value={agendaCategory}
                onChange={(e) => setAgendaCategory(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
              >
                <option value="MSE1_REVIEW">MSE-1 Performance Review (NMAMIT Policy)</option>
                <option value="ATTENDANCE_SHORTAGE">Attendance Shortage (&lt;75%) Counseling</option>
                <option value="ACADEMIC_PERFORMANCE">General Academic Performance</option>
                <option value="CAREER_AND_INTERNSHIP">Internship & Career Guidance</option>
                <option value="PERSONAL_WELLBEING">Personal Well-being & Transition</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Session Type</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as any)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
              >
                <option value="ONE_ON_ONE">One-on-One Session</option>
                <option value="GROUP">Group Proctor Session</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date & Time (Asia/Kolkata) <span className="text-rose-600">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Location or Chamber</label>
              <input
                type="text"
                value={locationOrLink}
                onChange={(e) => setLocationOrLink(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Select Mentee Participant(s) <span className="text-rose-600">*</span>
              </label>
              <div className="max-h-40 overflow-y-auto border border-slate-300 rounded-lg p-2 bg-slate-50 space-y-1">
                {students.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 p-1 hover:bg-slate-200/60 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(s.id)}
                      onChange={() =>
                        setSelectedStudentIds((prev) =>
                          prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                        )
                      }
                      className="rounded text-rose-800 focus:ring-rose-800"
                    />
                    <span className="font-medium text-slate-900">{s.fullName}</span>
                    <span className="text-slate-500 font-mono text-[11px]">({s.institutionalId})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="block font-semibold text-slate-700">
                Initial Session Note & Guidance (Explicit Visibility Tier)
              </label>
              <div className="grid grid-cols-3 gap-2 pb-1">
                <label className="flex items-center gap-1.5 p-2 rounded border border-slate-200 bg-white cursor-pointer text-[11px]">
                  <input
                    type="radio"
                    name="noteVis"
                    value="STUDENT_VISIBLE"
                    checked={initialNoteVisibility === "STUDENT_VISIBLE"}
                    onChange={(e) => setInitialNoteVisibility(e.target.value)}
                  />
                  <span>Student Visible</span>
                </label>
                <label className="flex items-center gap-1.5 p-2 rounded border border-slate-200 bg-white cursor-pointer text-[11px]">
                  <input
                    type="radio"
                    name="noteVis"
                    value="MENTOR_ONLY"
                    checked={initialNoteVisibility === "MENTOR_ONLY"}
                    onChange={(e) => setInitialNoteVisibility(e.target.value)}
                  />
                  <span>Mentor Only (Private)</span>
                </label>
                <label className="flex items-center gap-1.5 p-2 rounded border border-slate-200 bg-white cursor-pointer text-[11px]">
                  <input
                    type="radio"
                    name="noteVis"
                    value="RESTRICTED_COUNSELLING"
                    checked={initialNoteVisibility === "RESTRICTED_COUNSELLING"}
                    onChange={(e) => setInitialNoteVisibility(e.target.value)}
                  />
                  <span>Restricted Counselling</span>
                </label>
              </div>
              <textarea
                rows={2}
                placeholder="Initial agenda notes or preparatory instructions..."
                value={initialNote}
                onChange={(e) => setInitialNote(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setScheduling(false)}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{submitting ? "Checking Conflicts..." : "Confirm & Schedule"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Student Appointment Request Box */}
      {isStudent && (
        <div id="request" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Request Appointment with Your Assigned Mentor</h2>
            <p className="text-slate-500">
              Submit an appointment request for academic consultation, course planning, or remedial assistance.
            </p>
          </div>

          <form onSubmit={handleStudentRequestAppointment} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Date</label>
              <input
                type="date"
                required
                value={reqDate}
                onChange={(e) => setReqDate(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Time Slot</label>
              <input
                type="text"
                required
                placeholder="e.g. 11:30 AM - 12:00 PM"
                value={reqSlot}
                onChange={(e) => setReqSlot(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Consultation Agenda</label>
              <input
                type="text"
                required
                placeholder="e.g. Discuss MSE-1 Mathematics question paper"
                value={reqAgenda}
                onChange={(e) => setReqAgenda(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-semibold shadow-sm transition"
              >
                Submit Appointment Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Meetings List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Recorded Sessions ({meetings.length})</h2>

        {meetings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-xs">
            No mentoring sessions found within your permitted scope.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetings.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-rose-300 transition space-y-3 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{m.title}</h3>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Host: {m.createdBy.firstName} {m.createdBy.lastName}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      m.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800"
                        : m.status === "CANCELLED"
                        ? "bg-slate-200 text-slate-700"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(m.scheduledAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
                  </div>
                  <div>•</div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{m.locationOrLink}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-800">Participants ({m.participants.length}):</span>{" "}
                  {m.participants.map((p: any) => p.student.fullName).join(", ")}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">
                    {m.notes?.length || 0} note(s) recorded
                  </span>
                  <Link
                    href={`/meetings/${m.id}`}
                    className="font-bold text-rose-800 hover:text-rose-950 flex items-center gap-1"
                  >
                    <span>View Record & Attendance</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
