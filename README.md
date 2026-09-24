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
