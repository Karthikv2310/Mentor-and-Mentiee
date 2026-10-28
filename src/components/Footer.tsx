"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, ShieldAlert } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      {/* Institutional Prototype Disclaimer Notice per guidelines */}
      <div className="bg-amber-950/40 border-b border-amber-800/40 px-4 py-2 text-center text-amber-200 text-xs flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>Notice:</strong> This application is an institutional paired mentor–mentee portal developed for NMAMIT, Nitte. Not officially endorsed or deployed unless qualified institutional review and documentary authorization is provided.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Institute Info */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm">NMAM Institute of Technology</h3>
            <p className="text-slate-400 leading-relaxed text-xs">
              Established in 1986. A constituent engineering college of Nitte (Deemed to be University), Mangaluru.
              Accredited with Tier-I NBA accreditation for UG programs.
            </p>
            <div className="text-[11px] text-slate-400">
              Udupi District, Karnataka, India - 574110
            </div>
          </div>

          {/* Col 2: Mentoring Framework */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm">Mentoring Framework</h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/mentoring-guide" className="hover:text-rose-400 transition">
                  Faculty Advisor vs Class Proctor System
                </Link>
              </li>
              <li>
                <Link href="/mentoring-guide#mse1" className="hover:text-rose-400 transition">
                  Post MSE-1 Academic Intervention
                </Link>
              </li>
              <li>
                <Link href="/mentoring-guide#attendance" className="hover:text-rose-400 transition">
                  Attendance Shortage Counseling
                </Link>
              </li>
              <li>
                <Link href="/mentoring-guide#parents" className="hover:text-rose-400 transition">
                  Parent Communication Protocol
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Policies & Compliance */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm">Governance & Compliance</h3>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-rose-400 transition">
                  Student Data Privacy Notice (DPDP)
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:text-rose-400 transition">
                  Accessibility Statement (WCAG 2.1 AA)
                </Link>
              </li>
              <li>
                <Link href="/audit-logs" className="hover:text-rose-400 transition">
                  Security Audit Logs (Restricted)
                </Link>
              </li>
              <li>
                <Link href="/faculty-directory" className="hover:text-rose-400 transition">
                  Verified Teaching Faculty Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Institutional Contacts */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm">Official Contact</h3>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>Nitte, Karkala Taluk, Udupi - 574110, Karnataka</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>+91-8258-281263 / 281039</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <a href="mailto:principal_nmamit@nitte.edu.in" className="hover:text-rose-300">
                  principal_nmamit@nitte.edu.in
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © 2026 NMAM Institute of Technology, Nitte. Built with role-based scoping, tiered notes, and persistent database.
          </div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition">Privacy Notice</Link>
            <Link href="/accessibility" className="hover:text-white transition">Accessibility</Link>
            <Link href="/contact" className="hover:text-white transition">Institutional Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
