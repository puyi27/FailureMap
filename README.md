# 🌍 FailureMap — Enterprise-Grade Global IoT Telemetry & Real-Time Fault Monitoring Platform

**FailureMap** is a high-performance, SaaS-ready, real-time industrial Internet of Things (IoT) monitoring and telemetry visualization platform. Engineered for mission-critical operations, it provides seamless real-time fault tracking, diagnostic logging, and geographical clustering for over **2,000 active global hardware nodes** across 19 major metropolitan hubs.

This platform utilizes a cutting-edge, stateless, serverless hybrid architecture optimized for zero-cost, infinite-scale hosting on **Vercel** and **Neon Serverless PostgreSQL**.

---

## 💎 Architectural Pillars

### 1. Vector Map Engine (D3.js Vector Pipelines)
Instead of relying on heavy map tiles (like Leaflet or Mapbox) which consume high bandwidth and inject styling overhead, FailureMap utilizes pure **D3.js** projection matrices. Global coordinates are rendered into a responsive, highly styled SVG vector projection. This reduces the client bundle size and allows smooth vector zooming and panning at 60 FPS while displaying thousands of active interactive nodes.

### 2. Zero-React-Render Cascades (Zustand & Memoization)
To prevent performance degradation during mass state updates, the dashboard decouples standard React state from the telemetry pipeline. Using **Zustand**, global state updates are dispatched directly to the active components. Visual sub-components (graphs, charts, lists, and modal interfaces) utilize custom memoized selectors to ensure that a telemetry ping on one node does not trigger a re-render cascade across the remaining 1,990+ nodes.

### 3. Hype-Optimized Stateless Sync (Lazy Telemetry Simulation)
Because serverless runtimes (like Vercel Serverless Functions) are fully ephemeral and stateless, persistent WebSocket connections and infinite background intervals (`setInterval`) are not physically possible. FailureMap resolves this limitation gracefully with an on-demand, stateless simulation architecture.

---

## 🛰️ Serverless Stateless Synchronization Pipeline

Vercel Hobby plan limitations only permit a single Cron Job run per 24 hours (`0 0 * * *`). To maintain a dynamic, real-time, self-updating telemetry map without upgrading to a paid Tier, the backend incorporates an **On-Demand Reactive Simulators (Lazy Simulation Pattern)**.

```mermaid
sequenceDiagram
  autonumber
  actor Client as Active Client Dashboard
  participant Vercel as Vercel Serverless (API Route)
  participant Neon as Neon Serverless PostgreSQL
  
  Client->>Vercel: HTTP GET /api/devices (Stateless Polling every 4s)
  Note over Vercel: Checks last simulation timestamp
  alt Time Delta since last ping > 4 seconds
      Vercel->>Neon: Spawn runSinglePingSimulation() in background
      Note over Neon: Evaluates physical sensors, battery, RF pings<br/>and logs system-wide state changes
  end
  Vercel->>Neon: SELECT * FROM telemetry_devices
  Neon-->>Vercel: Returns 2,000 updated nodes
  Vercel-->>Client: Returns JSON payload (60FPS Reactive Map updates)
```

This pipeline ensures that when users are active, the telemetry engine is fully alive and dynamically mutating every 4 seconds. When the platform has no active traffic, database operations scale down to **absolute zero**, saving Neon compute cycles.

---

## 🗄️ Database Schema & Fast-Query Indexes

The data layer is powered by PostgreSQL. It stores structured IoT telemetry, historical logs, and complex status objects in robust, indexable JSON columns (`JSONB`). This design enables fast queries and flexible schemas without database migration overhead.

### SQL Table Schema (`schema.sql`)
```sql
CREATE TABLE IF NOT EXISTS telemetry_devices (
    device_id VARCHAR(50) PRIMARY KEY,
    company VARCHAR(100) NOT NULL,
    device_type VARCHAR(50) NOT NULL,
    info TEXT,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    region VARCHAR(50) NOT NULL,
    timezone VARCHAR(50),
    last_status VARCHAR(20) DEFAULT 'HEALTHY',
    color VARCHAR(20) DEFAULT '#10b981',
    last_tick BIGINT,
    status_ticks INTEGER DEFAULT 0,
    events JSONB DEFAULT '[]'::jsonb,
    history JSONB DEFAULT '[]'::jsonb,
    accumulated JSONB DEFAULT '{}'::jsonb
);

-- Optimization indexes for instant UI filter lookups
CREATE INDEX IF NOT EXISTS idx_telemetry_region ON telemetry_devices(region);
CREATE INDEX IF NOT EXISTS idx_telemetry_company ON telemetry_devices(company);
CREATE INDEX IF NOT EXISTS idx_telemetry_status ON telemetry_devices(last_status);
```

---

## 🧪 Mass Programmatic Seeder: 2,000 Active Nodes ([seed.js](server/seed.js))

The database seeder is written in native ES modules and programmatically generates exactly **2,000 highly realistic IoT nodes** clustered around **19 major global metropolises**.

### Bounding Coordinates & Local Clustering (Jitter Algorithm)
To prevent nodes from rendering directly on top of each other, the seeder uses a **Jitter Clustering Algorithm** that applies a random Gaussian/Uniform coordinate offset (`±0.015°`) relative to the city center. This simulates realistic industrial parks, cell towers, and smart-city grid layouts:

* **Europe:** Barcelona, Berlin, Frankfurt, London, Milan, Paris, Rome, Seville, Vienna.
* **North America:** Los Angeles, New York, Chicago.
* **South America:** Buenos Aires, Montevideo, Rio de Janeiro, Santiago, Sao Paulo.
* **Asia & Oceania:** Tokyo, Sydney.

### Network Payload Mitigation (Bulk Loading)
Instead of performing 2,000 individual queries which would trigger connection timeouts or Neon rate-limits, the seeder processes nodes in chunks of **200 parameterized multi-row queries** inside database transactions. This loads all 2,000 fully hydrated records in **under 3 seconds**.

---

## 📁 Repository Directory Structure

```text
FailureMap/
├── public/                 # Static vector assets (SVGs, Icons)
├── server/
│   ├── seed.js             # ES Module programmatic 2,000-device seeder
│   └── server.ts           # Express API server & serverless endpoint routes
├── src/
│   ├── assets/             # Global visual styling sheets
│   ├── components/         # Modular React micro-frontends
│   │   ├── ControlsBar.tsx        # Multi-variable search, filter, and date controllers
│   │   ├── D3Map.tsx              # D3.js real-time global map component
│   │   ├── DetailsPanel.tsx       # Live status charts, status history, and remote commands
│   │   └── TelemetryExportModal.ts# Custom 60FPS UI modal for selective telemetry data export
│   ├── config/             # Styling definitions, gradients, and translation matrices
│   ├── services/           # Socket & API client instances
│   ├── store.ts            # High-speed reactive global state store (Zustand)
│   ├── types.ts            # Strict industrial telemetry type interfaces
│   ├── App.tsx             # Master Layout & core framework entry point
│   └── main.tsx            # DOM Mounting point
├── schema.sql              # Clean Postgres DDL database schema definitions
├── vercel.json             # Serverless deployment configuration
└── package.json            # Manifest file, configurations, and core dependencies
```

---

## 🚀 Local Development Setup

### 1. Installation
Clone the repository and install all required platform dependencies:
```bash
git clone https://github.com/puyi27/FailureMap.git
cd FailureMap
npm install
```

### 2. Local Database Initialization
Initialize your local Postgres instance by creating a database named `FailureMap` and running `schema.sql`.

### 3. Seeding the 2,000 Nodes
Run the automatic seeder. The script automatically detects if it needs to apply SSL parameters depending on the target Postgres instance:

**Local Database (Default):**
```bash
node server/seed.js
```

**Neon Serverless Cloud Database:**
* *Windows (PowerShell):*
  ```powershell
  $env:DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@your-host.aws.neon.tech/neondb?sslmode=require"; node server/seed.js
  ```
* *Git Bash / macOS / Linux:*
  ```bash
  DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@your-host.aws.neon.tech/neondb?sslmode=require" node server/seed.js
  ```

### 4. Running the Dev Servers
Open two terminal windows to execute the client and server concurrently:

* **Terminal 1: Node.js API server (Port 3000)**
  ```bash
  npm run server
  ```
* **Terminal 2: Frontend Client (Vite on Port 5173)**
  ```bash
  npm run dev
  ```

---

## ☁️ Zero-Cost Cloud Deployment (Vercel)

FailureMap is fully configured out-of-the-box for production deployments on Vercel.

1. Create a new project in your **Vercel Console** and link it to your GitHub repository.
2. Add your database connection string in the **Environment Variables** panel:
   * Key: `DATABASE_URL`
   * Value: `postgresql://neondb_owner:YOUR_PASSWORD@your-host.neon.tech/neondb?sslmode=require`
3. Click **Deploy**. Vercel will parse `vercel.json`, automatically build the client bundle via Vite, configure the serverless function redirects, and deploy the entire platform globally.

---

## 📜 License

This project is open-source software licensed under the **MIT License**. Created by [puyi27](https://github.com/puyi27).
