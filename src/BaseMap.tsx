import { useEffect } from 'react';
import { useDashboardStore } from './store';
import { D3Map } from './components/D3Map';
import { ControlsBar } from './components/ControlsBar';
import { DetailsPanel } from './components/DetailsPanel';
import { TelemetryExportModal } from './components/TelemetryExportModal';
import { initializeSocket, disconnectSocket } from './services/socket';

export const BaseMap = () => {
  const setApiData = useDashboardStore((state: any) => state.setApiData);
  const setGeoData = useDashboardStore((state: any) => state.setGeoData);

  useEffect(() => {
    // 1. Fetch geographic map data
    fetch("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson")
      .then(r => r.json())
      .then(countries => {
        countries.features = countries.features.filter((f: any) => f.properties.CONTINENT !== "Antarctica");
        setGeoData(countries);
      });

    // 2. Load initially persisted device lists from Database
    const apiHost = window.location.origin === 'http://localhost:5173' ? 'http://localhost:3000' : window.location.origin;
    fetch(`${apiHost}/api/devices`)
      .then(res => res.json())
      .then(data => {
        const sanitized = data.map((d: any) => ({
          ...d,
          lat: Number(d.lat),
          lng: Number(d.lng),
          events: d.events || [],
          history: d.history || Array.from({ length: 24 }, (_, i) => ({ val: 1, timestamp: Date.now() - (24 - i) * 3600000 })),
          lastStatus: d.lastStatus || 'HEALTHY',
          color: d.color || '#10b981'
        }));
        setApiData(sanitized);
      })
      .catch(() => console.error("Error cargando base de datos"));
  }, [setGeoData, setApiData]);

  // 3. Connect to WebSocket Gateway locally, or fallback to Option A (4s Polling) in serverless production
  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isLocal) {
      // Use Socket.io in local development for live push updates
      initializeSocket();
      return () => {
        disconnectSocket();
      };
    } else {
      // In production (Vercel Serverless), engage Option A: 4s database polling
      console.log('[TELEMETRY CLIENT] Running on serverless environment. Engaging Option A: 4s database polling.');
      const apiHost = window.location.origin;

      const pollInterval = setInterval(() => {
        fetch(`${apiHost}/api/devices`)
          .then(res => res.json())
          .then(data => {
            // Update global map nodes state
            setApiData(data);

            // Keep the active Details Panel updated in real-time if open!
            useDashboardStore.setState((state: any) => {
              if (!state.selectedPoint) return {};
              const updated = data.find((d: any) => d.deviceId === state.selectedPoint.deviceId);
              return updated ? { selectedPoint: updated } : {};
            });
          })
          .catch(err => console.error('[TELEMETRY POLLING ERROR]', err));
      }, 4000);

      return () => clearInterval(pollInterval);
    }
  }, [setApiData]);

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="relative w-full max-w-[1600px] h-[80vh] min-h-[600px] bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">

        <div className="absolute inset-0 z-0 w-full h-full flex">
          <D3Map />
        </div>

        <div className="absolute top-6 left-6 z-[60] pointer-events-none">
          <ControlsBar />
        </div>

        <div className="absolute top-6 bottom-6 right-6 z-[70] pointer-events-none">
          <DetailsPanel />
        </div>

      </div>

      <TelemetryExportModal />
    </div>
  );
};