import Link from "next/link";
import { Mail, Phone, MapPin, Building2, ArrowLeft, ExternalLink } from "lucide-react";

export default function ContactPage() {
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
        <div className="border-b border-slate-100 pb-4 space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Support & Directory Contacts
          </h1>
          <p className="text-xs text-slate-500">
            Official communication channels for NMAM Institute of Technology, Nitte.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-rose-800" />
              <span>Campus Postal Address</span>
            </h2>
            <address className="not-italic leading-relaxed text-slate-600 text-xs">
              <strong>NMAM Institute of Technology</strong><br />
              Nitte, Karkala Taluk,<br />
              Udupi District - 574110<br />
              Karnataka, India
            </address>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-rose-800" />
              <span>Direct Telephones</span>
            </h2>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div><strong>PBX:</strong> +91-8258-281263 / 281264 / 281248</div>
              <div><strong>Extensions:</strong> 281461 / 281462 / 281463 / 281349</div>
              <div><strong>Principal's Secretariat:</strong> +91-8258-281039</div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-rose-800" />
              <span>Electronic Mail</span>
            </h2>
            <div className="space-y-1 text-xs text-slate-600">
              <div>
                <strong>Principal:</strong>{" "}
                <a href="mailto:principal_nmamit@nitte.edu.in" className="text-rose-800 hover:underline">
                  principal_nmamit@nitte.edu.in
                </a>
              </div>
              <div>
                <strong>Admissions & General:</strong>{" "}
                <a href="mailto:info@nitte.edu.in" className="text-rose-800 hover:underline">
                  info@nitte.edu.in
                </a>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-800" />
              <span>Location & Connectivity</span>
            </h2>
            <p className="leading-relaxed text-slate-600 text-[11px]">
              Located in Nitte over a 125-acre campus in the Western Ghats. Mangaluru International Airport is 45 km away; railway hubs at Udupi (40 km) and Mangaluru (50 km).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
