# PROJECT REPORT

# NMAMIT Mentor–Mentee Portal
### *A full-stack, institutional mentoring and proctor management platform for NMAM Institute of Technology, Nitte, ensuring scoped academic tracking, meeting documentation, tiered confidentiality, and actionable remediation.*

---

## 1. Introduction and Problem Statement

### 1.1 Background
NMAM Institute of Technology (NMAMIT), located at Nitte, Karkala Taluk, Udupi District, Karnataka, was established in 1986 and operates as a premier constituent engineering college of Nitte (Deemed to be University). Across its autonomous engineering curriculum and technical programmes (including Computer Science, Information Science, Electronics, and Mechanical Engineering), institutional accreditation standards (such as NBA and NAAC Criterion 2.2) mandate structured student mentoring, periodic academic progress appraisal, and targeted remediation.

Historically, student mentoring documentation in collegiate environments has been conducted through physical proctorial record books or decentralized, departmental spreadsheets. In this conventional paradigm, class proctors and faculty advisors collect mid-semester examination (MSE) marks, sessional scores, attendance percentages, and socio-academic counseling notes manually. These paper-based records remain physically siloed in departmental staff rooms, making it difficult for students to securely access agreed-upon action plans, while Head of Department (HOD) coordinators and institutional leaders lack real-time visibility into mentor workloads, unassigned mentees, or lagging intervention follow-ups.

### 1.2 Problem Statement
Engineering departments require a unified, secure, and role-governed digital workspace where students maintain their personal interests and self-appraisals, teachers mentor authorized cohorts, and academic leaders supervise mentoring compliance across all semesters without breaching student confidentiality. Three core architectural dilemmas emerge:
1. **Data Boundary Enforcement**: A teacher assigned to mentor a specific cohort in the Computer Science department must never possess the technical ability to view or tamper with records belonging to unassigned students or neighboring departments, preventing Insecure Direct Object Reference (IDOR) vulnerabilities.
2. **Tiered Counseling Sensitivity**: Academic records (such as MSE scores and remedial goals) should be fully visible to the student, whereas delicate psychiatric, personal, or disciplinal counseling notes must remain strictly confidential between authorized faculty and professional counseling cells.
3. **Academic Progression Preservation**: Students advance through semesters sequentially (from Semester 1 through Semester 8). Updating a student's current semester marks must not overwrite their previous sessional trajectory or cumulative GPA history.

### 1.3 Proposed Solution
The **NMAMIT Mentor–Mentee Portal** is an institutional web platform architected with Next.js 16 (App Router), TypeScript, Prisma ORM 7, Better-SQLite3 (with PostgreSQL compatibility), and Tailwind CSS. The platform implements a verified dual-mentoring institutional model:
- **Class Proctor System**: Assigned at the section level (e.g., 4-CSE-A) to monitor general attendance, MSE-1 thresholds, and semester examination eligibility.
- **Faculty Advisor System**: Assigned on an individual basis to students with qualifying admission criteria (e.g., PCM < 65% in 12th/PUC), lateral entry candidates, or students flagged as slow learners post-MSE-1.

The platform delivers four distinct, authenticated role scopes (Institution Administrator, Department Coordinator / HOD, Teacher / Mentor, and Student / Mentee), secured by server-side JSON Web Token (JWT) sessions stored in `HttpOnly` cookies, salted bcrypt password hashing, and parameterized database queries.

---

## 2. Aims and Scope

### 2.1 Objectives
The primary engineering and operational objectives of the system are as follows:
1. **Demographic & Academic Progression Tracking**: Allow authorized teachers to record and track student University Seat Numbers (USNs), departments, programs, admission batches, current semesters, SGPA histories, and MSE marks without data duplication.
2. **Scoped Mentee Management**: Provide teachers with an authorized mentee directory, preventing unauthorized access to external students through strict server-side scoping.
3. **Conflict-Free Meeting Scheduling**: Enable mentors and students to schedule one-to-one and group mentoring sessions with automatic overlap detection computed against institutional standard time (`Asia/Kolkata`).
4. **Tiered Notes & Actionable Remediation**: Implement three explicit visibility tiers for meeting minutes (`STUDENT_VISIBLE`, `MENTOR_ONLY`, and `RESTRICTED_COUNSELLING`) paired with goal tracking for academic support needs.
5. **Departmental & Administrative Oversight**: Provide HODs with real-time operational reports (unassigned students, mentor workload distributions, and attendance shortages below 75%) alongside an immutable audit trail.
6. **Public Faculty Verification Staging**: Establish an administrative review queue where scraped or imported public faculty profiles are vetted before authentication credentials can be provisioned.

### 2.2 Scope
The portal covers the complete operational lifecycle from student registration and bulk CSV import through mentor allocation, session scheduling, attendance documentation, remedial action tracking, and institutional reporting. In accordance with strict ethical and data privacy principles, personal phone numbers, home addresses, caste, religion, and financial histories are deliberately excluded from general collection unless sanctioned by institutional policy.

---

## 3. System Architecture and Technology Stack

### 3.1 Architectural Overview
The NMAMIT Portal is designed as a modern, decoupled full-stack architecture running on Next.js 16 with React 19, TypeScript, and Prisma ORM 7. Every client interaction is authenticated through cryptographic JSON Web Tokens signed with HMAC-SHA256 and transmitted exclusively via encrypted, `HttpOnly`, `SameSite=Lax` session cookies. The frontend leverages Tailwind CSS for accessible, responsive user interfaces conforming to WCAG 2.1 AA contrast standards.

### 3.2 Technology Stack Justification
- **Frontend Framework**: Next.js 16 (App Router) with React 19 and TypeScript, enabling unified server-side rendering, dynamic route handling, and strict compile-time type safety.
- **Database & ORM**: Prisma ORM 7 with `@prisma/adapter-better-sqlite3` in development and full PostgreSQL migration readiness for production enterprise clustering.
- **Styling & Design System**: Tailwind CSS utilizing NMAMIT institutional color tokens: Deep Burgundy / Crimson (`#800020`), Oxford Navy (`#0F2A4A`), and clean slate neutrals.
- **Cryptography & Authentication**: `jose` library for lightweight AES/JWT verification; `bcryptjs` for salted one-way password hashing (10 salt rounds).
- **Data Ingestion**: `PapaParse` for streamed, client-side CSV parsing paired with server-side Zod validation schemas for atomic transactional batch commits.

### 3.3 Core Architectural Design Decisions
1. **Prisma 7 Driver Adapter Pattern**: Prisma 7 mandates explicit driver adapters for relational engines. The application initializes a dedicated Better-SQLite3 adapter with WAL (Write-Ahead-Log) pragma mode enabled, guaranteeing high concurrency and sub-millisecond query latency.
2. **Decoupling Faculty Profiles from Login Identities**: A publicly listed professor (e.g., Dr. Niranjan N. Chiplunkar or Dr. Raju K) exists in the database as an academic faculty entity with official source URLs and verification dates. An active `User` authentication identity is provisioned only after an administrator completes manual verification.
3. **Student Entity vs. Progression History**: Student identity (USN, Name, Admission Batch) is modeled separately from `StudentProgression` records. As a mentee transitions from Semester 3 to Semester 4, new progression tuples are appended, preserving historical SGPA and MSE records.
4. **Institutional Timezone Enforcement**: All meeting schedules and audit logs are normalized in UTC in the database and explicitly rendered in `Asia/Kolkata` (IST, UTC+05:30), preventing time-shift discrepancies during semester scheduling.

---

## 4. Database Design

### 4.1 Relational Schema & Entity Specifications
The persistence layer comprises 18 normalized relational models, linked with strict foreign key constraints, composite unique indexes, and cascade protections:

| Entity Model | Primary Keys & Constraints | Functional Scope & Responsibility |
| :--- | :--- | :--- |
| **User** | `id` (cuid), `email` (unique) | Authentication identity, bcrypt hash, role (`ADMIN`, `HOD`, `TEACHER`, `STUDENT`), `isActive` flag |
| **Department** | `id`, `code` (unique: CSE, ISE, etc.) | Academic departments of NMAMIT Nitte, building location, HOD attribution |
| **FacultyProfile** | `id`, `employeeId` (unique), `deptId` | Staged or verified faculty records, designation, source URL, verification status |
| **StudentProfile** | `id`, `institutionalId` / USN (unique) | Core student identity, USN (e.g., `4NM23CS042`), batch, section, enrollment status |
| **StudentProgression** | `id`, `studentId` + `semester` (unique) | Historical academic trajectory, semester number, SGPA, CGPA, MSE marks, attendance % |
| **MentorAssignment** | `id`, `studentId` + `mentorId` + `active` | Mentoring allocations, assignment type (`CLASS_PROCTOR` vs `FACULTY_ADVISOR`), capacity limits, reasons |
| **Meeting** | `id`, `organizerId`, `startTime`, `endTime` | Scheduled mentoring sessions, meeting mode, `Asia/Kolkata` timezone conflict locks |
| **MeetingParticipant** | `id`, `meetingId` + `studentId` (unique) | Mentee attendance status (`PRESENT`, `ABSENT`, `EXCUSED`), student self-appraisal feedback |
| **MeetingNote** | `id`, `meetingId`, `authorId` | Tiered documentation: `STUDENT_VISIBLE`, `MENTOR_ONLY`, `RESTRICTED_COUNSELLING` |
| **ActionItem** | `id`, `studentId`, `mentorId` | Remedial academic and behavioral goals, priority, due date, completion status |
| **AppointmentRequest**| `id`, `studentId`, `mentorId` | Student-initiated meeting requests, proposed time slot, approval/rejection status |
| **AuditEvent** | `id`, `actorId`, `action`, `timestamp` | Immutable security audit log, resource type, IP address, forensic diff payload |
| **InstitutionalSetting**| `id`, `key` (unique), `value` | Configurable policies: max mentee capacity (default: 25), MSE remedial trigger threshold |

### 4.2 Profile Lifecycle & Historical Reassignment
When a student is reassigned from one mentor to another (due to faculty sabbatical, department transfer, or specialized counseling escalation), the active `MentorAssignment` record is not deleted or overwritten. Instead, the current assignment is flagged as `TRANSFERRED`, an end date is stamped, a mandatory institutional justification is recorded, and a new assignment tuple is created. This ensures historical traceability for accreditation audits.

---

## 5. Authentication, Authorization and Security

### 5.1 Sign-in Architecture & Session Management
Self-registration is intentionally disabled for institutional security; real student and teacher accounts are provisioned exclusively through authorized administrator workflows or departmental bulk CSV ingestion. Authentication adheres to the following sequence:
1. The client posts credentials to `/api/auth/login`, where email and password strings are sanitized.
2. A sliding-window in-memory rate limiter verifies that the requesting client IP has not exceeded 10 failed login attempts within 60 seconds.
3. The user record is retrieved, and `bcrypt.compare()` evaluates the candidate password against the salted cryptographic hash.
4. Upon verification, a stateless JWT is minted containing the user ID, role, department scope, and session expiry (7 days).
5. The JWT is embedded in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie (`nmamit_session`), shielding the session token from client-side JavaScript execution and cross-site scripting (XSS) vectors.

### 5.2 Data-Level Access Control & IDOR Defense
To eliminate Insecure Direct Object Reference (IDOR) vulnerabilities, role validation is enforced on the server for every single API route using dedicated predicate helpers in `src/lib/rbac.ts`:
- `canAccessStudent(user, studentProfile)`: Evaluates whether the caller is a global Administrator, an HOD matching the student's department, or a Teacher actively assigned to that student. Any unauthorized query returns an immediate HTTP 403 Forbidden.
- `canAddStudentInDepartment(user, deptId)`: Prevents teachers from adding students to departments outside their authorized jurisdiction.
- `canViewNote(user, note)`: Enforces confidentiality tiers. A note marked `MENTOR_ONLY` is filtered out from student responses; a note marked `RESTRICTED_COUNSELLING` is hidden from students, HODs, and general faculty alike.

### 5.3 Additional Defensive Controls
- **CSV Formula Injection Mitigation**: During CSV exports, cells beginning with `=`, `+`, `-`, or `@` are sanitized to prevent spreadsheet formula execution upon opening in Microsoft Excel.
- **Input Validation & Length Bounds**: All incoming JSON payloads pass through Zod schemas that validate regex patterns (e.g., USN format `4NM[0-9]{2}[A-Z]{2}[0-9]{3}`) and enforce strict string length boundaries.
- **Immutable Audit Trail**: Sensitive actions (student creation, bulk CSV imports, mentor allocations, note revisions) generate structured `AuditEvent` records storing the actor ID, client IP address, and resource metadata.

---

## 6. Traits by Role

### 6.1 Student / Mentee
- **Dashboard Overview**: Personalized greeting, USN badge, current semester, assigned Class Proctor and Faculty Advisor cards, cumulative attendance %, and latest MSE averages.
- **Profile Dossier**: Comprehensive view of academic progression across all completed semesters (SGPA, MSE-1 scores, attendance records) alongside career aspirations.
- **Shared Notes & Action Items**: Real-time display of actionable follow-up items assigned by the mentor, including deadline badges and completion checkboxes.
- **Appointment Booking**: Interactive booking modal allowing students to request guidance sessions by selecting from available mentor time slots.

### 6.2 Teacher / Mentor
- **Scoped Directory**: Directory of explicitly assigned mentees with instant search, semester filters, and remedial risk indicators (MSE < 50% or Attendance < 75%).
- **Student Creation & Bulk Import**: Form to register individual students within authorized department batches, plus a CSV bulk import engine with validation dry-runs.
- **Meeting Scheduler & Attendance**: Meeting organizer supporting one-to-one or group sessions with automatic conflict checking and attendance tracking.
- **Tiered Note Formulation**: Session note recorder featuring locked visibility options (`Student-Visible`, `Mentor-Only`, or `Restricted Counseling`).

### 6.3 Department Coordinator / HOD
- **Departmental Overview**: Aggregated metrics across the entire department, including total enrolled students, allocated mentees, and unassigned student alerts.
- **Mentor Allocation Matrix**: Interface to assign Class Proctors and Faculty Advisors to students individually or in section-wide batches, enforcing a 25-mentee capacity limit.
- **Operational Compliance**: Department-level completion reports indicating mentoring meeting frequencies and MSE remedial intervention progress.

### 6.4 Institution Administrator
- **Public Faculty Staging Review**: Administrative staging area displaying public faculty records scraped from official NMAMIT sources, requiring verification before account provisioning.
- **Global System Policies**: Dynamic configuration interface to calibrate institutional thresholds (max mentor capacity, remedial triggers, and terminology).
- **Forensic Audit Viewer**: Searchable, filterable security log recording all administrative modifications, authentication attempts, and data exports.

---

## 7. REST API Reference

All application endpoints are served under `/api`, requiring valid Bearer/HttpOnly session credentials unless noted as public:

| Method & Endpoint | Authorized Roles | Request Payload / Parameters | Response Description |
| :--- | :--- | :--- | :--- |
| `POST /api/auth/login` | Public | `{ email, password }` | 200 OK + Set-Cookie (JWT session) |
| `POST /api/auth/logout` | Any Signed-In | None | 200 OK + Expire session cookie |
| `GET /api/auth/me` | Any Signed-In | None | 200 OK + User profile & role scope |
| `GET /api/students` | Admin, HOD, Teacher | Query: `?dept=&search=&page=` | 200 OK + Scoped student list |
| `POST /api/students` | Admin, HOD, Teacher | `{ institutionalId, fullName, deptId... }` | 201 Created + Student profile |
| `POST /api/students/import` | Admin, HOD, Teacher | Multipart CSV file + commit flag | 200 OK + Validation preview or commit count |
| `GET /api/students/[id]` | Scoped / Self | URL Param: `studentId` | 200 OK + Dossier & progression history |
| `POST /api/mentors/assign` | Admin, HOD | `{ studentIds, mentorId, assignmentType }` | 200 OK + Allocation audit log |
| `GET /api/meetings` | Any Signed-In | Query: `?status=&startDate=` | 200 OK + Scoped meeting calendar |
| `POST /api/meetings` | Admin, HOD, Teacher | `{ title, startTime, endTime, participants... }` | 201 Created (Conflict checked) |
| `POST /api/meetings/[id]` | Assigned Organizer | `{ attendance: [...], notes: [...] }` | 200 OK + Attendance & tiered notes |
| `GET /api/reports` | Admin, HOD | Query: `?deptId=&type=unassigned` | 200 OK + Operational metric reports |
| `GET /api/faculty/staging` | Admin, HOD | Query: `?status=PENDING` | 200 OK + Unverified faculty staging list |
| `POST /api/faculty/staging` | Admin | `{ facultyId, action: 'APPROVE' \| 'REJECT' }` | 200 OK + Profile activation |
| `GET /api/audit-logs` | Admin Only | Query: `?limit=100&action=` | 200 OK + Forensic audit log records |

---

## 8. Application Walkthrough

The running application was evaluated across all authenticated scopes using pre-seeded test data and synthetic student records:

### 8.1 Authentication & Role Switching
The sign-in interface at `/login` allows credentials-based authentication and features an institutional role indicator. For rapid demonstration and audit verification, a global **Demo Role Switcher** bar allows one-click switching between Institution Administrator, Department HOD, Class Proctor / Mentor, and Student personas without compromising server-side cookie security.

### 8.2 Student / Mentee Dossier & Academic Progress
Navigating to `/students/[id]` displays the student dossier. The profile highlights the student's official USN (`4NM23CS042`), department, enrolled semester, and academic progression history. An interactive marks chart illustrates semester-wise SGPA and MSE scores, while the action items tab displays current remedial targets set by their mentor.

### 8.3 Teacher Dashboard & Scoped Mentee Directory
The mentor dashboard at `/dashboard` displays assigned mentee counts, upcoming counseling sessions, and attendance shortage alerts (<75%). The mentees directory at `/students` filters records strictly by assigned proctor relationship, shielding external student records.

### 8.4 Meeting Management, Attendance & Tiered Notes
The meeting session view at `/meetings/[id]` enables the organizer to record attendance status (`Present`, `Absent`, `Excused`) and log session notes. Each note requires an explicit visibility selection (`Student-Visible`, `Mentor-Only`, or `Restricted Counseling`). The interface clearly displays a visual security badge confirming note visibility before saving.

### 8.5 HOD Mentor Allocation & Workload Tracking
The allocation interface at `/mentors` provides a real-time matrix of mentor workloads. If a faculty member reaches the configured 25-mentee limit, the allocation dropdown warns the HOD to prevent faculty burnout. Reassignment requires a mandatory reason, ensuring complete institutional audit compliance.

### 8.6 Administrative Faculty Staging & Audit Inspection
The administrative portal at `/faculty-directory` presents staged faculty records scraped from official NMAMIT department portals. The administrator can verify source URLs and qualifications before approving records for account creation. The audit viewer at `/audit-logs` displays real-time security events.

---

## 9. Role Permissions Compared

The comparative matrix below outlines access boundaries enforced across server-side handlers:

| Functional Scope | Administrator | Department HOD | Teacher / Mentor | Student / Mentee |
| :--- | :---: | :---: | :---: | :---: |
| **System Configuration & Policy Limits** | Full Control | Denied | Denied | Denied |
| **Faculty Staging Approval** | Full Control | View Only | Denied | Denied |
| **Student Creation (Single & Bulk CSV)** | Global Scope | Assigned Department | Assigned Department | Denied |
| **Mentor Allocation & Reassignment** | Global Scope | Assigned Department | Denied | Denied |
| **View Student Dossier** | All Students | Assigned Department | Assigned Mentees Only | Self Record Only |
| **Schedule Mentoring Sessions** | All Meetings | Assigned Department | Assigned Mentees Only | Request Booking |
| **Student-Visible Notes** | Full Access | Full Access | Full Access | Visible (Own Records) |
| **Mentor-Only Private Notes** | Full Access | Assigned Department | Assigned Mentor Only | Strictly Shielded |
| **Restricted Counseling Notes** | Counselling Officer | Strictly Shielded | Author Mentor Only | Strictly Shielded |
| **Forensic Security Audit Logs** | Full Access | Denied | Denied | Denied |

---

## 10. Rollout and Configuration

### 10.1 Local Environment Deployment
To run the application locally on a developer workstation or intranet server:
1. Install Node.js (version 18, 20, or later) and ensure npm is available.
2. Extract the workspace and run `npm install` to install dependencies.
3. Synchronize the database schema with `npx prisma db push`.
4. Seed verified institutional departments, staged faculty, and test accounts: `npx tsx prisma/seed.ts`.
5. Execute the automated test suite to verify security guards: `npx tsx tests/security_and_acceptance.test.ts`.
6. Start the development server using `npm run dev` or build the optimized bundle using `npm run build` followed by `npm run start`.
7. Access the application at `http://localhost:3000`.

### 10.2 Enterprise Production Deployment
For multi-server or cloud deployment (e.g., Docker, AWS ECS, or institutional data center servers):
- **Database Migration**: Update `prisma/schema.prisma` to use the PostgreSQL provider (`provider = "postgresql"`), configure `DATABASE_URL` to target the institutional PostgreSQL cluster, and run `npx prisma migrate deploy`.
- **Environment Security**: Supply a cryptographically secure 256-bit secret for `JWT_SECRET` (generated via `openssl rand -base64 32`). Ensure `NEXT_PUBLIC_APP_URL` is set to the HTTPS production domain.
- **Reverse Proxy Configuration**: Place the Next.js service behind Nginx or Cloudflare with SSL/TLS certificates configured, HTTP/2 enabled, and strict security headers (`HSTS`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).

### 10.3 Pre-Live Checklist
1. **Enforce HTTPS**: Ensure all session cookies have the `Secure` flag active.
2. **Rotate Credentials**: Change default seed passwords before opening the portal to real campus users.
3. **Scheduled Backups**: Schedule daily Write-Ahead-Log (WAL) snapshots for SQLite or automated `pg_dump` cron jobs for PostgreSQL.

---

## 11. Verification and Shortcomings

### 11.1 Automated Test Execution Summary
A rigorous automated test suite (`tests/security_and_acceptance.test.ts`) was developed and executed to validate core security and operational criteria. All 15 automated test cases passed successfully:

| Test Identifier | Security & Acceptance Condition | Observed Result |
| :--- | :--- | :--- |
| **TEST-01** | Teacher creates student within authorized CSE department | **PASSED**: Student `4NM23CS901` created with assigned scope |
| **TEST-02** | Teacher blocked from adding student to unauthorized ISE department | **PASSED**: HTTP 403 Forbidden correctly returned |
| **TEST-03** | Duplicate institutional identifier (USN `4NM23CS042`) rejected | **PASSED**: Prisma unique constraint rejected duplicate |
| **TEST-04** | Row-level import validation errors formatted with row numbers | **PASSED**: Actionable errors reported without crashing |
| **TEST-05** | Retrying import does not create duplicate student profiles | **PASSED**: Idempotent upsert logic verified |
| **TEST-06** | Student data isolation: student can access only own record | **PASSED**: Cross-student profile access blocked |
| **TEST-07** | IDOR guard: mentor cannot access unassigned student dossier | **PASSED**: Unassigned access attempt rejected with 403 |
| **TEST-08** | Department Coordinator isolation: CSE HOD denied ISE student records | **PASSED**: Scoped query boundaries strictly enforced |
| **TEST-09** | Tiered note privacy: private and restricted notes hidden from students | **PASSED**: Confidential counseling notes shielded |
| **TEST-10** | Reassignment preserves history with previous mentor and reason | **PASSED**: Historical record retained with `TRANSFERRED` status |
| **TEST-11** | Deactivated user guard: user marked inactive rejected at login | **PASSED**: Session authentication rejected |
| **TEST-12** | Timezone conflict detection: overlapping slots detected in Asia/Kolkata | **PASSED**: Overlapping session creation blocked |
| **TEST-13** | CSV export boundaries strictly match on-screen RBAC permissions | **PASSED**: Data export restricted to authorized department |
| **TEST-14** | Semester progression: advancing student preserves historical SGPA | **PASSED**: Previous semester data retained intact |
| **TEST-15** | Cryptographic storage: passwords verified as salted bcrypt hashes | **PASSED**: No plaintext credentials present in database |

### 11.2 Shortcomings and Future Work
An honest technical review of the current implementation highlights areas for future expansion:
1. **Institutional Single Sign-On (SSO)**: The current implementation utilizes secure Jose JWT cookie sessions. Future phases should integrate directly with NMAMIT's campus Microsoft 365 Entra ID or Google Workspace SAML/OAuth endpoints once official institutional client IDs are provisioned.
2. **SMS / Push Notifications**: Meeting reminders are currently logged as internal portal notifications. Direct SMS alerts via the institutional DLT gateway were deferred to avoid transmitting confidential academic details over unencrypted channels.
3. **Specialized Counseling Cell Escalation**: While the database schema supports the `RESTRICTED_COUNSELLING` visibility tier, automatic escalation to NMAMIT's dedicated student counseling cell requires institutional policy approval regarding medical confidentiality boundaries.

---

## 12. Conclusion

The **NMAMIT Mentor–Mentee Portal** successfully replaces decentralized paper proctorial registers with a unified, role-governed digital workspace. By implementing strict server-side scoping, institutional proctor and advisor workflows, tiered note confidentiality, conflict-free meeting scheduling, and persistent academic progression tracking, the application satisfies accreditation documentation requirements (NBA / NAAC) while upholding student privacy.

The engineering approach demonstrates that secure role-based access control must be verified at two levels: the user's institutional role and the specific mentor-mentee relationship. The completion of all 15 automated test cases, paired with clean production compilation across all 34 routes, provides a validated foundation for institutional deployment.

---

## 13. Disclosure of AI Assistance

In adherence to academic integrity and ethical engineering guidelines, artificial intelligence tools were utilized during the conception, implementation, and documentation of this project:
- **Gemini / Antigravity Assistant**: Used for architectural design structuring, Next.js 16 app router configuration, Prisma schema normalization, and drafting comprehensive automated test cases.
- **Human Engineering Oversight**: All institutional research facts (NMAMIT leadership, departments, verified faculty profiles, and student mentoring policies) were manually validated against official `nitte.edu.in` institutional sources. All cryptographic authentication flows, RBAC predicate logic, and database migrations were reviewed and verified through live command execution.

---

## 14. References

1. Nitte (Deemed to be University) & NMAMIT Official Portal: https://nitte.edu.in/nmamit/
2. NMAMIT Student Mentoring Guidance: https://nitte.edu.in/nmamit/student-mentoring.php
3. Next.js Documentation (App Router & Route Handlers): https://nextjs.org/docs
4. Prisma ORM Documentation (Prisma 7 Driver Adapters): https://www.prisma.io/docs/
5. Jones, M., Bradley, J., and Sakimura, N. *"JSON Web Token (JWT)"*, RFC 7519, IETF, 2015. https://www.rfc-editor.org/rfc/rfc7519
6. Provos, N., and Mazières, D. *"A Future-Adaptable Password Scheme"*, USENIX Annual Technical Conference, 1999.
7. OWASP Foundation. *"OWASP Top 10: Broken Object Level Authorization (BOLA/IDOR)"*. https://owasp.org/
8. World Wide Web Consortium (W3C). *"Web Content Accessibility Guidelines (WCAG) 2.1"*. https://www.w3.org/TR/WCAG21/

---

## 15. Academic Integrity Statement

> *"I declare that I have personally implemented, tested, and understood the submitted NMAMIT Mentor–Mentee Portal project. I have disclosed the AI tools and technical resources utilized during development. I can independently explain the authentication logic, database relational models, server-side role-based access control, and automated test execution results. I have not submitted unacknowledged third-party code as my own, and all institutional facts have been verified against official sources."*

| Field | Detail |
| :--- | :--- |
| **Student Name** |Karthik V|
| **University Seat Number (USN)** | NNM23IS086 |
| **Institutional Branch** | Department of Information Science & Engineering |
| **Institution** | NMAM Institute of Technology, Nitte |
| **Date of Submission** | October 28, 2026 |
| **Digital Signature** | Karthik V |
