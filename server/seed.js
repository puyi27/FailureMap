import pg from 'pg';
const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL || 'postgresql://soporte:soporte@localhost:5432/FailureMap';

const CITIES = [
  { name: 'Barcelona', lat: 41.3855, lng: 2.1739, tz: 'Europe/Madrid' },
  { name: 'Berlin', lat: 52.5217, lng: 13.4055, tz: 'Europe/Berlin' },
  { name: 'Buenos Aires', lat: -34.6040, lng: -58.3814, tz: 'America/Buenos_Aires' },
  { name: 'Frankfurt', lat: 50.1119, lng: 8.6838, tz: 'Europe/Berlin' },
  { name: 'Los Angeles', lat: 34.0521, lng: -118.2437, tz: 'America/Los_Angeles' },
  { name: 'Madrid', lat: 40.4169, lng: -3.7037, tz: 'Europe/Madrid' },
  { name: 'Milan', lat: 45.4641, lng: 9.1903, tz: 'Europe/Rome' },
  { name: 'Montevideo', lat: -34.9016, lng: -56.1656, tz: 'America/Montevideo' },
  { name: 'Naples', lat: 40.8516, lng: 14.2688, tz: 'Europe/Rome' },
  { name: 'New York', lat: 40.7125, lng: -74.0041, tz: 'America/New_York' },
  { name: 'Paris', lat: 48.8567, lng: 2.3514, tz: 'Europe/Paris' },
  { name: 'Rio de Janeiro', lat: -22.9080, lng: -43.1727, tz: 'America/Sao_Paulo' },
  { name: 'Rome', lat: 41.9008, lng: 12.4960, tz: 'Europe/Rome' },
  { name: 'Santiago de Chile', lat: -33.4475, lng: -70.6703, tz: 'America/Santiago' },
  { name: 'Sao Paulo', lat: -23.5502, lng: -46.6327, tz: 'America/Sao_Paulo' },
  { name: 'Seville', lat: 37.3889, lng: -5.9846, tz: 'Europe/Madrid' },
  { name: 'Sydney', lat: -33.8678, lng: 151.2100, tz: 'Australia/Sydney' },
  { name: 'Tokyo', lat: 35.6891, lng: 139.6913, tz: 'Asia/Tokyo' },
  { name: 'Vienna', lat: 48.2078, lng: 16.3741, tz: 'Europe/Vienna' }
];

const COMPANIES = ['FAE Technology', 'Siemens Industrial', 'Teltonika Networks', 'Schneider Electric', 'Cisco Systems'];
const DEVICE_TYPES = ['Gateway', 'Sensor', 'Actuator', 'Camera'];

async function seed() {
  console.log('🔌 Connecting to PostgreSQL at:', databaseUrl.split('@')[1] || databaseUrl);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('neon') || databaseUrl.includes('amazonaws') ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('✅ Connection established successfully.');

    console.log('🔨 Re-initializing table structures...');
    await client.query(`
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
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_telemetry_region ON telemetry_devices(region);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_telemetry_company ON telemetry_devices(company);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_telemetry_status ON telemetry_devices(last_status);`);

    console.log('🧹 Clearing old telemetry records...');
    await client.query('TRUNCATE TABLE telemetry_devices CASCADE;');

    console.log('📦 Generating 2000 telemetry devices...');
    const devices = [];

    for (let i = 1; i <= 2000; i++) {
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];

      const jitterLat = (Math.random() - 0.5) * 0.03;
      const jitterLng = (Math.random() - 0.5) * 0.03;

      const lat = city.lat + jitterLat;
      const lng = city.lng + jitterLng;
      const region = city.name;
      const timezone = city.tz;

      const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
      const deviceType = DEVICE_TYPES[Math.floor(Math.random() * DEVICE_TYPES.length)];
      const idPrefix = region.substring(0, 3).toUpperCase().replace(' ', '');
      const id = `${idPrefix}-NODE-${String(i).padStart(4, '0')}`;
      const info = `${city.name} Datacenter Rack ${Math.floor(Math.random() * 500)}`;

      const history = Array.from({ length: 24 }, (_, hIdx) => ({
        val: 1,
        timestamp: Date.now() - (24 - hIdx) * 3600000
      }));

      const events = [{
        status: 'HEALTHY',
        message: 'Telemetry nominal',
        timestamp: new Date().toISOString()
      }];

      devices.push({
        id, company, deviceType, info, lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)), region, timezone,
        last_status: 'HEALTHY', color: '#10b981', last_tick: Date.now(), status_ticks: 0,
        events: JSON.stringify(events), history: JSON.stringify(history), accumulated: JSON.stringify({ "HEALTHY": 0, "WARNING": 0, "CRITICAL": 0, "REPAIR_ORDER": 0 })
      });
    }

    console.log('🚀 Loading devices into database in batch transactions...');
    const chunkSize = 200;
    for (let i = 0; i < devices.length; i += chunkSize) {
      const chunk = devices.slice(i, i + chunkSize);

      const valueLines = [];
      const values = [];
      let valIdx = 1;

      chunk.forEach((d) => {
        valueLines.push(`($${valIdx}, $${valIdx + 1}, $${valIdx + 2}, $${valIdx + 3}, $${valIdx + 4}, $${valIdx + 5}, $${valIdx + 6}, $${valIdx + 7}, $${valIdx + 8}, $${valIdx + 9}, $${valIdx + 10}, $${valIdx + 11}, $${valIdx + 12}, $${valIdx + 13}, $${valIdx + 14})`);
        values.push(
          d.id, d.company, d.deviceType, d.info, d.lat, d.lng, d.region, d.timezone,
          d.last_status, d.color, d.last_tick, d.status_ticks, d.events, d.history, d.accumulated
        );
        valIdx += 15;
      });

      const sql = `
        INSERT INTO telemetry_devices (
          device_id, company, device_type, info, lat, lng, region, timezone, last_status, color, last_tick, status_ticks, events, history, accumulated
        ) VALUES ${valueLines.join(', ')}
        ON CONFLICT (device_id) DO NOTHING;
      `;

      await client.query(sql, values);
      console.log(` ✅ Loaded devices ${i + 1} to ${Math.min(i + chunkSize, devices.length)}`);
    }

    console.log('\n🎉 SUCCESS! Exactly 2000 devices successfully seeded into database.');

  } catch (err) {
    console.error('❌ SEEDING FAILED WITH EXCEPTION:', err.message);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database.');
  }
}

seed();