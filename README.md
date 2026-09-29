# TASKLY — Prototype

A mobile-first academic workspace for Senior High School teachers, built for a school
research/project proposal. TASKLY centralizes tasks, submissions, announcements,
calendar, classes, resources, and notes — without becoming a grading system or a
full school management platform.

## Stack
React 18 + TypeScript + Tailwind CSS + Lucide icons, bundled with Vite. No backend,
no auth, no real network calls — everything runs on local mock data.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (defaults to http://localhost:5173). Layout is tuned
for a ~390px mobile viewport but degrades gracefully to tablet/desktop.

## Information architecture

Five primary areas, reachable from the bottom nav:

- **Home** — "what needs attention right now": My Day, pending submissions, upcoming
  events, recent announcements, global search entry point
- **Work** — Tasks and Submissions as one section (segmented control), with
  Announcements one tap away
- **Classes** — class list → class detail with Overview / Students / Tasks / Activity
- **Calendar** — one calendar for manually-added events *and* every task's deadline
  (tasks appear automatically — nothing to sync manually)
- **More** — Resources, Notes, Templates, Reports, Notifications, Archive, Settings

A single global "+" button (bottom-right, on every top-level tab) opens **Create New**
— Task / Announcement / Event / Resource / Note — instead of scattering "Add" buttons
across the app.

## Project structure

```
src/
  types.ts                Shared TypeScript types
  data/mockData.ts          All mock/demo data (classes, students, tasks, templates...)
  state/store.ts             Central app state hook (useAppState) — the ONLY place
                              that touches raw data arrays. Every page reads/writes
                              through this. This is the seam for:
                                1. swapping useState for a persisted local store
                                   (offline-first)
                                2. swapping mock mutations for real Supabase calls
                                   (online sync)
  utils/taskStatus.ts        Derives live task status (Upcoming/Ongoing/Overdue) from
                              the deadline, so Home/Work/Calendar/Notifications never
                              disagree about what's overdue
  utils/search.ts             Global search across tasks/classes/students/
                              announcements/resources/calendar/notes
  utils/date.ts                Lightweight date formatting (no external deps)
  components/                Shared UI primitives (Card, badges, Sheet, BottomNav,
                              TopBar, SegmentedControl, the global QuickAction FAB,
                              and CreateSheets.tsx — the create/edit forms shared by
                              the FAB, Work, Templates, etc.)
  pages/                     One file per screen
```

## What's connected (not just built once and left standalone)

- Creating a task with a deadline **automatically appears on the Calendar** —
  calendar events are computed from live tasks, not duplicated data.
- A task's status (Upcoming/Ongoing/Overdue) is **derived from today's date**, not
  hand-set, so Home's "My Day", Work's filters, and Calendar always agree.
- Archiving a task removes it from every normal view but keeps it in Archive and
  still searchable from Home's global search.
- Templates apply directly into the same Create Task / Create Announcement forms
  used everywhere else — "choose → edit → save" is one flow, not a separate editor.

## Notes for going further (offline-first / Supabase)

- `state/store.ts` is intentionally the only file with raw `useState` arrays. To add
  persistence, replace those with a local store (e.g. IndexedDB) and keep the same
  function signatures (`addTask`, `updateTask`, `toggleTaskComplete`, ...) — no page
  component would need to change.
- To add real sync, those same functions become the place to queue local writes and
  reconcile with Supabase when a connection is available.
- Grade computation is intentionally out of scope per the project brief.

## Reset demo data

More → Settings (gear icon) → **Reset Demo Data** restores the original seeded
dataset at any time — useful between usability-testing sessions.

## Recently completed

- **Submissions are now generated on task creation** — the "New Task" form has a
  "Track student submissions" checkbox; when on, a Pending entry is created for
  every student in that class, so Work → Submissions actually has something to
  show for tasks you create yourself (previously this only worked for the seeded
  demo tasks). Toggle it on later from Task Details if you skipped it at creation.
- **Add / Edit / Delete Class** — Classes → "+" to add a section; a class's "..."
  menu to rename it or delete it (blocked with a message if it still has tasks
  assigned, so you don't lose task data silently).
- **Add / Remove students** — from a class's Students tab. Removing a student also
  cleans up their submission records on any tracked tasks.
- **Real multi-file attachments** on tasks — attach one or more files either by
  picking from the Resource Library or typing a name, with removable chips
  instead of a single fake text field.
- **Global search now opens every result** — Announcements, Resources, Calendar,
  and Notes results now navigate to their section (previously only Tasks,
  Classes, and Students did anything when tapped).

## Phase 1 — Roles, login, and admin-authored announcements

This is the foundation for TASKLY's three-role structure (Teacher / SHS Head /
System Admin). It is genuinely a **mock login** — see `state/store.ts` and
`utils/permissions.ts` for exactly what that does and doesn't guarantee.

- **Demo login** (`pages/Login.tsx`) — three demo accounts (Teacher, SHS Head,
  System Admin), plus a manual email field that matches those same demo emails.
  No real authentication, no password check, no server session.
- **Teacher app** is unchanged in spirit, with one deliberate removal:
  teachers can no longer create announcements. They can only view them
  (`pages/Announcements.tsx`, now read-only) and see the most urgent one as a
  banner at the top of Home.
- **SHS Head shell** (`pages/AdminHome.tsx`, `pages/AdminAnnouncements.tsx`) —
  a separate, monitoring-styled interface (not the Teacher's bottom-nav
  shell). Announcement management (create/edit/delete/pin/schedule/expire,
  audience targeting, priority) is fully working. Teacher directory, class
  monitoring, and admin reports are previewed on the dashboard as clearly
  locked "coming soon" cards — not faked.
- **System Admin shell** (`pages/SystemAdminHome.tsx`) — a read-only preview
  of the demo accounts, with the same "coming soon" pattern for account/role
  management. Scoped for a later phase since it doesn't block teacher or SHS
  Head usability testing.
- **Route guard** (`utils/permissions.ts`) — stops a logged-in user from
  reaching another role's pages through the app's own navigation. Read the
  caveat at the top of that file: this is an in-browser check on a prototype
  with no backend, not real server-side authorization.

**Not yet built** (next up, per the phasing plan): SHS Head's teacher
directory/profiles, class monitoring, check-in/attendance flow, admin
reports; the AI Teaching Assistant UI; Classroom Mini-Games; and System
Admin's actual account/role management.

## Phase 2 — SHS Head monitoring

The SHS Head now has a real monitoring workspace (tab strip: Overview ·
Teachers · Classes · Reports · Announcements, plus an Alerts bell).

- **Overview** — teacher counts by status, today's classes with check-in
  status, monitoring alerts, and summary task counts.
- **Teachers** — searchable/filterable/sortable directory; each profile has
  Overview / Classes / Tasks / Check-ins / Activity. Profiles expose class
  lists, task titles + status, and check-ins only. **Private teacher notes are
  never part of that data path.**
- **Classes** — today's sessions across all teachers, filterable by teacher,
  time, and status. A "Requires Verification" session can be confirmed held or
  marked not recorded.
- **Reports** — Teacher Activity, Class Monitoring, and Task Overview tables.
- **Alerts** — derived from check-in data; they clear when a check-in is
  recorded or verified.
- **Teacher check-in** — teachers see "Today's Classes" on Home with a
  **Start Class** button. It records a check-in time the SHS Head sees.

**Attendance logic:** a class that wasn't started is shown as *Attendance Not
Recorded* — never "absent". The system records what happened; it doesn't
conclude why something didn't.

**How the data fits together:** the demo Teacher account is "live" — its
classes, tasks, and Start Class button are the real app state, so what the
SHS Head sees for that teacher is the same data. The other four teachers are
static snapshots (there's no login for them). Reports are a single snapshot
for today; date-range filtering needs a real database.

**Bug caught by testing:** class times were sorted as text, which put
"10:00 AM" before "8:00 AM". Fixed with a shared `byTime` helper.

**Still not built:** AI Teaching Assistant, Classroom Mini-Games, and System
Admin account/role management (all shown as "coming soon", not faked).
