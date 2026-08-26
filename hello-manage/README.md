# Hello Manage — admin side

The management app for Hello Rent. It owns the **database** and serves the
**booking + admin API** that the public site consumes.

```
hello-manage/
├── backend/    Express + SQLite API (bookings, extras, admin auth)  ·  port 4000
└── frontend/   React + Vite admin dashboard (bookings, extras CRUD) ·  port 5174
```

Each half is its own package: `backend/` and `frontend/` carry their own
`package.json`, lockfile and `node_modules`, so an API dependency never reaches the
admin bundle and a React dependency never reaches the server. The root
`package.json` holds no dependencies of its own — only the scripts that drive both.
The public site lives separately in `../hello-web`.

## Run locally

From this `hello-manage/` folder:

```bash
npm install                # first time only — installs both halves
npm run dev                # both halves: API on :4000, admin UI on :5174

# or run them separately
npm run backend            # API only,      http://localhost:4000  (admin / 1234)
npm run frontend           # admin UI only, http://localhost:5174
```

Either half also runs on its own, from its own folder — `cd backend && npm install &&
npm run dev` needs nothing from the root.

And the public site, from `../hello-web`:

```bash
npm run dev                # public site on http://localhost:3000
```

The public site's `/api` calls and the admin UI's `/api` calls both proxy to the
backend on :4000, so everything shares one database and the extras you edit in the
admin appear instantly on the public booking page.

## Data flow

- Public booking page → `GET /api/extras` (active extras) and `POST /api/bookings`.
- Admin UI → `POST /api/admin/login`, then authenticated CRUD on
  `/api/admin/bookings` and `/api/admin/extras`.

Credentials and other settings live in `backend/.env` (see `backend/.env.example`).
The SQLite file is created at `backend/data/hellorent.db` on first run (gitignored).

## Production

- Backend: `npm install && npm start` in `backend/` (Node 24+). Put the DB file on a
  persistent disk via `DB_FILE`. If you build the admin UI (`npm run build:frontend`,
  or `npm run build` in `frontend/`), the backend serves it from `frontend/dist`.
- Public site: from `../hello-web` run `npm run build`, host the static `dist/`, and
  set `VITE_API_BASE` to the backend origin (allowed in `CORS_ORIGINS`).
