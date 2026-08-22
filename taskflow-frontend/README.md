# TaskFlow UI

Frontend for TaskFlow — a clean, modern task management application. Built with **React 19 + Vite + Tailwind CSS v4** and designed to be connected to an existing **FastAPI** backend.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build
npm run lint       # oxlint
```

### Demo account

The app ships with a seeded demo account (23 sample tasks, stored in `localStorage`):

```
demo@taskflow.app / demo1234
```

You can also register a fresh account — new accounts start with zero tasks, which shows the empty state.

## Connecting the FastAPI backend

The app runs against an in-memory mock API by default so the whole UI can be reviewed without a server.

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_USE_MOCK` | `"true"` | Set to `"false"` to call the real backend |
| `VITE_API_BASE_URL` | `http://localhost:8000` | FastAPI base URL |

```bash
# .env.local
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8000
```

The API contract the frontend expects is documented in the module headers of `src/api/*.js`:

- `auth.js` — `POST /auth/login`, `POST /auth/register`, `GET /users/me`
- `tasks.js` — `GET /tasks` (query params: `search`, `status`, `priority`, `due`, `sort`, `page`, `page_size`), `POST /tasks`, `GET/PUT/DELETE /tasks/:id`
- `user.js` — `PUT /users/me/password`, `DELETE /users/me`

`LIST /tasks` returns `{ items, total, page, page_size }`; task fields are `{ id, title, description, status, priority, due_date, created_at, updated_at }` with `status ∈ todo|in_progress|done` and `priority ∈ low|medium|high`. The mock in `src/api/mock.js` implements this exact contract, so it doubles as a reference implementation. If your FastAPI schema differs, adjust field names in the api modules only — the screens consume only what the api modules return.

Token handling: the response of login/register must include `access_token`; it is stored and attached as `Authorization: Bearer <token>`.

## Design system

### Colors
- **Primary** — Indigo (`brand-50…900`, core `#4f46e5`): buttons, links, active states, logo.
- **Surface** — white cards on `slate-50` app background; `slate-200` borders; `slate-900` headings / `slate-500` secondary text.
- **Status** — To Do `slate`, In Progress `sky`, Done `emerald`.
- **Priority** — Low `slate`, Medium `amber`, High `red`.
- **Feedback** — success `emerald`, error `red`, info `sky`. Destructive actions are always `red`.

All tokens live in the `@theme` block of `src/index.css` (Tailwind v4 CSS-first config).

### Typography
- **Inter** (Google Fonts, weights 400–800), loaded in `index.html`.
- Headings: `font-extrabold` with tight tracking; body `text-sm`/`text-base`; secondary/labels `text-sm text-slate-500`.

### Core components (`src/components/ui`)
| Component | Purpose |
| --- | --- |
| `Button` | Variants: primary, secondary, ghost, danger, dangerSecondary; sizes sm/md/lg; built-in loading spinner |
| `FormControls` | `Input`, `Textarea`, `Select` with label + inline validation error + `aria-invalid` |
| `Modal` | Bottom-sheet on mobile, centered dialog on desktop; Esc + backdrop close |
| `ConfirmDialog` | Destructive confirmation with loading state and optional gating (e.g. typed `DELETE`) |
| `ToastContext` | Success/error/info notifications, top-right, auto-dismiss |
| `EmptyState` | Reusable empty state with icon, title, message, action |
| `Feedback` | `ErrorBanner` (form-level) and `ErrorState` (screen-level with Retry) |
| `Badge` | Status + priority pills |

### Global UI states
- **Loading** — skeleton cards with shimmer while fetching; spinner in buttons; small spinner in the search box.
- **Empty** — "No tasks yet" (with create CTA) vs "No matching tasks" (with clear search & filters) — distinguished so the user always knows what to do next.
- **Error** — screen-level error panel with Retry; form-level error banner; per-field validation.
- **Success/error notifications** — toasts.

## Screens

### Login / Register
Centered auth cards with the TaskFlow logo. Login: email-or-username + password, show-password toggle, server error banner, "Use demo account" helper. Register: name, email, password (min 8), confirm-password with match validation, duplicate-email error from the server. Both link to the other.

### Tasks (main screen)
- **Navbar** — logo, Tasks link, New Task button, avatar → profile/log-out menu.
- **Toolbar** — debounced search (300 ms, results update as you type, spinner while fetching), **Filters** popover (status/priority/due-date; **Apply filters** and **Clear filters** actions; active-count badge), sort dropdown (newest, oldest, due date, priority, title), one-tap clear.
- **Grid** — task tiles adapt to width: `grid-cols-1 / sm:2 / xl:3 / 2xl:4`. Each tile shows title, description excerpt, status + priority badges, due date (red when overdue) and an edit shortcut; clicking opens task details.
- **Pagination** — 12 per page, prev/next + page numbers, "Showing X–Y of Z".
- Search works **within** filtered results.

### Create / Edit task
Modal with title (required), description, status, priority, due date. Cancel + Create/Save with per-field validation; server errors surface in the modal.

### Task details (`/tasks/:id`)
Back navigation, full information not shown on the tile (description, created, last updated, task ID), Edit action (opens the same form modal) and Delete (confirm dialog → toast → back to list).

### Profile
- Account card with avatar, name, email, member-since.
- **Change password** — current + new + confirm with validation.
- **Delete account** — clearly separated red "danger zone"; confirmation dialog requires typing `DELETE` and is the only entry point to the destructive `confirmDisabled` state.

## Responsive behavior
- **Mobile**: filters become a bottom sheet; modals fill the width; the search input spans the full toolbar width; navbar keeps logo + New Task + avatar (name hidden); pagination collapses to Prev/Next + compact numbers; task grid is single column.
- **Tablet**: 2-column grid, toolbar wraps.
- **Desktop**: filters popover under the Filters button; pagination shows full page range; 3–4 column grid.

## Project structure

```
src/
├── api/          # HTTP client, api modules (auth/tasks/user), mock backend
├── components/
│   ├── layout/   # Navbar, app shell with protected routes
│   ├── tasks/    # TaskCard, TaskFormModal, FilterPanel, Pagination
│   └── ui/       # Design-system primitives
├── context/      # AuthContext, ToastContext
├── lib/          # constants (status/priority meta), utils
└── pages/        # Login, Register, Tasks, TaskDetails, Profile
```