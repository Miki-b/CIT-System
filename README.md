# CITSecure — Cash-in-Transit Delivery Tracking

A polished, working prototype of a **Cash-in-Transit (CIT) delivery tracking system**.

CITSecure demonstrates a complete delivery workflow where a **dispatcher creates and assigns deliveries**, a **driver progresses them through a controlled workflow**, and a **client tracks the consignment live on a map** — from pickup to drop-off — without refreshing the page.

> **Prototype:** Built for a short product demo with a strong focus on reliability, realistic workflows, and visual polish. GPS movement is **simulated server-side**, so no physical GPS device or mobile hardware is required.

---

## ✨ Features

### Live Delivery Tracking

* Real-time updates using **Server-Sent Events (SSE)**
* Automatic **3-second polling fallback** if the stream disconnects
* Live driver position updates
* Live delivery status updates
* Live ETA updates
* Real-time delivery timeline

### Server-Side GPS Simulation

A delivery can be started using **Start Live Delivery Simulation**.

The server automatically:

* Moves the driver marker along the route
* Updates GPS coordinates
* Updates the estimated arrival time
* Advances delivery statuses
* Adds timeline events
* Broadcasts changes to all connected clients
* Automatically stops when the delivery reaches `DELIVERED`

### Three Role Experiences

#### Dispatcher / Admin

The admin experience includes:

* Dashboard with live delivery statistics
* Deliveries table
* Delivery creation form
* Driver roster
* Live tracking board
* Delivery detail and control screen
* Client tracking link generation
* Live map and driver position

#### Driver

A mobile-first driver application with:

* Current delivery assignment
* Delivery information
* Controlled state-machine workflow
* GPS simulation
* Delivery action controls

Driver actions:

```text
Start Pickup
    ↓
Confirm Pickup
    ↓
Start Delivery
    ↓
Arriving Soon
    ↓
Mark Delivered
```

#### Client

A public tracking page accessible using a tracking code:

```text
/track/CIT-1001
```

No login is required.

The client can view:

* Current delivery status
* Live map
* Driver position
* ETA
* Last updated time
* Delivery timeline
* Completion confirmation

### Tracking Codes

Tracking codes are generated automatically:

```text
CIT-1001
CIT-1002
CIT-1003
...
```

Each delivery can also generate a shareable client tracking URL with **copy-to-clipboard** support.

### Delivery Timeline

Every important delivery milestone is recorded as an event and displayed in a live-updating timeline.

### Map with Graceful Fallback

CITSecure supports:

* **Mapbox GL** when a Mapbox token is configured
* A built-in **animated SVG map fallback** when no token is provided

This ensures the demo remains functional even without external map configuration.

### Controlled Delivery Status Model

Deliveries progress through a controlled workflow:

```text
CREATED
   ↓
ASSIGNED
   ↓
AT_PICKUP
   ↓
PICKED_UP
   ↓
IN_TRANSIT
   ↓
NEAR_DESTINATION
   ↓
DELIVERED
```

Each status has its own visual badge and state representation.

### Seeded Demo Data

The application includes realistic demo data so the system can be demonstrated immediately after setup.

---

# 🚀 Deployment on Vercel

CITSecure uses PostgreSQL for deployed environments.

> **Important:** Vercel serverless functions do not provide persistent project-local SQLite storage. A hosted PostgreSQL database such as Neon should be used instead.

### 1. Create or Link the Vercel Project

Deploy the repository to Vercel or connect an existing Vercel project.

### 2. Add PostgreSQL

Create a PostgreSQL database, for example:

* Neon through the Vercel Marketplace
* Another managed PostgreSQL provider

### 3. Configure Environment Variables

Add the following environment variables for:

* Production
* Preview
* Development

```env
DATABASE_URL="postgresql://user:password@host:5432/cit?schema=public"
```

### 4. Deploy

The deployment build automatically runs:

```bash
prisma generate
prisma db push
```

### 5. Open the Demo

After deployment, use:

```text
/track/CIT-1001
/admin
```

Demo data is automatically inserted when the database is empty.

### Optional Mapbox Configuration

To use real Mapbox tiles, add:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=
```

Without a token, CITSecure automatically uses the built-in animated fallback map.

---

# 🧱 Tech Stack

| Technology             | Purpose                                            |
| ---------------------- | -------------------------------------------------- |
| **Next.js 15**         | Full-stack React framework and application routing |
| **React 19**           | UI development                                     |
| **TypeScript**         | Type-safe application development                  |
| **Tailwind CSS**       | Styling and responsive UI                          |
| **Prisma ORM**         | Database access and schema management              |
| **PostgreSQL**         | Persistent production database                     |
| **Server-Sent Events** | Real-time delivery updates                         |
| **Mapbox GL**          | Interactive map rendering                          |
| **Zod**                | Request and input validation                       |
| **Lucide**             | UI icons                                           |

---

## Why PostgreSQL?

CITSecure uses PostgreSQL because deployed Vercel serverless functions cannot rely on a persistent local SQLite database.

PostgreSQL provides:

* Persistent storage
* Reliable data across serverless invocations
* Better deployment compatibility
* Easier future scaling

Enum-like values such as delivery status and user roles are stored as strings and validated centrally in:

```text
src/lib/domain.ts
```

This keeps the database schema simple while preserving application-level validation.

---

# 🔐 Environment Variables

Create a `.env` file based on `.env.example`.

```env
# Hosted PostgreSQL database
DATABASE_URL="postgresql://user:password@host:5432/cit?schema=public"

# Optional Mapbox public token
# Leave blank to use the built-in animated SVG map
NEXT_PUBLIC_MAPBOX_TOKEN=
```

A free Mapbox access token can be created from:

https://account.mapbox.com/access-tokens/

> Mapbox is completely optional. The demo works without it.

---

# 🛠️ Installation & Setup

## Requirements

* **Node.js 18+**
* Developed and tested with **Node.js 22**
* PostgreSQL database

## 1. Install Dependencies

```bash
npm install
```

## 2. Create Environment File

### macOS / Linux

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Configure your `DATABASE_URL` inside `.env`.

## 3. Create the Database Schema

```bash
npx prisma db push
```

## 4. Seed Demo Data

```bash
npm run db:seed
```

## 5. Start the Application

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## ⚡ Quick Setup

The following command performs database setup and seeding:

```bash
npm run setup
```

This is equivalent to:

```bash
npm run db:push
npm run db:seed
```

---

# 📜 Available Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the development server                 |
| `npm run build`     | Create a production build                    |
| `npm run start`     | Start the production server                  |
| `npm run lint`      | Run ESLint                                   |
| `npm run typecheck` | Run TypeScript checks without emitting files |
| `npm run db:push`   | Apply the Prisma schema to the database      |
| `npm run db:seed`   | Insert realistic demo data                   |
| `npm run db:reset`  | Reset the database and re-seed demo data     |
| `npm run setup`     | Run `db:push` and `db:seed`                  |

---

# 🎬 3-Minute Demo Flow

CITSecure is optimized for a short product demonstration.

### 1. Open the Dispatcher Dashboard

```text
http://localhost:3000/admin
```

Show:

* Active deliveries
* In-transit deliveries
* Awaiting pickup
* Completed deliveries
* Available drivers
* Live delivery section

### 2. Open the Primary Demo Delivery

Navigate to:

```text
http://localhost:3000/admin/deliveries/CIT-1001
```

Show:

* Delivery information
* Map
* Route
* Driver position
* ETA
* Timeline
* Delivery controls

Copy the client tracking link.

### 3. Open the Client Tracking Page

Open a second browser tab:

```text
http://localhost:3000/track/CIT-1001
```

This represents the customer-facing tracking experience.

### 4. Start the Live Simulation

Return to the delivery detail page and click:

**Start Live Delivery Simulation**

### 5. Watch Both Screens Update

Without refreshing either page:

* The driver marker moves along the route
* ETA counts down
* Delivery status changes
* Timeline events appear
* Client status indicators advance
* All connected views remain synchronized

### 6. Delivery Completion

The simulation eventually reaches:

```text
DELIVERED
```

The client page displays:

> **Delivery completed successfully.**

---

# 🚚 Manual Driver Demo

The delivery can also be progressed manually.

Open:

```text
http://localhost:3000/driver
```

Use the driver workflow:

```text
Start Pickup
→ Confirm Pickup
→ Start Delivery
→ Arriving Soon
→ Mark Delivered
```

The admin dashboard and client tracking page receive the same real-time updates.

The driver application also includes:

**Simulate GPS Movement**

for demonstrating live position updates.

---

# 🌐 Routes

## Public Routes

| Route           | Description                     |
| --------------- | ------------------------------- |
| `/`             | Landing page and role selection |
| `/track/[code]` | Public client tracking page     |

Example:

```text
/track/CIT-1001
```

## Dispatcher / Admin Routes

| Route                      | Description                  |
| -------------------------- | ---------------------------- |
| `/admin`                   | Dispatcher dashboard         |
| `/admin/deliveries`        | Deliveries list              |
| `/admin/deliveries/new`    | Create a delivery            |
| `/admin/deliveries/[code]` | Delivery detail and controls |
| `/admin/drivers`           | Driver roster                |
| `/admin/tracking`          | Live tracking board          |

## Driver Route

| Route     | Description                     |
| --------- | ------------------------------- |
| `/driver` | Mobile-first driver application |

## API Routes

### Deliveries

```text
GET  /api/deliveries
POST /api/deliveries
GET  /api/deliveries/[code]
```

### Delivery Actions

```text
POST /api/deliveries/[code]/action
```

Used for driver actions and driver assignment.

### Simulation

```text
POST /api/deliveries/[code]/simulate
```

Used to start and stop the server-side GPS simulation.

### Real-Time Streams

Per-delivery stream:

```text
GET /api/deliveries/[code]/stream
```

Global stream:

```text
GET /api/stream
```

### Drivers and Clients

```text
GET /api/drivers
GET /api/clients
```

---

# 🔑 Access & Credentials

There is **no authentication system in this prototype by design**.

Users can select their role from the landing page or navigate directly to any route.

The public client tracking page intentionally requires only a tracking code.

---

# 📦 Seeded Demo Data

### Deliveries

| Code         | Client               | Status       | Description                          |
| ------------ | -------------------- | ------------ | ------------------------------------ |
| **CIT-1001** | Acme Financial       | `IN_TRANSIT` | Primary live-tracking demo           |
| **CIT-1002** | Global Retail Bank   | `ASSIGNED`   | Awaiting pickup                      |
| **CIT-1003** | United Cash Services | `DELIVERED`  | Completed delivery with full history |

### Drivers

* Daniel Bekele
* Samuel Tesfaye
* Michael Adams
* Two additional available drivers

### Clients

* Acme Financial
* Global Retail Bank
* United Cash Services

---

# 🗄️ Data Model

CITSecure uses Prisma with PostgreSQL.

The core entities are:

```text
User
Driver
Client
Delivery
DeliveryEvent
```

The entities are connected using Prisma relations with appropriate indexes.

Delivery-related values such as:

* Status
* Priority
* Roles
* Event types

are validated in:

```text
src/lib/domain.ts
```

---

# 🏗️ Architecture

## Real-Time Communication

Real-time updates are implemented using:

```text
src/lib/bus.ts
```

This module provides an in-memory publish/subscribe mechanism.

The SSE endpoints subscribe to these events and push updates to connected clients.

Whenever a delivery changes, the application broadcasts a complete delivery snapshot.

Client-side hooks include:

```text
useDeliveryStream
useGlobalStream
```

They:

1. Connect to the SSE stream
2. Apply live delivery updates
3. Detect connection failures
4. Automatically fall back to polling every 3 seconds

This architecture is intentionally simple and reliable for a single-process demonstration.

---

## GPS Simulation

The simulation logic is implemented in:

```text
src/lib/simulation.ts
```

It maintains per-delivery timers using `globalThis`.

During simulation it:

1. Calculates delivery progress
2. Interpolates GPS coordinates
3. Updates the database
4. Creates delivery milestone events
5. Broadcasts updates
6. Advances delivery statuses
7. Stops automatically when the delivery reaches `DELIVERED`

---

# ⚠️ Prototype Limitations

CITSecure is intentionally designed as a **demonstration prototype**, not a production-hardened CIT logistics platform.

### Authentication & Authorization

The prototype does not currently implement:

* User authentication
* Authorization
* Role-based access control
* Secure driver authentication
* Client identity verification

### Rate Limiting

API endpoints currently do not implement production-grade rate limiting.

### Multi-Tenancy

There is no tenant isolation model.

### Real-Time Scalability

The current SSE implementation uses an **in-memory pub/sub system**.

This assumes a single Node.js process.

For horizontally scaled deployments, the real-time layer should be moved to infrastructure such as:

```text
Redis
```

or another distributed event/pub-sub system.

### Simulation Scalability

The GPS simulation also runs in-process.

A production implementation should use a dedicated:

* Background job worker
* Queue
* Scheduler
* Distributed job system

### Routing

Routes currently use straight-line geometric interpolation.

They do **not** represent:

* Actual road networks
* Traffic conditions
* Road closures
* Real driving routes
* Traffic-aware ETA calculations

A production implementation could integrate a routing provider such as Mapbox Directions or another routing engine.

### Database

A hosted **PostgreSQL** database is required for production deployment.

### Demo Optimization

The entire simulated delivery run is intentionally short and completes in approximately:

```text
40 seconds
```

This keeps the workflow suitable for live demonstrations.

---

# 🔮 Potential Production Enhancements

CITSecure's prototype architecture can be extended with:

* Secure authentication and authorization
* Role-based permissions
* Multi-tenant organizations
* Redis-based real-time events
* Background GPS processing workers
* Real GPS device/mobile integration
* Real road routing
* Traffic-aware ETA
* Geofencing
* Driver identity verification
* Proof-of-delivery workflows
* Signature capture
* Photo/document evidence
* Notifications via SMS/email
* Audit logs
* Delivery security policies
* Incident management
* Advanced analytics
* Monitoring and observability

---

# 📁 Project Structure

A simplified structure:

```text
citsecure/
├── prisma/
│   ├── schema.prisma
│   └── seed.*
│
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── driver/
│   │   ├── track/
│   │   └── api/
│   │
│   ├── lib/
│   │   ├── bus.ts
│   │   ├── deliveries.ts
│   │   ├── domain.ts
│   │   └── simulation.ts
│   │
│   └── ...
│
├── .env.example
├── package.json
├── prisma.config.*
└── README.md
```

---

# 📄 License

This project is a prototype created for demonstration and evaluation purposes.
