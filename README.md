# Zealthy Mini-EMR & Patient Portal

A full-stack web application built as part of the Zealthy engineering assessment. The app is split into two sections — a provider-facing admin EMR and a patient-facing portal — both backed by the same database and authentication layer.

---

## Live Demo

> **Patient Portal:** https://your-app.vercel.app

**Test credentials:**

| Name | Email | Password |
|------|-------|----------|
| Mark Johnson | mark@some-email-provider.net | Password123! |
| Lisa Smith | lisa@some-email-provider.net | Password123! |

---

## Assessment Checklist

| Requirement | Status |
|-------------|--------|
| Clean UI | ✅ |
| Good code structure | ✅ |
| Proper database design | ✅ |
| Thoughtful features (recurring appointments) | ✅ |
| Patient Portal at `/` with login | ✅ |
| Admin EMR at `/admin` (no auth required) | ✅ |
| Patient CRUD | ✅ |
| Appointment CRUD with recurrence + end date | ✅ |
| Prescription CRUD | ✅ |
| Portal: 7-day summary dashboard | ✅ |
| Portal: 3-month appointment schedule | ✅ |
| Portal: 3-month refill schedule | ✅ |
| Seeded from provided JSON data | ✅ |
| Deployed live | ✅ |

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 15 (App Router) | Single repo for frontend + API routes |
| Language | TypeScript | Type safety across the whole stack |
| Database | Turso (LibSQL) via `@libsql/client` | Serverless SQLite, works on all platforms |
| Auth | JWT in httpOnly cookie (`jose`) | Stateless, XSS-safe session management |
| Passwords | `bcryptjs` | Industry-standard hashing, pure JS |
| Date logic | `date-fns` | Lightweight date utilities |
| Styling | Tailwind CSS + inline styles | Utility-first with custom Zealthy brand palette |

---

## UI

The UI was designed by referencing the live [Zealthy website](https://getzealthy.com) to extract the brand color palette — specifically the signature greens and teals used across their product. These were mapped into CSS variables and used consistently across both the EMR and patient portal:
```css
--green:       #2D9B6F   /* primary brand green */
--green-dark:  #1F7A54   /* hover states */
--green-light: #E8F7F1   /* backgrounds, badges */
--teal:        #1AACA8   /* gradients, highlights */
--navy:        #1A2B3C   /* headings, primary text */
```

AI assistance was used for portions of the styling to push the creative quality further — particularly around card compositions, gradient effects on the login page, and the table design system. The goal was to make it feel like a real health product, not a generic CRUD app.

Typography uses **Playfair Display** for headings paired with **DM Sans** for body text, both loaded from Google Fonts.

---

## Code Structure
```
zealthy-emr/
├── scripts/
│   └── seed.js                          # DB seeder
├── src/
│   ├── middleware.ts                     # Edge-level auth guard for /portal routes
│   ├── app/
│   │   ├── layout.tsx                   # Root HTML shell
│   │   ├── page.tsx                     # Patient login (/)
│   │   ├── globals.css                  # Brand palette + base styles
│   │   ├── admin/
│   │   │   ├── layout.tsx               # Admin shell with nav
│   │   │   ├── page.tsx                 # Patient registry table + create
│   │   │   └── patients/[id]/
│   │   │       └── page.tsx             # Patient detail + CRUD
│   │   ├── portal/
│   │   │   ├── layout.tsx               # Wraps PortalAuthGuard
│   │   │   ├── page.tsx                 # Dashboard (7-day summary)
│   │   │   ├── appointments/
│   │   │   │   └── page.tsx             # Full 3-month schedule
│   │   │   └── medications/
│   │   │       └── page.tsx             # Full 3-month refill schedule
│   │   └── api/                         # REST API — server-side only
│   │       ├── auth/login/route.ts
│   │       ├── auth/logout/route.ts
│   │       ├── auth/me/route.ts
│   │       ├── patients/route.ts
│   │       ├── patients/[id]/route.ts
│   │       ├── patients/[id]/appointments/route.ts
│   │       ├── patients/[id]/appointments/[apptId]/route.ts
│   │       ├── patients/[id]/prescriptions/route.ts
│   │       ├── patients/[id]/prescriptions/[rxId]/route.ts
│   │       ├── medications/route.ts
│   │       └── portal/summary/route.ts
│   ├── components/
│   │   ├── AdminNav.tsx
│   │   ├── PortalNav.tsx
│   │   ├── PortalAuthGuard.tsx
│   │   ├── Modal.tsx
│   │   └── ConfirmDialog.tsx
│   └── lib/
│       ├── db.ts                        # DB client singleton + schema init
│       ├── auth.ts                      # JWT sign, verify, session helper
│       └── schedule.ts                  # Recurring date expansion engine
├── .env.local                           # JWT_SECRET + Turso credentials (never committed)
├── next.config.js
├── tailwind.config.js
└── package.json
```

The API follows standard REST conventions. Business logic lives in `src/lib/` — the recurring schedule engine, auth utilities, and DB connection are all isolated there.

Authentication is handled at two levels — Next.js middleware runs at the edge and redirects unauthenticated requests to `/portal/*`, and the API routes independently verify the session cookie.

### Logging

logs are placed at the most important points across the API layer using level prefixes
DEBUG logs are only meaningful in development — they trace data fetching calls per user and help identify slow or repeated queries. 
WARN logs capture validation failures and bad login attempts. ERROR logs capture unexpected DB failures. 
INFO logs mark successful state changes worth auditing.



---

## Proper Database Design
```
┌─────────────────────────────────────────────────────┐
│                      users                          │
├────────────┬──────────────┬─────────────────────────┤
│ id         │ INTEGER      │ PK, AUTOINCREMENT        │
│ name       │ TEXT         │ NOT NULL                 │
│ email      │ TEXT         │ UNIQUE, NOT NULL         │
│ password   │ TEXT         │ NOT NULL (bcrypt hashed) │
│ phone      │ TEXT         │ nullable                 │
│ dob        │ TEXT         │ nullable                 │
│ address    │ TEXT         │ nullable                 │
│ created_at │ TEXT         │ DEFAULT datetime('now')  │
└────────────┴──────────────┴─────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                   appointments                      │
├────────────┬──────────────┬─────────────────────────┤
│ id         │ INTEGER      │ PK, AUTOINCREMENT        │
│ user_id    │ INTEGER      │ FK → users(id) CASCADE   │
│ provider   │ TEXT         │ NOT NULL                 │
│ datetime   │ TEXT         │ NOT NULL (ISO 8601)      │
│ repeat     │ TEXT         │ none/daily/weekly/monthly│
│ end_date   │ TEXT         │ nullable                 │
│ created_at │ TEXT         │ DEFAULT datetime('now')  │
└────────────┴──────────────┴─────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                   prescriptions                     │
├──────────────────┬───────────┬──────────────────────┤
│ id               │ INTEGER   │ PK, AUTOINCREMENT     │
│ user_id          │ INTEGER   │ FK → users(id) CASCADE│
│ medication       │ TEXT      │ NOT NULL              │
│ dosage           │ TEXT      │ NOT NULL              │
│ quantity         │ INTEGER   │ NOT NULL, DEFAULT 1   │
│ refill_on        │ TEXT      │ NOT NULL (YYYY-MM-DD) │
│ refill_schedule  │ TEXT      │ daily/weekly/monthly  │
│ created_at       │ TEXT      │ DEFAULT datetime('now')│
└──────────────────┴───────────┴──────────────────────┘

┌─────────────────────────────────────────────────────┐
│                    medications                      │
├────────────┬──────────────┬─────────────────────────┤
│ id         │ INTEGER      │ PK, AUTOINCREMENT        │
│ name       │ TEXT         │ UNIQUE, NOT NULL         │
└────────────┴──────────────┴─────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                      dosages                        │
├────────────┬──────────────┬─────────────────────────┤
│ id         │ INTEGER      │ PK, AUTOINCREMENT        │
│ value      │ TEXT         │ UNIQUE, NOT NULL         │
└────────────┴──────────────┴─────────────────────────┘
```

**Key design decisions:**
- Passwords are bcrypt hashed — never stored plain
- `ON DELETE CASCADE` on foreign keys — deleting a patient cleans up all their data
- Reference tables for medications and dosages — seeded from the provided JSON
- No pre-computed recurrence rows — the schedule engine expands dates at query time

### Clean Commit History
The project was built with a deliberate 5-commit structure to maintain a clean and readable git history:

---

## Thoughtful Features — Recurring Appointments

The recurring schedule engine (`src/lib/schedule.ts`) takes a start date and repeat pattern and expands it into actual dates without storing pre-computed rows. It respects the `end_date` field to stop recurrence when needed.

- Portal dashboard shows **next 7 days** summary
- Portal drill-down expands **full 3 months** of occurrences
- Same engine handles both appointments AND prescription refill schedules
- Admin end date field only appears when a repeat pattern is selected

---

## Local Setup
```bash
npm install
npm run seed
npm run dev
```

- Patient Portal → http://localhost:3000
- Admin EMR → http://localhost:3000/admin

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | ✅ Yes | Signs session tokens |
| `DATABASE_URL` | ✅ Yes | Turso database URL (`libsql://...`) |
| `DATABASE_AUTH_TOKEN` | ✅ Yes | Turso auth token |