"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  UserPlus,
  AlertCircle,
  Building,
} from "lucide-react";

export default function FacultyDirectoryPage() {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [provisioningFaculty, setProvisioningFaculty] = useState<any | null>(null);
  const [officialEmailInput, setOfficialEmailInput] = useState("");
  const [assignedRole, setAssignedRole] = useState("TEACHER");
  const [provisionMessage, setProvisionMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [meRes, refRes, facRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/reference-data"),
        fetch(`/api/faculty/staging?status=${statusFilter}&departmentId=${deptFilter}`),
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.user);
      }
      if (refRes.ok) {
        const refData = await refRes.json();
        setDepartments(refData.departments || []);
      }
      if (facRes.ok) {
        const fData = await facRes.json();
        setFaculty(fData.faculty || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [deptFilter, statusFilter]);

  const handleApproveDirectoryOnly = async (facultyProfileId: string) => {
    try {
      const res = await fetch("/api/faculty/staging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facultyProfileId,
          action: "APPROVE_DIRECTORY_ONLY",
        }),
      });

      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provisioningFaculty || !officialEmailInput) return;

    try {
      const res = await fetch("/api/faculty/staging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facultyProfileId: provisioningFaculty.id,
          action: "PROVISION_ACCOUNT",
          officialEmail: officialEmailInput,
          assignedRole,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setProvisionMessage(
          `Account provisioned for ${provisioningFaculty.fullName}. One-time activation link generated.`
        );
        setProvisioningFaculty(null);
        setOfficialEmailInput("");
        loadData();
      } else {
        alert(data.error || "Provisioning failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold mb-1">
            <Users className="w-4 h-4" />
            <span>Verified Teaching Staff Directory</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Faculty Directory & Staging Area
          </h1>
          <p className="text-xs text-slate-500">
            Publicly listed teaching staff extracted from official NMAMIT department rosters. Login access is strictly partitioned and requires administrator review.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Administrator Verification Mode</span>
          </div>
        )}
      </div>

      {provisionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{provisionMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>

          {isAdmin && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">Approved Profiles</option>
              <option value="STAGED">Staged Awaiting Review</option>
            </select>
          )}
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong className="text-slate-900">{faculty.length}</strong> faculty profiles
        </div>
      </div>

      {/* Provision Account Modal */}
      {provisioningFaculty && (
        <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-xl space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="font-bold text-sm">
              Provision Login Account: {provisioningFaculty.fullName}
            </div>
            <button
              onClick={() => setProvisioningFaculty(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <p className="text-slate-300 text-xs">
            Public directory profile will be linked to an authenticated account. Confirm the official NMAMIT institutional email.
          </p>

          <form onSubmit={handleProvisionSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Official Institutional Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. faculty_name@nitte.edu.in"
                value={officialEmailInput}
                onChange={(e) => setOfficialEmailInput(e.target.value)}
                className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Assign System Role</label>
              <select
                value={assignedRole}
                onChange={(e) => setAssignedRole(e.target.value)}
                className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="TEACHER">Teacher / Mentor</option>
                <option value="HOD">Department Coordinator / HoD</option>
                <option value="ADMIN">Institutional Administrator</option>
              </select>
            </div>

            <div className="sm:col-span-3 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProvisioningFaculty(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-800 hover:bg-rose-700 text-white font-bold rounded-lg transition"
              >
                Confirm & Send Activation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {faculty.map((f) => {
          const isStaged = f.approvalStatus === "STAGED";
          const hasLogin = !!f.userId;

          return (
            <div
              key={f.id}
              className={`bg-white rounded-xl border p-5 shadow-sm space-y-4 text-xs transition ${
                isStaged ? "border-amber-300 bg-amber-50/20" : "border-slate-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300 flex items-center justify-center">
                  {f.photoUrl ? (
                    <img src={f.photoUrl} alt={f.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                      {f.employeeCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        f.approvalStatus === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {f.approvalStatus}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">
                    {f.prefix} {f.fullName}
                  </h3>
                  <div className="text-[11px] text-slate-500">{f.designation}</div>
                  <div className="text-[11px] font-semibold text-rose-800">{f.department.name}</div>
                </div>
              </div>

              {/* Source Verification Badge */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Publicly Verified Source</span>
                </div>
                {f.officialProfileUrl && (
                  <a
                    href={f.officialProfileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-rose-800 hover:underline flex items-center gap-0.5 font-medium"
                  >
                    <span>Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Administrative Actions */}
              {isAdmin && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Login Account:{" "}
                      <strong className={hasLogin ? "text-emerald-700" : "text-slate-500"}>
                        {hasLogin ? "Active" : "None"}
                      </strong>
                    </span>

                    {!hasLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setProvisioningFaculty(f);
                          setOfficialEmailInput("");
                        }}
                        className="px-2.5 py-1 rounded bg-rose-800 hover:bg-rose-700 text-white font-semibold text-[11px] flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Provision Login</span>
                      </button>
                    )}
                  </div>

                  {isStaged && (
                    <button
                      type="button"
                      onClick={() => handleApproveDirectoryOnly(f.id)}
                      className="w-full py-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-center text-[11px] transition"
                    >
                      Approve for Public Directory Only
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
