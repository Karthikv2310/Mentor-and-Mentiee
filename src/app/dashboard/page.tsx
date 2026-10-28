"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  GraduationCap,
  Calendar,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Upload,
  UserCheck,
  Building2,
  Clock,
  Sparkles,
  ShieldCheck,
  FileCheck,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [recentMeetings, setRecentMeetings] = useState<any[]>([]);
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) {
          router.push("/login");
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);

        // Fetch scoped reports & metrics
        const repRes = await fetch("/api/reports");
        if (repRes.ok) {
          const repData = await repRes.json();
          setMetrics(repData.metrics);
        }

        // Fetch scoped meetings
        const meetRes = await fetch("/api/meetings");
        if (meetRes.ok) {
          const meetData = await meetRes.json();
          setRecentMeetings(meetData.meetings || []);
        }

        // Fetch scoped action items
        const actRes = await fetch("/api/action-items");
        if (actRes.ok) {
          const actData = await actRes.json();
          setActionItems(actData.actionItems || []);
        }
      } catch (e) {
        console.error("Dashboard load failed", e);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="inline-block w-8 h-8 border-4 border-rose-800 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs">Loading institutional records...</p>
      </div>
    );
  }

  if (!user) return null;

  const isStudent = user.role === "STUDENT";
  const isTeacher = user.role === "TEACHER";
  const isHod = user.role === "HOD";
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold">
            <span>NMAMIT Portal</span>
            <span>•</span>
            <span className="font-mono">{user.role}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {user.firstName} {user.lastName}
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            {isStudent && "Track your assigned mentor guidance, scheduled proctor sessions, and agreed action items."}
            {isTeacher && "Monitor your assigned mentees, schedule Mid-Sem review meetings, and record tiered notes."}
            {isHod && "Oversee departmental mentoring completion, balance proctor workloads, and assign faculty mentors."}
            {isAdmin && "Institutional governance, review staged faculty imports, approve accounts, and audit log monitoring."}
          </p>
        </div>

        {/* Quick Action Buttons per Role */}
        <div className="flex flex-wrap gap-2.5 shrink-0">
          {(isTeacher || isHod || isAdmin) && (
            <>
              <Link
                href="/students/add"
                className="px-3.5 py-2 rounded-lg bg-rose-800 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Student</span>
              </Link>

              <Link
                href="/students/import"
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Bulk CSV Import</span>
              </Link>
            </>
          )}

          {(isHod || isAdmin) && (
            <Link
              href="/mentors"
              className="px-3.5 py-2 rounded-lg bg-blue-800 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assign Mentors</span>
            </Link>
          )}

          {isStudent && (
            <Link
              href="/meetings#request"
              className="px-4 py-2 rounded-lg bg-rose-800 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Request Appointment</span>
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Row (Live computed data from SQLite) */}
      {!isStudent && metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
              <span>Total Students</span>
              <GraduationCap className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{metrics.totalStudents}</div>
            <div className="text-[11px] text-slate-400">Enrolled within permitted scope</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
              <span>Unassigned Mentees</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600">{metrics.unassignedCount}</div>
            <div className="text-[11px] text-slate-400">Awaiting mentor assignment</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
              <span>Meetings Completed</span>
              <Calendar className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">{metrics.completedMeetings}</div>
            <div className="text-[11px] text-slate-400">{metrics.scheduledMeetings} upcoming sessions</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <div className="text-slate-500 text-xs font-medium flex items-center justify-between">
              <span>Open Action Items</span>
              <CheckSquare className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-bold text-rose-700">{metrics.openActionItems}</div>
            <div className="text-[11px] text-slate-400">Academic & remediation goals</div>
          </div>
        </div>
      )}

      {/* Student Mentee Specific Profile Summary */}
      {isStudent && user.studentProfile && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Academic & Mentee Profile</h2>
              <div className="text-xs text-slate-500">
                Institutional ID: <span className="font-mono font-bold text-slate-800">{user.studentProfile.institutionalId}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                Semester {user.studentProfile.currentSemester} • Section {user.studentProfile.section}
              </span>
            </div>
          </div>

          {/* Assigned Mentors Box */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Assigned Mentors
            </h3>
            {user.studentProfile.mentorAssignments?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.studentProfile.mentorAssignments.map((a: any) => (
                  <div key={a.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        {a.roleType === "CLASS_PROCTOR" ? "Class Proctor" : "Faculty Advisor"}
                      </span>
                      <span className="text-[11px] text-slate-400">Since {new Date(a.effectiveStartDate).toLocaleDateString()}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      {a.mentorFaculty.prefix} {a.mentorFaculty.fullName}
                    </div>
                    <div className="text-xs text-slate-600">{a.mentorFaculty.designation}</div>
                    {a.reassignmentReason && (
                      <div className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-200">
                        "{a.reassignmentReason}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                No active mentor assigned yet. Your Department Coordinator will assign a Class Proctor shortly.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Split: Meetings & Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Recent & Upcoming Meetings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-800" />
              <span>Mentoring Sessions</span>
            </h2>
            <Link href="/meetings" className="text-xs text-rose-800 font-semibold hover:underline">
              View Calendar →
            </Link>
          </div>

          {recentMeetings.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No sessions scheduled currently.
            </div>
          ) : (
            <div className="space-y-3">
              {recentMeetings.slice(0, 4).map((m) => (
                <Link
                  key={m.id}
                  href={`/meetings/${m.id}`}
                  className="block p-3.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-slate-50 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">{m.title}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
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
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(m.scheduledAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                    </span>
                    <span>•</span>
                    <span>{m.locationOrLink}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Follow-up Action Items */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-rose-800" />
              <span>Agreed Goals & Action Items</span>
            </h2>
            <Link href="/action-items" className="text-xs text-rose-800 font-semibold hover:underline">
              View All ({actionItems.length}) →
            </Link>
          </div>

          {actionItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No pending action items recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {actionItems.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">{item.title}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        item.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.priority === "HIGH"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Assigned to: <strong className="text-slate-700">{item.assignedToRole}</strong></span>
                    <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
