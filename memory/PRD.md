# ESIC Recruit360 — Product Requirements (PRD)

## Original Problem Statement

Build a **high-fidelity interactive enterprise prototype** for ESIC Recruit360 (Employees' State Insurance Corporation). The prototype must act like a working system featuring:

- Status changes and dynamic recruitment workflows
- Role-based navigation across 14+ ESIC personas
- Multilingual support (English, Tamil, Hindi) at runtime
- Detailed "View Details" side-panel drawers for decision makers
- Mock blockchain audit ledger (cryptographically signed events)
- Full recruitment lifecycle (vacancies → screening → DV → interviews → merit → results → offers → grievances)
- Super Admin configuration center
- Candidate self-service portal

Entirely **frontend mock-data driven** — no backend integration; all state lives in localStorage.

## User Personas / Roles

`candidate`, `recruitment_admin`, `estab_officer`, `dept_head`, `hr_officer`,
`reservation_officer`, `finance_officer`, `screening_officer`, `dv_officer`,
`interview_panel`, `grievance_officer`, `competent_authority`,
`regional_director`, `super_admin`

## Tech Stack

- React 19 SPA + react-router-dom v7
- Tailwind + shadcn/ui (radix primitives)
- lucide-react icons + recharts
- next-themes + sonner toasts
- State: React Context (`StoreProvider` in `src/lib/store.js`) hydrated from `localStorage`
- i18n: Context-based runtime translations in `src/i18n/`

## Architecture

```
/app/frontend/src/
├── App.js                          (BrowserRouter + AppShell route gate + 404)
├── index.css / tailwind.config.js  (ESIC HSL design tokens)
├── i18n/
│   ├── LanguageContext.js
│   └── translations.js             (EN / TA / HI)
├── lib/
│   ├── mockData.js                 (buildMockDb seed)
│   ├── store.js                    (StoreProvider, useStore, ROLES)
│   └── utils.js
├── components/
│   ├── layout/      (AppShell, Sidebar, Topbar)
│   ├── shared/      (Logo, StatusBadge, KpiCard, PageHeader, BlockchainTimeline, EmptyState)
│   ├── vacancy/     (VacancyDetailDrawer)
│   ├── candidate/   (CandidateDetailDrawer)
│   └── ui/          (shadcn primitives)
└── pages/
    ├── Login.jsx, Dashboard.jsx
    ├── Vacancies.jsx, VacancyCreate.jsx, Advertisements.jsx
    ├── Applications.jsx, Screening.jsx, DocumentVerification.jsx
    ├── Interviews.jsx, MeritList.jsx, Results.jsx, Offers.jsx
    ├── Grievances.jsx, AuditLedger.jsx, Reports.jsx
    ├── SuperAdmin.jsx
    └── CandidatePortal.jsx
```

## What's Implemented (Feb 2026)

### Foundation
- ESIC design system (Gov Blue / ESIC Green / Digital Gold HSL tokens) + Tailwind theme
- Multilingual context (EN / TA / HI) with `t()` helper
- Mock store with localStorage hydration; vacancies, candidates, applications, panels, grievances, merit list, offers, results, blockchain ledger (~3,000 records)

### Authentication & Layout
- Two-pane Login page with brand panel, language selector, role select, and 3 quick sign-in shortcuts
- AppShell with role-based Sidebar (Recruitment + Governance / Candidate Portal / Super Admin groups)
- Topbar with global search, language dropdown, theme toggle, notifications sheet, user menu (Reset Demo Data + Logout)

### Recruitment workflows (Admin)
- Dashboard: hero banner, 6 KPI cards, recruitment pipeline bar chart, applications-by-category pie, application trend area chart, recent vacancies, recent blockchain events
- Vacancies list + create form + VacancyDetailDrawer (4-stage approvals, blockchain hash, reservation matrix)
- Applications, Screening, Document Verification, Interviews pages with row-click → CandidateDetailDrawer
- Merit List with weighted scoring formula + ranking detail modal
- Results, Offers, Grievances with status workflows + audit log
- Audit Ledger page with hashed timeline
- Reports + Advertisements scaffolds

### Candidate Portal (NEW this session)
- Welcome banner with Aadhaar Verified badge
- 4-KPI overview (Active Applications, Profile Strength, Upcoming Tests, Results Awaited)
- "My Recruitment Journey" stage tracker (7-step progress for each application)
- Notifications panel + Quick Action grid + personal Blockchain audit timeline
- Tabbed sub-sections: Applications, Profile (education / experience / documents), Payments, Admit Cards, Grievances
- Lodge Grievance dialog that writes to the mock store + blockchain ledger

### Super Admin
- SuperAdmin.jsx scaffolded with configuration center

### Polish (this session)
- Dashboard, KpiCard hero & subtitle strings fully wired through `t()` for EN/TA/HI
- DialogDescription added to Grievances / MeritList / Interviews dialogs for a11y

## Verified Flows (testing_agent_v3_fork iteration 1)

100% pass rate across 22 verified flows including all 14 admin routes, 5 portal sub-routes, language switcher, drawers, dialogs, 404 fallback, and session persistence.

## Backlog / Future

- **P1 — Polish**: Add `minHeight` to ResponsiveContainer wrappers in Dashboard to silence recharts width(-1) warnings
- **P1 — A11y**: Add SheetDescription to Notifications sheet for accessibility
- **P2 — UX**: Expand candidate portal sub-views (application detail page, document upload mock, results+offers sub-tabs)
- **P2 — UX**: Wire VacancyCreate full form validation flow with toast confirmations
- **P2 — UX**: Make notifications dynamic per user role
- **P3 — Visual**: PDF-style offer letter preview, interview panel scheduling calendar
- **P3 — Visual**: Theme polish (dark mode passes for all pages)
- **Future**: Replace mock store with FastAPI backend + MongoDB once the prototype is approved

## Credentials

See `/app/memory/test_credentials.md`. Any username/role accepted; quick sign-in buttons cover the 3 primary personas.
