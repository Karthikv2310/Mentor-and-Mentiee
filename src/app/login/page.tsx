"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  Shield,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  User,
  GraduationCap,
  Users,
  Building2,
  Sparkles,
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode: "signin" | "register"
  const [mode, setMode] = useState<"signin" | "register">("signin");

  // Sign In state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("ALL");

  // Registration state
  const [regFullName, setRegFullName] = useState("");
  const [regUsn, setRegUsn] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regDept, setRegDept] = useState("ISE");
  const [regSemester, setRegSemester] = useState(5);
  const [regSection, setRegSection] = useState("A");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const requestedMode = searchParams.get("mode");
    if (requestedMode === "register") {
      setMode("register");
    } else {
      setMode("signin");
    }
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
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

      setSuccessMsg("Signed in successfully. Redirecting to dashboard...");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected network error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters in length.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: regFullName,
          institutionalId: regUsn,
          email: regEmail,
          departmentCode: regDept,
          currentSemester: Number(regSemester),
          section: regSection,
          password: regPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed. Please check your details.");
        return;
      }

      setSuccessMsg("Account created successfully! Redirecting to your mentee dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch {
      setError("An unexpected network error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail: string, demoPass: string, roleName: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setSelectedRole(roleName);
    setError(null);
  };

  const departmentsList = [
    { code: "CSE", name: "Computer Science & Engineering" },
    { code: "ISE", name: "Information Science & Engineering" },
    { code: "ECE", name: "Electronics & Communication Engineering" },
    { code: "AI_DS", name: "Artificial Intelligence & Data Science" },
    { code: "AI_ML", name: "Artificial Intelligence & Machine Learning" },
    { code: "CCE", name: "Computer & Communication Engineering" },
    { code: "CS_CY", name: "CSE (Cyber Security)" },
    { code: "EEE", name: "Electrical & Electronics Engineering" },
    { code: "MECH", name: "Mechanical Engineering" },
    { code: "CIVIL", name: "Civil Engineering" },
    { code: "BT", name: "Biotechnology" },
    { code: "RAI", name: "Robotics & Artificial Intelligence" },
  ];

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Institutional Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-xl bg-rose-900 text-white font-extrabold flex items-center justify-center text-2xl shadow-lg border border-rose-700">
            N
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            NMAMIT Mentor–Mentee Portal
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Official academic mentoring & proctoring system for NMAM Institute of Technology, Nitte.
          </p>
        </div>

        {/* Tab Selector: Sign In vs Create Account */}
        <div className="flex rounded-xl bg-slate-200 p-1 border border-slate-300">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
              mode === "signin"
                ? "bg-white text-rose-950 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign In to Portal
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
              mode === "register"
                ? "bg-white text-rose-950 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Create Student Account
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white py-7 px-6 sm:px-8 shadow-xl rounded-2xl border border-slate-200 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === "signin" ? (
            /* ================= SIGN IN TAB ================= */
            <div className="space-y-5">
              {/* Role selector indicators */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Select Portal Role
                </label>
                <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => fillCredentials("student.demo@nmamit.in", "NmamitStudent@2026", "STUDENT")}
                    className={`py-1.5 px-1 rounded border text-center font-medium transition ${
                      selectedRole === "STUDENT"
                        ? "bg-rose-900 text-white border-rose-900 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    🎓 Mentee
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials("mentor.cse@nmamit.in", "NmamitMentor@2026", "TEACHER")}
                    className={`py-1.5 px-1 rounded border text-center font-medium transition ${
                      selectedRole === "TEACHER"
                        ? "bg-rose-900 text-white border-rose-900 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    👨‍🏫 Mentor
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials("hod.cse@nmamit.in", "NmamitHod@2026", "HOD")}
                    className={`py-1.5 px-1 rounded border text-center font-medium transition ${
                      selectedRole === "HOD"
                        ? "bg-rose-900 text-white border-rose-900 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    🏛️ HoD
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials("admin@nmamit.in", "NmamitAdmin@2026", "ADMIN")}
                    className={`py-1.5 px-1 rounded border text-center font-medium transition ${
                      selectedRole === "ADMIN"
                        ? "bg-rose-900 text-white border-rose-900 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    🛡️ Admin
                  </button>
                </div>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
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
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 focus:border-rose-800 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <input id="remember" type="checkbox" defaultChecked className="rounded text-rose-800 focus:ring-rose-800" />
                    <label htmlFor="remember">Remember session</label>
                  </div>
                  <span className="text-[11px] text-slate-400">Institutional SSO Protected</span>
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

              {/* Institutional Single Sign-On Option */}
              <div className="pt-2">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-2 text-[10px] text-slate-400 uppercase tracking-wider">
                    Or Sign In With
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  type="button"
                  onClick={() => fillCredentials("student.demo@nmamit.in", "NmamitStudent@2026", "STUDENT")}
                  className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Nitte Institutional Google Workspace</span>
                </button>
              </div>

              {/* Switch link */}
              <div className="text-center pt-2 text-xs text-slate-500">
                New student without a portal password?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-rose-800 font-semibold hover:underline"
                >
                  Create student account
                </button>
              </div>
            </div>
          ) : (
            /* ================= REGISTER TAB ================= */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-sm font-bold text-slate-900">Student Mentee Registration</h2>
                <p className="text-[11px] text-slate-500">
                  Enrolled NMAMIT students can create an account using their USN.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name (as per NMAMIT records)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Karthik V"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 focus:border-rose-800 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    USN / NDU Reg No.
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsn}
                    onChange={(e) => setRegUsn(e.target.value)}
                    placeholder="e.g. NNM23IS086"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase focus:outline-none focus:ring-2 focus:ring-rose-800 focus:border-rose-800 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
                  >
                    {departmentsList.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Semester
                  </label>
                  <select
                    value={regSemester}
                    onChange={(e) => setRegSemester(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Section
                  </label>
                  <select
                    value={regSection}
                    onChange={(e) => setRegSection(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
                  >
                    {["A", "B", "C", "D"].map((sec) => (
                      <option key={sec} value={sec}>
                        Section {sec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institutional / Contact Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. nnm23is086@nmamit.in"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 focus:border-rose-800 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Create Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-rose-800 hover:bg-rose-700 text-white font-semibold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? "Creating Account..." : "Create Mentee Account & Sign In"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center pt-2 text-xs text-slate-500">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-rose-800 font-semibold hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security & Support Note */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <div>
            Faculty or HoD accounts are provisioned by Administration. Contact{" "}
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center text-xs text-slate-500">
          Loading authentication portal...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
