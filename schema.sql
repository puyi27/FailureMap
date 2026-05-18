-- ====================================================================
-- FailureMap PostgreSQL Schema & Mock Seed Data
-- ====================================================================
-- This SQL script initializes the `telemetry_devices` table and
-- populates it with premium, highly-realistic industrial telemetry
-- data in Neon (or any other Postgres database) to ensure that the
-- dashboard is immediately functional, beautifully populated, and alive.
-- ====================================================================

-- 1. Create the Telemetry Devices Table
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

-- 2. Create Optimized Indexes for Dashboard Filters & Queries
CREATE INDEX IF NOT EXISTS idx_telemetry_region ON telemetry_devices(region);
CREATE INDEX IF NOT EXISTS idx_telemetry_company ON telemetry_devices(company);
CREATE INDEX IF NOT EXISTS idx_telemetry_status ON telemetry_devices(last_status);

-- 3. Clear Existing Data (Optional - Uncomment if doing a clean reset)
-- TRUNCATE TABLE telemetry_devices RESTART IDENTITY CASCADE;

-- 4. Seed Premium Industrial Mock Data
-- Seeds 12 high-quality global nodes across Europe, North America, Asia, etc.
INSERT INTO telemetry_devices (
    device_id, company, device_type, info, lat, lng, region, timezone, last_status, color, last_tick, status_ticks, events, history, accumulated
) VALUES
-- ==========================================
-- EUROPE NODES
-- ==========================================
(
    'EUR-001', 'FAE Technology', 'Gateway', 'Milan Headquarters Core Router', 
    45.464200, 9.190000, 'Europe', 'Europe/Rome', 'HEALTHY', '#10b981', 
    1779101600000, 0,
    '[{"status": "HEALTHY", "message": "Central server connection established securely via fiber backup. Gateway operational.", "timestamp": "2026-05-18T10:00:00.000Z"}]'::jsonb,
    '[{"val": 1, "timestamp": 1779090000000}, {"val": 1, "timestamp": 1779093600000}, {"val": 1, "timestamp": 1779097200000}, {"val": 1, "timestamp": 1779100800000}]'::jsonb,
    '{"uptime_hours": 724, "errors_logged": 0}'::jsonb
),
(
    'EUR-002', 'Siemens Industrial', 'Sensor', 'Frankfurt Assembly Plant Temp Probe', 
    50.110900, 8.682100, 'Europe', 'Europe/Berlin', 'WARNING', '#f97316', 
    1779101600000, 0,
    '[{"status": "WARNING", "message": "High operating temperature detected on main core assembly. Cooling fans initiated.", "timestamp": "2026-05-18T11:24:00.000Z"}]'::jsonb,
    '[{"val": 1, "timestamp": 1779090000000}, {"val": 1, "timestamp": 1779093600000}, {"val": 2, "timestamp": 1779097200000}, {"val": 2, "timestamp": 1779100800000}]'::jsonb,
    '{"uptime_hours": 512, "errors_logged": 4}'::jsonb
),
(
    'EUR-003', 'Teltonika Networks', 'Gateway', 'Paris Warehouse Distribution Point', 
    48.856600, 2.352200, 'Europe', 'Europe/Paris', 'HEALTHY', '#10b981', 
    1779101600000, 0,
    '[{"status": "HEALTHY", "message": "Network diagnostics completed. Channel signal quality excellent (RSSI -58 dBm).", "timestamp": "2026-05-18T09:12:00.000Z"}]'::jsonb,
    '[{"val": 1, "timestamp": 1779090000000}, {"val": 1, "timestamp": 1779093600000}, {"val": 1, "timestamp": 1779097200000}, {"val": 1, "timestamp": 1779100800000}]'::jsonb,
    '{"uptime_hours": 1182, "errors_logged": 1}'::jsonb
),
(
    'EUR-004', 'Schneider Electric', 'Actuator', 'London Water Treatment Controller', 
    51.507400, -0.127800, 'Europe', 'Europe/London', 'CRITICAL', '#ef4444', 
    1779101600000, 0,
    '[{"status": "CRITICAL", "message": "Primary water pressure valve feedback failed. Emergency override activated.", "timestamp": "2026-05-18T12:01:00.000Z"}]'::jsonb,
    '[{"val": 1, "timestamp": 1779090000000}, {"val": 2, "timestamp": 1779093600000}, {"val": 3, "timestamp": 1779097200000}, {"val": 3, "timestamp": 1779100800000}]'::jsonb,
    '{"uptime_hours": 234, "errors_logged": 12}'::jsonb
),

-- ==========================================
-- NORTH AMERICA NODES
-- ==========================================
(
    'USA-001', 'Cisco Systems', 'Gateway', 'New York Financial Sector Node 4', 
    40.712800, -74.006000, 'North America', 'America/New_York', 'HEALTHY', '#10b981', 
    1779101600000, 0,
    '[{"status": "HEALTHY", "message": "Gigabit fiber link backup online. Latency optimal (14ms). All core channels operational.", "timestamp": "2026-05-18T08:00:00.000Z"}]'::jsonb,
    '[{"val": 1, "timestamp": 1779090000000}, {"val": 1, "timestamp": 1779093600000}, {"val": 1, "timestamp": 1779097200000}, {"val": 1, "timestamp": 1779100800000}]'::jsonb,
    '{"uptime_hours": 2040, "errors_logged": 0}'::jsonb
),
(
    'USA-002', 'FAE Technology', 'Sensor', 'San Francisco Smart Grid Flow Sensor', 
    37.774900, -122.419400, 'North America', 'America/Los_Angeles', 'WARNING', '#f97316', 
    1779101600000, 0,
    '[{"status": "WARNING", "message": "Grid peak demand warning. Sensor battery low (14%). Backup power engaged.", "timestamp": "2026-05-18T10:45:00.000Z"}]'::jsonb,
    '[{"val": 1, "timestamp": 1779090000000}, {"val": 1, "timestamp": 1779093600000}, {"val": 2, "timestamp": 1779097200000}, {"val": 2, "timestamp": 1779100800000}]'::jsonb,
    '{"uptime_hours": 912, "errors_logged": 3}'::jsonb
),
(
    'USA-003', 'Schneider Electric', 'Camera', 'Chicago Substation Security Camera', 
    41.878100, -87.629800, 'North America', 'America/Chicago', 'HEALTHY', '#10b981', 
    1779101600000, 0,
    '[{"status": "HEALTHY", "message": "HD thermal feed broadcasting. Infrared modules operating normally.", "timestamp": "2026-05-18T07:15:00.000Z"}]'::jsonb,
    '[{"val": 1, "timestamp": 1779090000000}, {"val": 1, "timestamp": 1779093600000}, {"val": 1, "timestamp": 1779097200000}, {"val": 1, "timestamp": 1779100800000}]'::jsonb,
    '{"uptime_hours": 3410, "errors_logged": 0}'::jsonb
),

-- ==========================================
-- ASIA NODES
-- ==========================================
(
    'ASI-001', 'Siemens Industrial', 'Actuator', 'Tokyo Robotics Lab Arm Controller', 
    35.676200, 139.650300, 'Asia', 'Asia/Tokyo', 'HEALTHY', '#10b981', 
    1779101600000, 0,
    '[{"status": "HEALTHY", "message": "Robotic joint actuator calibrated successfully (0.01mm tolerance).", "timestamp": "2026-05-18T12:30:00.000Z"}]'::jsonb,
    '[{"val": 1, "timestamp": 1779090000000}, {"val": 1, "timestamp": 1779093600000}, {"val": 1, "timestamp": 1779097200000}, {"val": 1, "timestamp": 1779100800000}]'::jsonb,
    '{"uptime_hours": 890, "errors_logged": 1}'::jsonb
),
(
    'ASI-002', 'Cisco Systems', 'Gateway', 'Singapore Port Loading Dock Link', 
    1.352100, 103.819800, 'Asia', 'Asia/Singapore', 'HEALTHY', '#10b981', 
    1779101600000, 0,
    '[{"status": "HEALTHY", "message": "Outdoor rugged router link online. Dual LTE band simulation backup healthy.", "timestamp": "2026-05-18T11:00:00.000Z"}]'::jsonb,
    '[{"val": 1, "timestamp": 1779090000000}, {"val": 1, "timestamp": 1779093600000}, {"val": 1, "timestamp": 1779097200000}, {"val": 1, "timestamp": 1779100800000}]'::jsonb,
    '{"uptime_hours": 4120, "errors_logged": 0}'::jsonb
),

-- ==========================================
-- SOUTH AMERICA NODES
-- ==========================================
(
    'SAM-001', 'Teltonika Networks', 'Sensor', 'Sao Paulo Heavy Machinery Sensor', 
    -23.550500, -46.633300, 'South America', 'America/Sao_Paulo', 'WARNING', '#f97316', 
    1779101600000, 0,
    '[{"status": "WARNING", "message": "Hydraulic oil viscosity warning. Service requested in next 48h.", "timestamp": "2026-05-18T10:15:00.000Z"}]'::jsonb,
    '[{"val": 1, "timestamp": 1779090000000}, {"val": 2, "timestamp": 1779093600000}, {"val": 2, "timestamp": 1779097200000}, {"val": 2, "timestamp": 1779100800000}]'::jsonb,
    '{"uptime_hours": 745, "errors_logged": 5}'::jsonb
),

-- ==========================================
-- AFRICA NODES
-- ==========================================
(
    'AFR-001', 'Schneider Electric', 'Sensor', 'Cairo Solar Plant Tracker', 
    30.044400, 31.235700, 'Africa', 'Africa/Cairo', 'HEALTHY', '#10b981', 
    1779101600000, 0,
    '[{"status": "HEALTHY", "message": "Sun alignment rotation tracking normal. Energy capture maximized.", "timestamp": "2026-05-18T09:00:00.000Z"}]'::jsonb,
    '[{"val": 1, "timestamp": 1779090000000}, {"val": 1, "timestamp": 1779093600000}, {"val": 1, "timestamp": 1779097200000}, {"val": 1, "timestamp": 1779100800000}]'::jsonb,
    '{"uptime_hours": 1580, "errors_logged": 0}'::jsonb
),

-- ==========================================
-- OCEANIA NODES
-- ==========================================
(
    'OCE-001', 'Cisco Systems', 'Gateway', 'Sydney Harbor Smart Light Router', 
    -33.868800, 151.209300, 'Oceania', 'Australia/Sydney', 'HEALTHY', '#10b981', 
    1779101600000, 0,
    '[{"status": "HEALTHY", "message": "Smart streetlighting gateway online. 482 active edge nodes linked.", "timestamp": "2026-05-18T06:00:00.000Z"}]'::jsonb,
    '[{"val": 1, "timestamp": 1779090000000}, {"val": 1, "timestamp": 1779093600000}, {"val": 1, "timestamp": 1779097200000}, {"val": 1, "timestamp": 1779100800000}]'::jsonb,
    '{"uptime_hours": 2980, "errors_logged": 0}'::jsonb
)
ON CONFLICT (device_id) DO NOTHING;
