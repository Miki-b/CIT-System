# CITSecure — Cash-in-Transit Delivery Tracking

A polished, working prototype of a **Cash-in-Transit (CIT) delivery tracking system**. A dispatcher creates and assigns deliveries, a driver progresses them through a secure workflow, and a client watches the consignment move **live** on a map — from pickup to drop-off — with no page refresh.

> Built for a short product demo. Prioritizes reliability, realistic workflows, and visual polish. GPS movement is **simulated server-side** so no phone or physical GPS is required.

---

## ✨ Features

- **Live tracking** — the client tracking page and admin views update in real time over **Server-Sent Events** (with an automatic polling fallback).
- **Server-side GPS simulation** — a "Start Live Delivery Simulation" button drives the driver marker along the route, advancing status, ETA, and the event timeline automatically, broadcasting to every connected screen.
- **Three role experiences**
  - **Dispatcher / Admin** — dashboard with live stats, deliveries table, create form, driver roster, live tracking board, and a full delivery detail/control screen.
  - **Driver** — a mobile-first app with the current assignment, a state-machine action button (Start Pickup → Confirm Pickup → Start Delivery → Arriving Soon → Mark Delivered), and GPS simulation.
  - **Client** — a public, polished tracking page reached via a tracking code (`/track/CIT-1001`). No login required.
- **Auto-generated tracking codes** (`CIT-1001`, `CIT-1002`, …) and shareable client tracking links with copy-to-clipboard.
- **Delivery timeline** — every milestone is recorded and rendered as a live-updating timeline.
- **Map with graceful fallback** — uses **Mapbox GL** when a token is provided; otherwise renders a built-in, animated SVG map so the live demo always works.
- **Controlled status model** — `CREATED → ASSIGNED → AT_PICKUP → PICKED_UP → IN_TRANSIT → NEAR_DESTINATION → DELIVERED`, each with distinct badges and colors.
- **Seeded demo data** — three deliveries ready to show, including one already in transit.

---

## 🧱 Tech Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Prisma ORM** + **SQLite** (zero-config; Postgres-portable — see below)
- **Server-Sent Events** for real-time updates (in-memory pub/sub, single process)
- **Mapbox GL** for maps (optional token; animated SVG fallback included)
- **Zod** for input validation
- **Lucide** icons

### Why SQLite for the prototype?
The brief calls for PostgreSQL, but a demo must "just work" after a clean install. SQLite requires **no running database server**, which makes the demo far more reliable. The schema is standard and **Postgres-portable**: change the `datasource` provider in `prisma/schema.prisma` to `postgresql`, point `DATABASE_URL` at your instance, and run `npx prisma db push`. (Enum-like fields are stored as strings and validated in `src/lib/domain.ts`, so they work identically on either database.)

---

## 🔐 Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
# SQLite (default — no setup required)
DATABASE_URL="file:./dev.db"

# Optional Mapbox public token (starts with pk.). Leave blank to use the
# built-in animated fallback map — the live demo works either way.
NEXT_PUBLIC_MAPBOX_TOKEN=
```

Get a free Mapbox token at <https://account.mapbox.com/access-tokens/> if you want real map tiles. **It is optional.**

---

## 🚀 Installation & Setup

Requires **Node 18+** (developed on Node 22).

```bash
# 1. Install dependencies
npm install

# 2. Create your env file
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env

# 3. Create the database schema and generate the Prisma client
npx prisma db push

# 4. Seed realistic demo data
npm run db:seed

# 5. Run the app
npm run dev
```

Open <http://localhost:3000>.

> **Shortcut:** `npm run setup` runs steps 3–4 (`prisma db push` + seed) in one go.
> **Reset demo data at any time:** `npm run db:reset`.

### Handy scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm run start` | Start the production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check (no emit) |
| `npm run db:push` | Apply the Prisma schema to the database |
| `npm run db:seed` | Seed demo data |
| `npm run db:reset` | Reset schema + re-seed |
| `npm run setup` | `db:push` + `db:seed` |

---

## 🎬 3-Minute Demo Flow

This is the flow the app is optimized for:

1. **Open the Dispatcher Dashboard** → <http://localhost:3000/admin>
   Live stats (active, in transit, awaiting pickup, completed, drivers available) and a "Live now" section.
2. **Open delivery CIT-1001** → <http://localhost:3000/admin/deliveries/CIT-1001>
   The map, route, driver position, ETA, and timeline appear. Copy the client tracking link here.
3. **In a second browser tab, open the client tracking page** → <http://localhost:3000/track/CIT-1001>
   This is the customer-facing screen: status rail, live map, ETA, "Last updated", timeline.
4. **On the delivery detail page, click "Start Live Delivery Simulation".**
5. **Watch both tabs update live, with no refresh:**
   - the driver marker glides along the route,
   - the ETA counts down,
   - the status advances (In Transit → Near Destination),
   - the timeline gains new events,
   - the client's status rail lights up step by step.
6. **The simulation completes automatically.** Status becomes **Delivered** and the client page shows **"Delivery completed successfully."**

> Prefer to drive it manually? Open the **Driver App** (<http://localhost:3000/driver>), step through the action buttons, and use **Simulate GPS Movement** — the admin and client views update the same way.

The landing page (<http://localhost:3000/>) has one-click buttons for all three roles.

---

## 🗺️ Routes

**Public**
- `/` — landing / role entry
- `/track/[code]` — client tracking page (e.g. `/track/CIT-1001`)

**Dispatcher / Admin**
- `/admin` — dashboard
- `/admin/deliveries` — deliveries list (filterable)
- `/admin/deliveries/new` — create delivery
- `/admin/deliveries/[code]` — delivery detail & controls
- `/admin/drivers` — driver roster
- `/admin/tracking` — live tracking board

**Driver**
- `/driver` — mobile driver app

**API**
- `GET /api/deliveries` · `POST /api/deliveries`
- `GET /api/deliveries/[code]`
- `POST /api/deliveries/[code]/action` — driver actions & driver assignment
- `POST /api/deliveries/[code]/simulate` — start/stop simulation
- `GET /api/deliveries/[code]/stream` — per-delivery SSE feed
- `GET /api/stream` — global SSE feed
- `GET /api/drivers` · `GET /api/clients`

---

## 🔑 "Credentials" / Access

There is **no login** for the prototype (by design). Choose a role from the landing page, or go straight to any route above. The client tracking page is intentionally public and reachable with only the tracking code.

Seeded demo deliveries:

| Code | Client | Status | Notes |
| --- | --- | --- | --- |
| **CIT-1001** | Acme Financial | IN_TRANSIT | Mid-route, primary demo delivery |
| **CIT-1002** | Global Retail Bank | ASSIGNED | Awaiting pickup |
| **CIT-1003** | United Cash Services | DELIVERED | Completed, full history |

Drivers: Daniel Bekele, Samuel Tesfaye, Michael Adams (+ two available). Clients: Acme Financial, Global Retail Bank, United Cash Services.

---

## 🗄️ Data Model (Prisma)

`User`, `Driver`, `Client`, `Delivery`, `DeliveryEvent` with proper relations and indexes (see `prisma/schema.prisma`). Delivery status, priority, roles, and event types are validated in `src/lib/domain.ts`.

## 🏗️ Architecture Notes

- **Real-time:** `src/lib/bus.ts` is an in-memory pub/sub. The SSE routes subscribe connections; `src/lib/deliveries.ts` broadcasts a full delivery snapshot on every change. Clients (`useDeliveryStream`, `useGlobalStream`) apply updates and fall back to 3s polling if the stream drops. Perfectly reliable for a single-process local demo.
- **Simulation:** `src/lib/simulation.ts` holds per-delivery interval timers on `globalThis`, advancing progress, interpolating GPS coordinates, updating the DB, and firing milestone/status events. It stops itself on delivery.

## ⚠️ Prototype Limitations

- **Not production-hardened:** no authentication/authorization, rate limiting, or multi-tenant isolation.
- **In-memory real-time & simulation** assume a single Node process — great locally, but would need Redis/a job runner to scale horizontally.
- **Straight-line routes:** the route/ETA are geometric interpolations, not real road routing or traffic-aware ETAs.
- **SQLite** by default (swap to Postgres as described above for production).
- Tuned for a punchy demo: a full simulated run takes ~40 seconds.
#   C I T - S y s t e m  
 