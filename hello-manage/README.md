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
`package.json` holds no application dependencies — only `concurrently`, which
runs both halves under a single `npm run dev`.
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

## The database

MongoDB, at `MONGODB_URI` (default `mongodb://127.0.0.1:27017`), database `MONGODB_DB`
(default `hellorent`). Collections: `bookings`, `bikes`, `units`, `owners`, `extras`,
`categories`, `transactions`. Each document is keyed by the record's own id.

**It has to be a replica set, even with one node.** Assigning a plate writes to the
booking and to the unit together, and MongoDB only offers a transaction on a replica
set — standalone, half of that could land and leave a machine rented to nobody. One
node is enough; this is not about redundancy.

Locally:

```bash
mongod --dbpath <path> --port 27017 --bind_ip 127.0.0.1 --replSet rs0
mongosh --eval 'rs.initiate()'   # once, ever
```

On Windows the installer sets up a service that runs standalone. To make it a replica
set, add to `C:\Program Files\MongoDB\Server\<version>\bin\mongod.cfg`:

```yaml
replication:
  replSetName: rs0
```

then restart the service (as administrator) and run `rs.initiate()` once.
Atlas is already a replica set, so a `mongodb+srv://` URI needs none of this.

### Coming from the SQLite build

```bash
npm run migrate:mongo            # from backend/data/hellorent.db
npm run migrate:mongo -- --force # replace collections that already hold data
```

It only reads the SQLite file and never deletes it — keep it until you are satisfied
the move worked. Columns that held JSON (a booking's extras and payments, a bike's
features) become real arrays, and the 0/1 integers become booleans.

## Production

- Backend: `npm install && npm start` in `backend/` (Node 24+). Point `MONGODB_URI` at
  the production database — Atlas, or a MongoDB on a persistent disk. If you build the
  admin UI (`npm run build:frontend`,
  or `npm run build` in `frontend/`), the backend serves it from `frontend/dist`.
- Public site: from `../hello-web` run `npm run build`, host the static `dist/`, and
  set `VITE_API_BASE` to the backend origin (allowed in `CORS_ORIGINS`).
