import express from 'express';
import cors from 'cors';
import { Client } from 'pg';
import { createServer } from 'http';
import { Server } from 'socket.io';

// npx ts-node server/server.ts

const app = express();
app.use(cors() as any);
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

// DYNAMIC DATABASE CONFIGURATION (Supports local Postgres and Neon cloud with SSL)
const isProduction = process.env.NODE_ENV === 'production';
const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://soporte:soporte@localhost:5432/FailureMap',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

client.connect();

// Helpers to safely parse JSON arrays from DB (handles text columns or JSON columns robustly)
const parseJsonArray = (val: any): any[] => {
    if (!val) return [];
    if (typeof val === 'string') {
        try {
            return JSON.parse(val);
        } catch (e) {
            return [];
        }
    }
    if (Array.isArray(val)) return val;
    return [];
};

app.get('/api/devices', async (req, res) => {
    try {
        const result = await client.query('SELECT device_id, company, device_type, info, lat, lng, region, timezone, last_status, color, last_tick, status_ticks, events, history FROM telemetry_devices');

        const devices = result.rows.map(row => {
            let events = parseJsonArray(row.events);
            let history = parseJsonArray(row.history);

            // Seed empty records so the charts never look completely blank on fresh load
            if (history.length === 0) {
                history = Array.from({ length: 24 }, (_, i) => ({
                    val: 1,
                    timestamp: Date.now() - (24 - i) * 3600000
                }));
            }
            if (events.length === 0) {
                events = [{
                    status: 'HEALTHY',
                    timestamp: new Date().toISOString(),
                    message: 'Telemetry communication link established. Status OK.'
                }];
            }

            return {
                deviceId: row.device_id,
                company: row.company,
                type: row.device_type,
                info: row.info,
                lat: Number(row.lat),
                lng: Number(row.lng),
                region: row.region,
                timezone: row.timezone,
                lastStatus: row.last_status,
                color: row.color,
                lastTick: Number(row.last_tick),
                statusTicks: row.status_ticks,
                events,
                history
            };
        });

        res.json(devices);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/devices/:id/details', async (req, res) => {
    try {
        const result = await client.query('SELECT events, history, accumulated FROM telemetry_devices WHERE device_id = $1', [req.params.id]);
        if (result.rows.length > 0) {
            const row = result.rows[0];
            res.json({
                events: parseJsonArray(row.events),
                history: parseJsonArray(row.history),
                accumulated: row.accumulated
            });
        } else {
            res.status(404).send('No encontrado');
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ENCAPSULATED REUSABLE TELEMETRY SIMULATION PIPELINE
const runSinglePingSimulation = async () => {
    // Fetch a random device from the database including its telemetry logs
    const res = await client.query('SELECT device_id, company, device_type, info, lat, lng, region, timezone, last_status, events, history, status_ticks FROM telemetry_devices TABLESAMPLE SYSTEM(1) LIMIT 1');

    if (res.rows.length === 0) {
        const fallbackRes = await client.query('SELECT device_id, company, device_type, info, lat, lng, region, timezone, last_status, events, history, status_ticks FROM telemetry_devices LIMIT 1');
        if (fallbackRes.rows.length === 0) return;
        res.rows.push(fallbackRes.rows[0]);
    }

    const device = res.rows[0];
    const deviceId = device.device_id;

    // Construct a simulated private IP address based on its coordinates
    const ip = `10.240.${Math.floor(Math.abs(Number(device.lat)) % 255)}.${Math.floor(Math.abs(Number(device.lng)) % 255)}`;
    
    console.log(`\n[TELEMETRY CORE] Establishing socket connection to Node '${device.info || deviceId}' at http://${ip}:8080/api/metrics...`);

    // Latency delay (150ms)
    await new Promise(resolve => setTimeout(resolve, 150));

    // Generate simulated telemetry metrics
    const rssi = -50 - Math.floor(Math.random() * 45); // -50 to -95 dBm
    const temp = 22 + Math.floor(Math.random() * 46);  // 22 to 68 °C
    const battery = 8 + Math.floor(Math.random() * 92); // 8 to 100 %

    let status = 'HEALTHY';
    let color = '#10b981';
    let val = 1;
    let message = `Telemetry fetch successful. Connection secure. RSSI: ${rssi} dBm, Internal Temp: ${temp}°C, Battery: ${battery}%.`;

    // Logic based on metrics to trigger simulated errors
    if (rssi < -91) {
        status = 'OFFLINE';
        color = '#94a3b8';
        val = 3;
        message = `CRITICAL: Connection timed out. RSSI too weak (${rssi} dBm). Node is OFFLINE.`;
    } else if (temp > 62) {
        status = 'CRITICAL';
        color = '#ef4444';
        val = 3;
        message = `CRITICAL: Thermal sensor reports hardware overheat at ${temp}°C. Core operations throttled.`;
    } else if (battery < 15) {
        status = 'WARNING';
        color = '#f97316';
        val = 2;
        message = `WARNING: Low power warning. Battery charge critically low at ${battery}%. Backup power engaged.`;
    } else if (Math.random() > 0.95) {
        const isCrit = Math.random() > 0.5;
        status = isCrit ? 'CRITICAL' : 'WARNING';
        color = isCrit ? '#ef4444' : '#f97316';
        val = isCrit ? 3 : 2;
        message = isCrit 
            ? 'CRITICAL: RAM utilization exceeded 98.4%. Core services halted.' 
            : 'WARNING: Disk space low (92.5%). Automatic logs cleanup deferred.';
    }

    console.log(`[TELEMETRY CORE] Response 200 OK | Latency: ${60 + Math.floor(Math.random() * 90)}ms`);
    console.log(`[TELEMETRY CORE] Status: ${status} | Log: "${message}"`);

    // Parse existing records
    let history = parseJsonArray(device.history);
    let events = parseJsonArray(device.events);

    // Seed if empty
    if (history.length === 0) {
        history = Array.from({ length: 24 }, (_, i) => ({
            val: 1,
            timestamp: Date.now() - (24 - i) * 3600000
        }));
    }

    // Append new history value (keeping last 24 ticks for graph timeline)
    history.push({ val, timestamp: Date.now() });
    if (history.length > 24) history = history.slice(-24);

    // Append new event at the beginning (keeping last 15 for recent logs list)
    events.unshift({
        status,
        timestamp: new Date().toISOString(),
        message
    });
    if (events.length > 15) events = events.slice(0, 15);

    // Persist records into PostgreSQL database
    const updateRes = await client.query(`
        UPDATE telemetry_devices 
        SET last_status = $1, color = $2, last_tick = $3, history = $4, events = $5
        WHERE device_id = $6 
        RETURNING device_id, company, device_type, info, lat, lng, region, timezone, last_status, color, last_tick, status_ticks
    `, [status, color, Date.now(), JSON.stringify(history), JSON.stringify(events), deviceId]);

    const row = updateRes.rows[0];

    // Emit updated node state LIVE over websockets to the frontend
    io.emit('device_update', {
        deviceId: row.device_id,
        company: row.company,
        type: row.device_type,
        info: row.info,
        lat: Number(row.lat),
        lng: Number(row.lng),
        region: row.region,
        timezone: row.timezone,
        lastStatus: row.last_status,
        color: row.color,
        lastTick: Number(row.last_tick),
        statusTicks: row.status_ticks,
        events,
        history
    });
};

// VERCEL CRON JOB ENDPOINT (Called periodically in serverless production)
app.get('/api/cron/simulate-ping', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (isProduction && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        console.log('[VERCEL CRON] Triggering batch telemetry ping simulation...');
        await runSinglePingSimulation();
        res.status(200).json({ success: true, message: 'Simulated telemetry ping completed successfully.' });
    } catch (e: any) {
        console.error('[VERCEL CRON EXCEPTION]', e.message);
        res.status(500).json({ success: false, error: e.message });
    }
});

// Run simulated loop locally only (saves resources and avoids memory leaks on Serverless Vercel)
if (!isProduction) {
    setInterval(async () => {
        try {
            await runSinglePingSimulation();
        } catch (e: any) {
            console.error('[LOCAL TELEMETRY EXCEPTION]', e.message);
        }
    }, 4000);
}

httpServer.listen(3000, () => {
    console.log(`[SYSTEM START] FailureMap Telemetry Server running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode on port 3000.`);
});