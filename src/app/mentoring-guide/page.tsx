import Link from "next/link";
import {
  BookOpen,
  Users,
  GraduationCap,
  Calendar,
  Clock,
  Shield,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function MentoringGuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200">
          <BookOpen className="w-4 h-4" />
          <span>NMAMIT Student Support Policy Documentation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Institutional Mentoring & Proctor Guide
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Operational guide explaining the mentoring, counselling, proctor, and faculty advisor practices of
          NMAM Institute of Technology, Nitte, derived from official institutional sources.
        </p>
      </div>

      {/* Section 1: The Two Distinct Roles */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-rose-900 text-white flex items-center justify-center text-xs font-bold">1</span>
            <span>Two-Tier Mentoring Structure</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Understanding why Class Proctors and Faculty Advisors are not identical roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <Users className="w-4 h-4 text-rose-800" />
              <span>Role A: Class Proctor</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              <strong>Objective:</strong> Group-level academic tracking and attendance monitoring for an entire section.
            </p>
            <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
              <li>Two faculty members assigned to monitor each class section.</li>
              <li>Tracks attendance shortages and semester examination progress.</li>
              <li>Coordinates routine class group meetings and academic tasks.</li>
              <li>Maintains general progress reports for parent meetings.</li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <GraduationCap className="w-4 h-4 text-blue-800" />
              <span>Role B: Faculty Advisor</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              <strong>Objective:</strong> Targeted academic intervention and individual mentoring for vulnerable cohorts.
            </p>
            <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
              <li>Allotted to students based on PUC/12th PCM percentage &lt;65%.</li>
              <li>Monitors NRI students with &lt;65% PCM to facilitate adaptation.</li>
              <li>Conducts post-MSE-1 intervention meetings with slow learners.</li>
              <li>Arranges remedial tutoring in subjects with high failure rates.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 2: Core Mentoring Cadence & Workflows */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-rose-900 text-white flex items-center justify-center text-xs font-bold">2</span>
            <span>Key Institutional Triggers & Cadence</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Mandatory touchpoints scheduled throughout the academic semester.
          </p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-800" />
              <span>Post Mid-Semester Examination - I (MSE-1) Review</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Following Mid Semester Exam 1 results, mentors are required to convene targeted sessions with poor performers and slow learners. Discussion centers on identifying specific academic roadblocks, adjusting study habits, and formulating a corrective action plan before MSE-2.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-800" />
              <span>Attendance Shortage Counseling</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Attendance details are collected from course faculty at regular intervals. Students exhibiting attendance shortages (&lt;75%) are summoned for individual proctor counseling to prevent semester debarment.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-rose-800" />
              <span>Biannual Progress Reports to Parents</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Student academic progress reports are dispatched to parents twice per semester. Regular semester Parent Meets provide a platform for parents and faculty advisors to discuss student development.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Note Privacy & Tiered Visibility */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-rose-900 text-white flex items-center justify-center text-xs font-bold">3</span>
            <span>Note Privacy & Confidentiality Tiers</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            How meeting notes are isolated to protect student privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>Student Visible</span>
            </div>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              Summary notes, agreed remedial homework, and target deadlines. Visible directly to the mentee on their dashboard.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
              <span>Mentor Only (Private)</span>
            </div>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Mentor's observational impressions, behavioral notes, and coordinator review. Invisible to the student.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
            <div className="font-bold text-rose-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span>Restricted Counselling</span>
            </div>
            <p className="text-rose-800 text-[11px] leading-relaxed">
              Sensitive psychological or welfare information. Strictly isolated to the author mentor and designated welfare officers.
            </p>
          </div>
        </div>
      </div>

      {/* Official Links */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <div className="font-bold text-sm">Official Institutional Reference</div>
          <div className="text-slate-400">
            Student Mentoring & Counselling page on NMAMIT official university portal.
          </div>
        </div>
        <a
          href="https://nitte.edu.in/nmamit/student-mentoring.php"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-semibold shrink-0 transition"
        >
          <span>Open Official Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
