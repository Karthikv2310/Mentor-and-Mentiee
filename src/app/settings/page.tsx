"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Settings, Save, CheckCircle2, AlertCircle, ArrowLeft, Shield } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const [meRes, setRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/settings"),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);
        }

        if (setRes.ok) {
          const sData = await setRes.json();
          setSettings(sData.settings || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleUpdate = async (key: string, value: string) => {
    setSavingKey(key);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settingKey: key, settingValue: value }),
      });

      if (res.ok) {
        setMessage(`Setting "${key}" updated successfully.`);
      } else {
        alert("Failed to update setting");
      }
    } catch {
      alert("Network error");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return <div className="p-16 text-center text-xs text-slate-400">Loading settings...</div>;
  }

  if (currentUser?.role !== "ADMIN") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <Shield className="w-10 h-10 text-rose-600 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">Administrator Access Required</h1>
        <p className="text-xs text-slate-500">
          Institutional parameters and policies may only be altered by an authorized administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-xs text-slate-700">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold mb-1">
            <Settings className="w-4 h-4" />
            <span>Configurable Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Settings & Policy Limits
          </h1>
          <p className="text-xs text-slate-500">
            Define institutional identifier labels, proctor capacity thresholds, and intervention triggers.
          </p>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        <div className="space-y-4">
          {settings.map((s) => (
            <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-900">{s.settingKey}</span>
                  {s.description && (
                    <p className="text-[11px] text-slate-500">{s.description}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    const inputEl = document.getElementById(`setting_${s.settingKey}`) as HTMLInputElement;
                    if (inputEl) handleUpdate(s.settingKey, inputEl.value);
                  }}
                  disabled={savingKey === s.settingKey}
                  className="px-3 py-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1 transition"
                >
                  <Save className="w-3 h-3" />
                  <span>{savingKey === s.settingKey ? "Saving..." : "Save"}</span>
                </button>
              </div>

              <input
                id={`setting_${s.settingKey}`}
                type="text"
                defaultValue={s.settingValue}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
