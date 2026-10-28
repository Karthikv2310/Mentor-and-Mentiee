"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Filter,
  ArrowLeft,
  AlertCircle,
  Clock,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const [meRes, logRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch(`/api/audit-logs${actionFilter ? `?action=${actionFilter}` : ""}`),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);
        }

        if (logRes.ok) {
          const lData = await logRes.json();
          setLogs(lData.logs || []);
        }
      } catch (err) {
        console.error("Failed to load audit logs", err);
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, [actionFilter]);

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-400">Loading audit trail...</div>;
  }

  if (currentUser?.role !== "ADMIN" && currentUser?.role !== "HOD") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <Shield className="w-12 h-12 text-rose-600 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">Access Restricted</h1>
        <p className="text-xs text-slate-500">
          Security audit logs are restricted exclusively to Institutional Administrators and Department Coordinators.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold mb-1">
            <Shield className="w-4 h-4" />
            <span>Compliance & Security Audit Trail</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            System Audit Log Records
          </h1>
          <p className="text-xs text-slate-500">
            Immutable log of student creation, bulk imports, mentor assignments, session updates, and authentication events.
          </p>
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-800"
          >
            <option value="">All Audit Actions</option>
            <option value="STUDENT_CREATED">STUDENT_CREATED</option>
            <option value="BULK_IMPORT">BULK_IMPORT</option>
            <option value="MENTOR_ASSIGNED">MENTOR_ASSIGNED</option>
            <option value="MEETING_SCHEDULED">MEETING_SCHEDULED</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
            <option value="STAGING_APPROVED_PUBLIC_ONLY">STAGING_APPROVED</option>
            <option value="FACULTY_ACCOUNT_PROVISIONED">FACULTY_ACCOUNT_PROVISIONED</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No audit events found matching the filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Timestamp (IST)</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{log.actorEmail || "System"}</div>
                      {log.actorRole && (
                        <span className="text-[10px] text-slate-400 font-mono">[{log.actorRole}]</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{log.entityType}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{log.ipAddress || "127.0.0.1"}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate text-[11px]">
                      {log.detailsJson || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
