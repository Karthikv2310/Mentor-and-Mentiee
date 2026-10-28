import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function AccessibilityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-xs text-slate-700">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Accessibility Statement
          </h1>
          <p className="text-xs text-slate-500">
            Commitment to inclusive access in accordance with WCAG 2.1 Level AA standards.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-sm text-slate-900">Accessibility Standards</h2>
          <p className="leading-relaxed">
            NMAMIT Mentor–Mentee Portal is designed to ensure equitable digital access for all faculty members, coordinators, and students. We actively apply the following accessibility controls:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Accessible Color Contrast</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Text and interactive controls meet or exceed the 4.5:1 contrast ratio requirement against background surfaces.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Keyboard Navigation</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                All interactive tables, dialogs, forms, and buttons are fully operable via standard keyboard Tab, Enter, and Space keys.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Form Field Associations</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Explicit &lt;label&gt; tags with matching `htmlFor` identifiers are bound to each form input for screen reader compatibility.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Non-Color-Dependent Indicators</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Status badges use explicit text descriptions and icons in addition to colors to assist users with color vision deficiencies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
