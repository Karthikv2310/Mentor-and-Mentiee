"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Shield, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed. Please verify credentials.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8">
        {/* Institutional Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-xl bg-rose-900 text-white font-extrabold flex items-center justify-center text-2xl shadow-lg border border-rose-700">
            N
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            NMAMIT Mentor–Mentee Portal
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Authorized sign in for NMAMIT faculty coordinators, teachers, and enrolled mentees.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl rounded-2xl border border-slate-200 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. mentor.cse@nmamit.in"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 focus:border-rose-800 bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 focus:border-rose-800 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <input id="remember" type="checkbox" className="rounded text-rose-800 focus:ring-rose-800" />
                <label htmlFor="remember">Remember session</label>
              </div>
              <span className="text-[11px] text-slate-400">Institutional SSO protected</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-semibold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Authenticating..." : "Sign In to Portal"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="border-t border-slate-100 pt-5 space-y-2.5">
            <div className="text-[11px] font-semibold text-slate-500 text-center uppercase tracking-wider">
              Quick Test Credentials (Pre-Seeded)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials("admin@nmamit.in", "NmamitAdmin@2026")}
                className="p-2 text-left rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
              >
                <div className="font-semibold text-slate-800">Admin Account</div>
                <div className="text-[10px] text-slate-500">admin@nmamit.in</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("hod.cse@nmamit.in", "NmamitHod@2026")}
                className="p-2 text-left rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
              >
                <div className="font-semibold text-slate-800">HoD CSE</div>
                <div className="text-[10px] text-slate-500">hod.cse@nmamit.in</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("mentor.cse@nmamit.in", "NmamitMentor@2026")}
                className="p-2 text-left rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
              >
                <div className="font-semibold text-slate-800">Teacher Mentor</div>
                <div className="text-[10px] text-slate-500">mentor.cse@nmamit.in</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials("student.demo@nmamit.in", "NmamitStudent@2026")}
                className="p-2 text-left rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
              >
                <div className="font-semibold text-slate-800">Student Mentee</div>
                <div className="text-[10px] text-slate-500">student.demo@nmamit.in</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Support Note */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <div>
            Need assistance or account access? Contact{" "}
            <a href="mailto:principal_nmamit@nitte.edu.in" className="text-rose-800 underline">
              principal_nmamit@nitte.edu.in
            </a>
          </div>
          <div className="text-[11px] text-slate-400">
            Sessions expire after 7 days of inactivity. All authentication attempts are logged.
          </div>
        </div>
      </div>
    </div>
  );
}
