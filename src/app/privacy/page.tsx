import Link from "next/link";
import { Shield, Lock, FileText, ArrowLeft, AlertCircle } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 text-xs text-slate-700">
        <div className="border-b border-slate-100 pb-4 space-y-1">
          <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold">
            <Shield className="w-4 h-4" />
            <span>Institutional Data Protection Policy</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Student Data Privacy Notice & Governance Statement
          </h1>
          <p className="text-xs text-slate-500">
            Governing the collection, scoping, and lifecycle of student mentoring records at NMAMIT.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Prototype Legal Notice:</strong> The existence of this privacy notice is an architectural demonstration of data minimization and security controls. Before live institutional deployment, full legal and administrative authorization from Nitte (Deemed to be University) is mandatory.
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-sm text-slate-900">1. Data Minimization Principles</h2>
          <p className="leading-relaxed">
            In accordance with best practices and the Digital Personal Data Protection (DPDP) principles, the NMAMIT Mentor–Mentee Portal strictly minimizes data collection to essential academic and administrative fields:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
            <li><strong>Institutional Identifier / USN:</strong> Used strictly for academic verification.</li>
            <li><strong>Student Full Name & Department:</strong> For roster and section identification.</li>
            <li><strong>Semester Academic Performance:</strong> SGPA, CGPA, and Attendance percentage for proctor reviews.</li>
            <li><strong>Non-Collection of Sensitive Data:</strong> We deliberately avoid collecting personal telephone numbers, guardian financial details, biometric data, or health records unless an approved institutional mandate exists.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-sm text-slate-900">2. Server-Side Scoping & Access Controls</h2>
          <p className="leading-relaxed">
            Data is strictly partitioned to prevent Insecure Direct Object Reference (IDOR) attacks:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
            <li><strong>Students:</strong> Can view only their own records, assigned mentor profiles, and shared meeting summaries. Cannot browse or search other students.</li>
            <li><strong>Teachers & Mentors:</strong> Access is restricted strictly to assigned mentees and authorized sections. Cannot view other mentors' student records.</li>
            <li><strong>Department Coordinators (HoD):</strong> Scoped strictly to their assigned academic department. Cannot access restricted counselling notes.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-sm text-slate-900">3. Note Visibility Isolation</h2>
          <p className="leading-relaxed">
            Meeting records support three explicit confidentiality tiers:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
            <li><strong>Student Visible (`STUDENT_VISIBLE`):</strong> Action items and academic summaries shared transparently with the mentee.</li>
            <li><strong>Mentor Only (`MENTOR_ONLY`):</strong> Internal notes for mentor tracking, invisible to student accounts.</li>
            <li><strong>Restricted Counselling (`RESTRICTED_COUNSELLING`):</strong> High-sensitivity welfare observations completely isolated from general dashboards and reports.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-sm text-slate-900">4. Retention & Archival</h2>
          <p className="leading-relaxed">
            Academic progression and mentoring logs are retained for 7 years following a cohort's graduation to satisfy accreditation and university compliance audits. Deactivated users cannot continue using active sessions.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Last Reviewed: October 2026</span>
          <a href="mailto:principal_nmamit@nitte.edu.in" className="text-rose-800 hover:underline">
            principal_nmamit@nitte.edu.in
          </a>
        </div>
      </div>
    </div>
  );
}
