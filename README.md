# NMAMIT Mentor–Mentee Portal
> **NMAM Institute of Technology, Nitte**  
> Constituent College of Nitte (Deemed to be University)

A full-stack institutional student mentoring and proctor management platform engineered to support:
- **Class Proctor System**: Assigned per class section for attendance monitoring, MSE-1 thresholds, and semester examination eligibility.
- **Faculty Advisor System**: Assigned individually to qualifying admissions (PCM < 65% in 12th/PUC) and slow learners requiring remedial tutoring.
- **Server-Side Role Scoping (RBAC)**: Enforcing strict data boundaries for Administrators, Department HoDs, Teachers/Mentors, and Students with zero IDOR exposure.
- **Tiered Session Notes**: Explicit confidentiality levels (`STUDENT_VISIBLE`, `MENTOR_ONLY`, `RESTRICTED_COUNSELLING`).
- **Conflict-Free Meeting Scheduling**: Timezone-aware scheduling (`Asia/Kolkata`) with automatic collision detection.
- **Academic Progression History**: Multi-semester trajectory tracking (SGPA, CGPA, MSE marks) that preserves past records upon semester advancement.
- **Verified Public Faculty Directory**: Scraped and staged faculty records decoupled from active login accounts until administrator review.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19, TypeScript)
- **Database & ORM**: Prisma ORM 7 with `@prisma/adapter-better-sqlite3` (SQLite dev / PostgreSQL prod ready)
- **Styling**: Tailwind CSS conforming to WCAG 2.1 AA accessibility and NMAMIT institutional colors
- **Security & Auth**: Stateless Jose JWT sessions in `HttpOnly`, `SameSite=Lax`, `Secure` cookies with bcrypt password hashing
- **Data Ingestion**: PapaParse CSV ingestion with Zod server validation schemas and transaction rollbacks

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+ (Tested on Node.js 25.x)
- npm 9+ or 11+

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Karthikv2310/Mentor-and-Mentiee.git
cd Mentor-and-Mentiee

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Database Initialization & Seeding
```bash
# Push schema migrations
npx prisma db push

# Seed institutional departments, verified faculty profiles, and demo users
npx tsx prisma/seed.ts
```

### 5. Automated Tests
Run the automated test suite verifying all 15 security and acceptance requirements:
```bash
npx tsx tests/security_and_acceptance.test.ts
```

### 6. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Pre-Seeded Demonstration Personas

All accounts use the password: `NMAMIT@Demo2026!`

| Role | Email Identifier | Assigned Scope |
| :--- | :--- | :--- |
| **Institution Administrator** | `admin@nmamit.nitte.edu.in` | Global (All departments, staging review, audit logs) |
| **Department Coordinator / HoD** | `hod.cse@nmamit.nitte.edu.in` | Dept. of Computer Science & Engineering |
| **Teacher / Class Proctor** | `mentor@nmamit.nitte.edu.in` | Section 4-CSE-A Mentees |
| **Student / Mentee** | `student@nmamit.nitte.edu.in` | USN `4NM23CS042` (Sem 4, CSE) |

*(Note: The global header includes a 1-click **Demo Role Switcher** for rapid testing during evaluation).*

---

## Automated Acceptance Criteria (15/15 Passed)

- [x] **TEST-01**: Teacher adds authorized student within assigned department
- [x] **TEST-02**: Department boundary enforcement (Teacher cannot add outside assigned department)
- [x] **TEST-03**: Unique institutional ID constraint (Duplicate USN rejected)
- [x] **TEST-04**: Row-level import validation errors with line reporting
- [x] **TEST-05**: Bulk import idempotency & deduplication on retry
- [x] **TEST-06**: Student data isolation (Student sees only own record)
- [x] **TEST-07**: Mentor IDOR protection (Mentor cannot access unassigned student)
- [x] **TEST-08**: Department Coordinator scoped isolation (HoD denied external departments)
- [x] **TEST-09**: Tiered note privacy (`MENTOR_ONLY` and `RESTRICTED_COUNSELLING` shielded)
- [x] **TEST-10**: Mentor reassignment preserves historical records and transfer justification
- [x] **TEST-11**: Deactivated user guard rejects inactive accounts at login
- [x] **TEST-12**: Meeting scheduling conflict detection in `Asia/Kolkata`
- [x] **TEST-13**: Scoped report exports match on-screen RBAC boundaries
- [x] **TEST-14**: Semester progression preserves past SGPA trajectory upon advancement
- [x] **TEST-15**: Cryptographic storage verification (Bcrypt salted hashes, no plaintext)

---

## Project Documentation

- **Full Project Report (Word Document)**: `NMAMIT_Mentor_Mentee_Portal_Project_Report.docx`
- **Full Project Report (Markdown)**: `NMAMIT_Mentor_Mentee_Portal_Project_Report.md`
- **Institutional Research Register**: `.system_generated/institutional_research_summary.md`
- **Architecture & Security Specification**: `.system_generated/architecture_and_security_spec.md`

---

## License & Institutional Disclaimer

This project is an institutional engineering prototype developed for NMAM Institute of Technology, Nitte. Not officially endorsed or deployed by Nitte (Deemed to be University) unless certified by documentary authorization.
