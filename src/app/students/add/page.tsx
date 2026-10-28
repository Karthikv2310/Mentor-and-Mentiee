"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Save,
  HelpCircle,
} from "lucide-react";

export default function AddStudentPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [institutionalId, setInstitutionalId] = useState("");
  const [fullName, setFullName] = useState("");
  const [institutionalEmail, setInstitutionalEmail] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [programmeId, setProgrammeId] = useState("");
  const [admissionYear, setAdmissionYear] = useState("2024");
  const [currentSemester, setCurrentSemester] = useState("1");
  const [section, setSection] = useState("A");
  const [admissionCategory, setAdmissionCategory] = useState("REGULAR");
  const [assignedMentorId, setAssignedMentorId] = useState("");
  const [mentorRoleType, setMentorRoleType] = useState("CLASS_PROCTOR");
  const [pcmPercentagePUC, setPcmPercentagePUC] = useState("");

  useEffect(() => {
    async function loadRefs() {
      try {
        const [meRes, refRes, facRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/reference-data"),
          fetch("/api/faculty/staging?status=APPROVED"),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);
          // If teacher or HoD, lock department to scope
          if (meData.user.departmentScopeId) {
            setDepartmentId(meData.user.departmentScopeId);
          }
        }

        if (refRes.ok) {
          const refData = await refRes.json();
          setDepartments(refData.departments || []);
          if (refData.departments?.length > 0 && !departmentId) {
            setDepartmentId(refData.departments[0].id);
          }
        }

        if (facRes.ok) {
          const facData = await facRes.json();
          setFaculty(facData.faculty || []);
        }
      } catch (err) {
        console.error("Failed to load reference metadata", err);
      } finally {
        setLoading(false);
      }
    }

    loadRefs();
  }, []);

  // Update available programmes when department changes
  const selectedDept = departments.find((d) => d.id === departmentId);
  const availableProgrammes = selectedDept?.programmes || [];

  useEffect(() => {
    if (availableProgrammes.length > 0) {
      setProgrammeId(availableProgrammes[0].id);
    }
  }, [departmentId, availableProgrammes]);

  // Mentors filtered by selected department
  const departmentFaculty = faculty.filter((f) => f.departmentId === departmentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload: any = {
        institutionalId: institutionalId.trim(),
        fullName: fullName.trim(),
        institutionalEmail: institutionalEmail.trim() || undefined,
        departmentId,
        programmeId,
        admissionYear: parseInt(admissionYear, 10),
        currentSemester: parseInt(currentSemester, 10),
        section: section.trim().toUpperCase(),
        admissionCategory,
      };

      if (assignedMentorId) {
        payload.assignedMentorId = assignedMentorId;
        payload.mentorRoleType = mentorRoleType;
      }

      if (pcmPercentagePUC) {
        payload.pcmPercentagePUC = parseFloat(pcmPercentagePUC);
      }

      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create student record");
        return;
      }

      router.push(`/students/${data.student.id}`);
      router.refresh();
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading authorized scope...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb Back */}
      <div>
        <Link
          href="/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Student Roster</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Authorized Scope Creation</span>
          </div>
          <h1 className="text-xl font-bold">Add New Student Record</h1>
          <p className="text-xs text-slate-300">
            Create an individual student record within your permitted department scope.
          </p>
        </div>

        {error && (
          <div className="m-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <div className="font-semibold">Creation Error</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 text-xs">
          {/* Section 1: Institutional Identification */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider border-b border-slate-100 pb-2">
              1. Institutional Identification
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Institutional ID / USN <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4NM23CS120 or NNM24CS045"
                  value={institutionalId}
                  onChange={(e) => setInstitutionalId(e.target.value.toUpperCase())}
                  className="w-full font-mono py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800"
                />
                <div className="text-[11px] text-slate-400 mt-1">Unique VTU USN or NDU Registration No.</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Student's legal name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Institutional Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. 4nm23cs120@nmamit.in"
                  value={institutionalEmail}
                  onChange={(e) => setInstitutionalEmail(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800"
                />
                <div className="text-[11px] text-slate-400 mt-1">Optional; portal accounts are invited separately.</div>
              </div>
            </div>
          </div>

          {/* Section 2: Department & Academic Enrolment */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider border-b border-slate-100 pb-2">
              2. Academic Enrolment Scope
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department <span className="text-rose-600">*</span>
                </label>
                <select
                  value={departmentId}
                  disabled={currentUser?.role !== "ADMIN"}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white disabled:bg-slate-100"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
                {currentUser?.role !== "ADMIN" && (
                  <div className="text-[10px] text-slate-400 mt-1">Scoped to your assigned department</div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Programme <span className="text-rose-600">*</span>
                </label>
                <select
                  value={programmeId}
                  onChange={(e) => setProgrammeId(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
                >
                  {availableProgrammes.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admission Category</label>
                <select
                  value={admissionCategory}
                  onChange={(e) => setAdmissionCategory(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
                >
                  <option value="REGULAR">Regular (CET / COMED-K / NUCAT)</option>
                  <option value="LATERAL_ENTRY">Lateral Entry (Diploma)</option>
                  <option value="NRI">NRI Quota</option>
                  <option value="MANAGEMENT">Management Quota</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admission Year</label>
                <input
                  type="number"
                  min="2018"
                  max="2030"
                  value={admissionYear}
                  onChange={(e) => setAdmissionYear(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Semester</label>
                <select
                  value={currentSemester}
                  onChange={(e) => setCurrentSemester(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Section</label>
                <input
                  type="text"
                  maxLength={3}
                  value={section}
                  onChange={(e) => setSection(e.target.value.toUpperCase())}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800"
                />
              </div>
            </div>
          </div>

          {/* Section 3: NMAMIT Mentoring Policy Allotment */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wider border-b border-slate-100 pb-2">
              3. NMAMIT Mentoring Allotment (Optional)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assign Mentor (Faculty)
                </label>
                <select
                  value={assignedMentorId}
                  onChange={(e) => setAssignedMentorId(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
                >
                  <option value="">-- Assign Later by HoD --</option>
                  {departmentFaculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.prefix} {f.fullName} ({f.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mentoring Role Type</label>
                <select
                  value={mentorRoleType}
                  onChange={(e) => setMentorRoleType(e.target.value)}
                  disabled={!assignedMentorId}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white disabled:bg-slate-100"
                >
                  <option value="CLASS_PROCTOR">Class Proctor (Group Monitoring)</option>
                  <option value="FACULTY_ADVISOR">Faculty Advisor (Academic Intervention)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  PUC PCM Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g. 64.5"
                  value={pcmPercentagePUC}
                  onChange={(e) => setPcmPercentagePUC(e.target.value)}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800"
                />
                <div className="text-[10px] text-slate-400 mt-1">
                  NMAMIT Policy: Students with &lt;65% PCM are flagged for Faculty Advisor.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <Link
              href="/students"
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? "Saving..." : "Create Student Record"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
