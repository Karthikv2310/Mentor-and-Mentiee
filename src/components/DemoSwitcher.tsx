"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Users, GraduationCap, ArrowRight, Check } from "lucide-react";

export default function DemoSwitcher() {
  const router = useRouter();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [activeMessage, setActiveMessage] = useState<string | null>(null);

  const testAccounts = [
    {
      label: "Admin",
      email: "admin@nmamit.in",
      pass: "NmamitAdmin@2026",
      desc: "Institution-wide governance, approvals, full reports",
      icon: ShieldCheck,
      color: "bg-purple-900/80 hover:bg-purple-800 text-purple-100 border-purple-700",
    },
    {
      label: "HoD (CSE)",
      email: "hod.cse@nmamit.in",
      pass: "NmamitHod@2026",
      desc: "Dept Coordinator (Dr. Raju K), assign mentors, dept reports",
      icon: Users,
      color: "bg-blue-900/80 hover:bg-blue-800 text-blue-100 border-blue-700",
    },
    {
      label: "Mentor / Proctor",
      email: "mentor.cse@nmamit.in",
      pass: "NmamitMentor@2026",
      desc: "Teacher (Dr. Sudeepa K B), add students, meetings, notes",
      icon: User,
      color: "bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border-emerald-700",
    },
    {
      label: "Mentee (Student)",
      email: "student.demo@nmamit.in",
      pass: "NmamitStudent@2026",
      desc: "Aditya Rao (4NM23CS042), own meetings, goals, feedback",
      icon: GraduationCap,
      color: "bg-amber-900/80 hover:bg-amber-800 text-amber-100 border-amber-700",
    },
  ];

  const handleQuickLogin = async (email: string, pass: string, roleName: string) => {
    setLoadingRole(roleName);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();
      if (res.ok) {
        setActiveMessage(`Logged in as ${roleName}`);
        router.push("/dashboard");
        router.refresh();
      } else {
        alert(data.error || "Login failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-white">Interactive QA Demo Bar:</span>
          <span className="text-slate-400 hidden sm:inline">
            Switch between authenticated institutional roles instantly:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {testAccounts.map((acc) => {
            const Icon = acc.icon;
            const isLoading = loadingRole === acc.label;
            return (
              <button
                key={acc.label}
                onClick={() => handleQuickLogin(acc.email, acc.pass, acc.label)}
                disabled={!!loadingRole}
                title={`${acc.desc} (${acc.email})`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition disabled:opacity-50 ${acc.color}`}
              >
                <Icon className="w-3 h-3" />
                <span>{isLoading ? "Signing in..." : acc.label}</span>
                <ArrowRight className="w-2.5 h-2.5 opacity-60" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
