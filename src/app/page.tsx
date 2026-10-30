import Link from "next/link";
import {
  Users,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Shield,
  ArrowRight,
  BookOpen,
  Award,
  Clock,
  Sparkles,
  Building,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function HomePage() {
  const departments = [
    { code: "CSE", name: "Computer Science & Engineering", intake: 360, accredited: true },
    { code: "ISE", name: "Information Science & Engineering", intake: 180, accredited: true },
    { code: "ECE", name: "Electronics & Communication Engineering", intake: 180, accredited: true },
    { code: "AI&DS", name: "Artificial Intelligence & Data Science", intake: 120, accredited: false },
    { code: "AI&ML", name: "Artificial Intelligence & Machine Learning", intake: 60, accredited: false },
    { code: "CCE", name: "Computer & Communication Engineering", intake: 60, accredited: false },
    { code: "CS-CY", name: "CSE (Cyber Security)", intake: 60, accredited: false },
    { code: "EEE", name: "Electrical & Electronics Engineering", intake: 60, accredited: true },
    { code: "MECH", name: "Mechanical Engineering", intake: 60, accredited: true },
    { code: "CIVIL", name: "Civil Engineering", intake: 60, accredited: true },
    { code: "BT", name: "Biotechnology", intake: 60, accredited: true },
    { code: "RAI", name: "Robotics & Artificial Intelligence", intake: 60, accredited: false },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden institutional-gradient text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-700/60 text-rose-200 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                Constituent College of Nitte (Deemed to be University)
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                NMAMIT Mentor–Mentee <span className="text-rose-400">Portal</span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                An institutional mentoring and student monitoring platform for{" "}
                <span className="text-white font-medium">NMAM Institute of Technology, Nitte</span>.
                Empowering authorized teachers to track academic performance, schedule proctor meetings,
                document tiered notes, and remediate slow learners.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/login?mode=signin"
                  className="px-6 py-3 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-semibold text-sm shadow-lg shadow-rose-950/50 flex items-center gap-2 transition"
                >
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login?mode=register"
                  className="px-5 py-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-sm shadow-lg flex items-center gap-2 transition"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Create Student Account</span>
                </Link>

                <Link
                  href="/mentoring-guide"
                  className="px-6 py-3 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center gap-2 transition"
                >
                  <BookOpen className="w-4 h-4 text-rose-400" />
                  <span>Institutional Mentoring Guide</span>
                </Link>

                <Link
                  href="/faculty-directory"
                  className="px-6 py-3 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center gap-2 transition"
                >
                  <Users className="w-4 h-4 text-rose-400" />
                  <span>Faculty Directory</span>
                </Link>
              </div>

              {/* Verified Institutional Quick Badges */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-xs text-slate-300">
                <div>
                  <div className="text-lg font-bold text-white">1986</div>
                  <div className="text-slate-400 text-[11px]">Year of Establishment</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-rose-300">14 B.Tech</div>
                  <div className="text-slate-400 text-[11px]">Approved Disciplines</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald-400">Tier-I NBA</div>
                  <div className="text-slate-400 text-[11px]">7 Programs Accredited</div>
                </div>
              </div>
            </div>

            {/* Right Card: Institutional Role & Access Scopes */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-5 text-slate-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-rose-400" />
                    Role-Based Access Governance
                  </h2>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                    Strict RBAC
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-purple-900/80 text-purple-200 flex items-center justify-center shrink-0 font-bold">
                      A
                    </div>
                    <div>
                      <div className="font-semibold text-white">Institution Administrator</div>
                      <p className="text-slate-400 text-[11px]">
                        Review staged faculty imports, approve accounts, audit logs, and configure proctor limits.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-blue-900/80 text-blue-200 flex items-center justify-center shrink-0 font-bold">
                      H
                    </div>
                    <div>
                      <div className="font-semibold text-white">Department Coordinator / HoD</div>
                      <p className="text-slate-400 text-[11px]">
                        Oversees department mentees, assigns mentors by batch/section, views department completion.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-emerald-900/80 text-emerald-200 flex items-center justify-center shrink-0 font-bold">
                      T
                    </div>
                    <div>
                      <div className="font-semibold text-white">Teacher / Proctor / Faculty Advisor</div>
                      <p className="text-slate-400 text-[11px]">
                        Adds students within assigned scope, schedules meetings, records tiered notes, tracks action items.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-amber-900/80 text-amber-200 flex items-center justify-center shrink-0 font-bold">
                      S
                    </div>
                    <div>
                      <div className="font-semibold text-white">Student / Mentee</div>
                      <p className="text-slate-400 text-[11px]">
                        Accesses only their own records, views assigned mentors, books appointments, tracks agreed goals.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 italic pt-2">
                  * Note: Insecure Direct Object References (IDOR) are strictly blocked on all API endpoints.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Mentoring Architecture (Published NMAMIT Policy) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold tracking-wider uppercase text-rose-800">
              Published Mentoring Guidance
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              NMAMIT Dual Mentoring & Proctor Framework
            </h2>
            <p className="text-slate-600 text-sm">
              Extracted directly from official student mentoring documentation at{" "}
              <a
                href="https://nitte.edu.in/nmamit/student-mentoring.php"
                target="_blank"
                rel="noreferrer"
                className="text-rose-800 underline font-medium"
              >
                nitte.edu.in/nmamit/student-mentoring.php
              </a>
              . Roles are distinct and configurable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Box 1: Class Proctor System */}
            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50 shadow-sm space-y-4 hover:border-rose-300 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 text-base">The Proctor System</h3>
                  <span className="text-xs text-rose-800 font-medium">Class Group Monitoring</span>
                </div>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                For monitoring students in groups, two faculty members are assigned the responsibility of monitoring each class section. They systematically track student attendance, sessional examination results, laboratory tasks, and overall academic activities.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Two faculty members assigned per class section (e.g., CSE 5-A).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Routine monitoring of attendance and Mid-Sem Examination performance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Configurable capacity ceiling (default: 25 students per proctor).</span>
                </li>
              </ul>
            </div>

            {/* Box 2: Faculty Advisor Scheme */}
            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50 shadow-sm space-y-4 hover:border-rose-300 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 text-base">Faculty Advisor Scheme</h3>
                  <span className="text-xs text-blue-800 font-medium">Individual Academic Intervention</span>
                </div>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                At the beginning of the first semester, students identified as academically vulnerable on the basis of PUC/12th PCM percentage (or NRI admissions &lt;65% in PCM) are allotted dedicated Faculty Advisors to guide their transition and course performance.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Allotted to students with &lt;65% PCM or entry backlogs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Post MSE-1 targeted meetings with slow learners to identify challenges.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Coordinates remedial classes in historically challenging subjects.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Key Cadence Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
            <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
                <Clock className="w-4 h-4" />
                <span>Attendance Shortage Audits</span>
              </div>
              <p className="text-slate-600 text-xs">
                Attendance details collected at regular intervals. Students with &lt;75% attendance are individually counselled for remedial action.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
                <FileText className="w-4 h-4" />
                <span>Biannual Parent Reports</span>
              </div>
              <p className="text-slate-600 text-xs">
                Progress reports sent twice each semester to parents, accompanied by scheduled semester parent-teacher meetings.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
                <Shield className="w-4 h-4" />
                <span>Tiered Note Confidentiality</span>
              </div>
              <p className="text-slate-600 text-xs">
                Meeting records partition student-visible summaries from private mentor notes and restricted counselling notes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Academic Departments */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-rose-800">
                Institutional Directory
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Approved Academic Departments
              </h2>
              <p className="text-slate-600 text-xs">
                14 undergraduate engineering disciplines verified from official NMAMIT accreditation records.
              </p>
            </div>
            <Link
              href="/faculty-directory"
              className="text-xs font-semibold text-rose-800 hover:text-rose-900 flex items-center gap-1 shrink-0"
            >
              <span>View Verified Faculty Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.code}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-rose-300 transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    {dept.code}
                  </span>
                  {dept.accredited ? (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-200 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      NBA Tier-I
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      Approved
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-xs text-slate-900 line-clamp-1">{dept.name}</h3>
                <div className="text-[11px] text-slate-500">Intake: {dept.intake} seats</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fast CTA */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 institutional-gradient text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to access your mentoring portal?</h2>
          <p className="text-slate-300 text-sm">
            Sign in with your verified institutional email or test with pre-seeded demonstration credentials from the top bar.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/login?mode=signin"
              className="px-6 py-3 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-semibold text-sm shadow-lg transition"
            >
              Sign In to Your Account
            </Link>
            <Link
              href="/login?mode=register"
              className="px-6 py-3 rounded-lg bg-white hover:bg-slate-100 text-rose-950 font-semibold text-sm shadow-lg transition flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-rose-900" />
              <span>Create Student Account</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
