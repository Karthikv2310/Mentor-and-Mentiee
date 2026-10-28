"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  PlusCircle,
} from "lucide-react";

export default function ActionItemsPage() {
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState("");

  const loadData = async () => {
    try {
      const [meRes, actRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/action-items"),
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.user);
      }

      if (actRes.ok) {
        const aData = await actRes.json();
        setActionItems(aData.actionItems || []);
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

  const handleToggleStatus = async (item: any) => {
    const isCompleted = item.status === "COMPLETED";
    const newStatus = isCompleted ? "OPEN" : "COMPLETED";

    try {
      const res = await fetch("/api/action-items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          status: newStatus,
          outcomeNotes: newStatus === "COMPLETED" ? (outcomeNotes || "Goal completed and validated.") : undefined,
        }),
      });

      if (res.ok) {
        setCompletingId(null);
        setOutcomeNotes("");
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = actionItems.filter((item) => {
    if (statusFilter === "ALL") return true;
    return item.status === statusFilter;
  });

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-400">Loading agreed goals...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Academic Remediation & Goals</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Action Items & Mentoring Follow-ups
          </h1>
          <p className="text-xs text-slate-500">
            Track student remediation progress, tutorial completions, and agreed academic targets.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs">
        {["ALL", "OPEN", "COMPLETED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === tab
                ? "bg-rose-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {tab === "ALL" ? `All Goals (${actionItems.length})` : tab}
          </button>
        ))}
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-400 text-xs rounded-xl border border-slate-200">
            No action items matching the filter "{statusFilter}".
          </div>
        ) : (
          filteredItems.map((item) => {
            const isCompleted = item.status === "COMPLETED";
            const isPastDue = new Date(item.dueDate) < new Date() && !isCompleted;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border p-5 shadow-sm space-y-3 text-xs transition ${
                  isCompleted ? "border-slate-200 bg-slate-50/50" : isPastDue ? "border-rose-300" : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition ${
                        isCompleted
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-300 hover:border-slate-500 bg-white"
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="space-y-1">
                      <div className={`font-bold text-sm ${isCompleted ? "line-through text-slate-400" : "text-slate-900"}`}>
                        {item.title}
                      </div>
                      {item.description && (
                        <p className="text-slate-600 text-xs">{item.description}</p>
                      )}
                      <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1">
                        <span>
                          Mentee:{" "}
                          <Link href={`/students/${item.student.id}`} className="font-semibold text-rose-800 hover:underline">
                            {item.student.fullName} ({item.student.institutionalId})
                          </Link>
                        </span>
                        <span>•</span>
                        <span>Assigned to: <strong className="text-slate-700">{item.assignedToRole}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800"
                          : item.priority === "HIGH" || item.priority === "URGENT"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.priority}
                    </span>
                    <div className={`text-[11px] font-medium ${isPastDue ? "text-rose-700 font-bold" : "text-slate-500"}`}>
                      Target: {new Date(item.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {item.outcomeNotes && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200">
                    <strong>Outcome Notes:</strong> {item.outcomeNotes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
