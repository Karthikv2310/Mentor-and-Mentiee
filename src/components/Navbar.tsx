"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  Calendar,
  CheckSquare,
  BarChart3,
  Shield,
  BookOpen,
  LogOut,
  LogIn,
  UserCheck,
  Building2,
  Menu,
  X,
} from "lucide-react";

interface UserSession {
  id: string;
  email: string;
  role: "ADMIN" | "HOD" | "TEACHER" | "STUDENT";
  firstName: string;
  lastName: string;
  departmentScopeId?: string | null;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { href: "/students", label: "Students", icon: GraduationCap, roles: ["ADMIN", "HOD", "TEACHER"] },
    { href: "/mentors", label: "Mentor Assignments", icon: UserCheck, roles: ["ADMIN", "HOD"] },
    { href: "/meetings", label: "Meetings", icon: Calendar, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { href: "/action-items", label: "Action Items", icon: CheckSquare, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { href: "/faculty-directory", label: "Faculty Directory", icon: Users, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
    { href: "/reports", label: "Reports", icon: Building2, roles: ["ADMIN", "HOD", "TEACHER"] },
    { href: "/audit-logs", label: "Audit Logs", icon: Shield, roles: ["ADMIN", "HOD"] },
    { href: "/mentoring-guide", label: "Mentoring Guide", icon: BookOpen, roles: ["ADMIN", "HOD", "TEACHER", "STUDENT"] },
  ];

  const visibleLinks = user
    ? navLinks.filter((l) => l.roles.includes(user.role))
    : navLinks.filter((l) => ["/faculty-directory", "/mentoring-guide"].includes(l.href));

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top institutional sub-bar */}
      <div className="bg-rose-950/80 px-4 py-1.5 text-xs text-rose-200 border-b border-rose-900/50 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wide">NMAM Institute of Technology, Nitte</span>
          <span className="text-rose-400">|</span>
          <span className="text-rose-300">Off-Campus Centre of Nitte (Deemed to be University)</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-rose-300">
          <span>Est. 1986</span>
          <span>NIRF Rank Band 151-200</span>
          <span>NBA Tier-I Accredited</span>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-rose-900 text-white font-bold flex items-center justify-center text-lg shadow-inner border border-rose-700 group-hover:bg-rose-800 transition">
              N
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                NMAMIT
                <span className="text-xs px-2 py-0.5 rounded bg-rose-900/80 text-rose-200 border border-rose-700/60 font-medium">
                  Portal
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-normal">
                Mentor–Mentee Management System
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition ${
                    isActive
                      ? "bg-rose-900 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Auth Action */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-semibold text-white">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="font-mono uppercase font-semibold text-rose-300">{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white border border-slate-700 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium bg-rose-800 hover:bg-rose-700 text-white shadow transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Portal Login</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium ${
                  isActive ? "bg-rose-900 text-white" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-slate-800 mt-2">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-rose-400">{user.email} ({user.role})</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-rose-950 text-rose-200 text-xs rounded border border-rose-800"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2 bg-rose-800 text-white rounded text-sm font-medium"
              >
                Sign In to Portal
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
