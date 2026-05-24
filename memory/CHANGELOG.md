## CHANGELOG — ESIC Recruit360

### 2026-02 · Iteration 3 — Blockchain Tx Toast, Super Admin CRUD, Interview Calendar
**Implemented**
- **Simulated Blockchain Transaction Toast** (`lib/blockchain.js` → `showTxToast`)
  - Renders a custom branded sonner toast on every approval / status change with tx hash, gas savings %, block #, and a clickable "View on ESIC Ledger" deep link.
  - Wired into `updateVacancyStatus`, `addVacancy`, `updateApplicationStatus`, `updateGrievanceStatus`, `updateOfferStatus`, and a new generic `commitOnChain({entity, action, performedBy, mutate})` used everywhere new state is created.
- **Super Admin** (`pages/SuperAdmin.jsx`) — fully rewritten to be functional:
  - Route-driven tabs (`/admin/:section`) — sidebar deep links now activate the correct tab and tab clicks update the URL.
  - **Workflows tab**: Create / Edit / Delete / View Details. Each step preview is shown with hash badges. Persisted to `db.workflows`.
  - **Roles tab**: Create / Configure role with permissions matrix (`view, create, approve, reject, publish, audit, export, configure`). Persisted to `db.roles`.
  - **Master Data tab**: 9 seeded categories. Click a card to open editor → add/remove values with on-chain commit per change. Persisted to `db.masterData`.
  - **Integrations tab**: Add Integration dialog. Test Connection flips status to Connected. Configure opens edit dialog.
  - All actions fire the tx toast via `commitOnChain`.
- **Interviews → Schedule Calendar + Approved Panelists tabs** (`pages/Interviews.jsx`)
  - 3-tab layout: Panels (existing grid), Schedule Calendar (7-day × 8-hour grid with deterministic panel placement, week navigation Prev/Today/Next), Approved Panelists (unique-panelist cards with session counts, weightage, Approved badge).
  - Each calendar event shows panel ID, vacancy name, panelist avatars, candidate count; click opens the scorecard dialog.
- **View Details modals added across the app**:
  - `pages/Results.jsx`: "View Details" → modal with rank table (up to 12 candidates), Verified-on-chain banner, Stat tiles, Export.
  - `pages/Advertisements.jsx`: Cards open `VacancyDetailDrawer` on click or via the new View Details button.
  - `pages/Reports.jsx`: Each report card has a View button → modal with dimensions chips, data-lineage signature, Schedule Daily action.
  - `components/shared/BlockchainTimeline.jsx`: Events on `/audit` are now clickable → detail dialog with full block metadata (Tx Hash, Block #, Performed by, Timestamp, Gas savings, Verified badge, Copy Hash action).

**Bug Fixes (caught by iteration-2 testing agent, resolved in iteration 3)**
- `pages/CandidatePortal.jsx` — Lodge Grievance now uses `commitOnChain` (was bypassing the central blockchain path).
- `components/vacancy/VacancyDetailDrawer.jsx` — `doApprove/doReject/doSendBack` close the Sheet before firing the tx toast, eliminating overlay-pointer interception.
- `components/ui/sonner.jsx` — Toaster `z-index: 9999` + `pointer-events-auto` so the "View on ESIC Ledger" link is always clickable above Radix overlays.

### 2026-02 · Iteration 2 — App Wiring & Candidate Portal
- Rewrote `App.js` with `BrowserRouter` + `StoreProvider` + `LanguageProvider` + `Toaster`; mounted `AppShell` layout across all routes with `RootRedirect` and 404 fallback.
- Created `pages/CandidatePortal.jsx` with 6 tabbed sections.
- i18n: routed remaining Dashboard hero/KpiCard strings through `t()` for EN/TA/HI.
- A11y: added `DialogDescription` to Grievances / MeritList / Interviews dialogs.

### 2026-02 · Iteration 1 — Foundation (handoff)
- ESIC design system (Gov Blue / ESIC Green / Digital Gold).
- i18n context (EN / TA / HI), mock store with localStorage hydration, ~3,000 seed records.
- 16 page scaffolds, AppShell + Sidebar + Topbar + drawers + shared components.

## Open Backlog
- **P2 polish**: Add `minHeight` on recharts `ResponsiveContainer` to silence width(-1) warnings.
- **P2 a11y**: Add `DialogDescription` to remaining DialogContent instances (vacancy confirm, results dialog, master-data dialog).
- **P3 UX**: Calendar drag-to-reschedule, panelist availability heatmap.
- **P3 UX**: Workflow visual editor (drag-drop step ordering).
- **Future**: Replace mock store with FastAPI + MongoDB backend.
