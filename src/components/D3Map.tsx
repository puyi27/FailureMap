import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import useSupercluster from 'use-supercluster';
import { useDashboardStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import * as d3 from 'd3';
import { hexbin } from 'd3-hexbin';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';

const CONTINENT_BOUNDS: Record<string, [[number, number], [number, number]]> = {
  'All': [[-180, -70], [180, 80]],
  'Europe': [[-15, 35], [40, 65]],
  'North America': [[-130, 15], [-60, 55]],
  'South America': [[-85, -55], [-30, 15]],
  'Asia': [[60, 5], [145, 60]],
  'Africa': [[-20, -35], [55, 38]],
  'Oceania': [[110, -45], [160, -10]]
};

export const D3Map = () => {
  const apiData = useDashboardStore(state => state.apiData);
  const filters = useDashboardStore(useShallow(state => state.filters));
  const searchQuery = useDashboardStore(state => state.searchQuery);
  const worldData = useDashboardStore(state => state.worldData);
  const selectedPoint = useDashboardStore(state => state.selectedPoint);
  const setSelectedPoint = useDashboardStore(state => state.setSelectedPoint);

  const mapRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const [bounds, setBounds] = useState<[number, number, number, number] | undefined>(undefined);

  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 1.5,
    pitch: 0,
    bearing: 0,
  });

  const [dimensions, setDimensions] = useState({ w: 1200, h: 800 });
  const [hexagonsPathString, setHexagonsPathString] = useState<string>('');

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ w: width, h: height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (selectedPoint && mapRef.current) {
      mapRef.current.getMap().flyTo({
        center: [selectedPoint.lng, selectedPoint.lat],
        zoom: 12,
        pitch: 0,
        bearing: 0,
        duration: 2500,
        essential: true
      });
    }
  }, [selectedPoint]);

  const points = useMemo(() => {
    let d: any[] = apiData || [];

    if (filters.status !== 'ALL') d = d.filter((item: any) => item.lastStatus === filters.status);
    if (filters.company && filters.company !== 'All') d = d.filter((item: any) => item.company === filters.company);
    if (filters.deviceType && filters.deviceType !== 'All') d = d.filter((item: any) => item.type === filters.deviceType);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      d = d.filter((item: any) => item.deviceId?.toLowerCase().includes(q) || (item.info && item.info.toLowerCase().includes(q)));
    }

    return d.map((device: any) => ({
      type: 'Feature' as const,
      properties: { cluster: false, deviceId: device.deviceId, data: device },
      geometry: { type: 'Point' as const, coordinates: [device.lng, device.lat] as [number, number] },
    }));
  }, [apiData, filters, searchQuery]);

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom: Math.round(viewState.zoom),
    options: { radius: 60, maxZoom: 14 },
  });

  const updateBounds = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    const b = map.getBounds();
    setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    setViewState({
      longitude: map.getCenter().lng,
      latitude: map.getCenter().lat,
      zoom: map.getZoom(),
      pitch: map.getPitch(),
      bearing: map.getBearing(),
    });
  }, []);

  const handleMove = useCallback(() => updateBounds(), [updateBounds]);
  const handleLoad = useCallback(() => updateBounds(), [updateBounds]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();

    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (filters.continent === 'All') return;
    }

    if (filters.continent === 'All') {
      map.easeTo({ center: [0, 20], zoom: 1.5, pitch: 0, bearing: 0, duration: 1500 });
      return;
    }
    const boundsToFit = CONTINENT_BOUNDS[filters.continent];
    if (boundsToFit) {
      map.fitBounds(boundsToFit, { padding: 60, duration: 1500, essential: true, maxZoom: 4.0, pitch: 0, bearing: 0 });
    }
  }, [filters.continent]);

  useEffect(() => {
    if (!worldData) return;
    const BASE_ZOOM = 2;
    const BASE_SCALE = Math.pow(2, BASE_ZOOM);
    const W = 512 * BASE_SCALE;
    const H = 512 * BASE_SCALE;
    const proj = d3.geoMercator().scale((512 * BASE_SCALE) / (2 * Math.PI)).translate([256 * BASE_SCALE, 256 * BASE_SCALE]);
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    d3.geoPath().projection(proj).context(ctx)(worldData as any);
    ctx.fillStyle = '#000'; ctx.fill();
    const imageData = ctx.getImageData(0, 0, W, H).data;
    const hexR = 6;
    const hexW = Math.sqrt(3) * hexR;
    const rowH = 1.5 * hexR;
    const hexShape = hexbin().hexagon(hexR * 0.95);
    let path = '';
    for (let y = 0, row = 0; y < H; y += rowH, row++) {
      const offsetX = row % 2 === 0 ? 0 : hexW / 2;
      for (let x = offsetX; x < W; x += hexW) {
        const idx = (Math.floor(y) * W + Math.floor(x)) * 4 + 3;
        if (imageData[idx] > 128) path += `M${x},${y}${hexShape}`;
      }
    }
    setHexagonsPathString(path);
  }, [worldData]);

  const hexReady = hexagonsPathString.length > 0;
  const z = viewState.zoom;
  const mapOpacity = !hexReady || z >= 5.0 ? 1 : z <= 3.5 ? 0 : (z - 3.5) / 1.5;
  const d3Opacity = !hexReady || z <= 3.5 ? (hexReady ? 1 : 0) : z >= 5.0 ? 0 : 1 - (z - 3.5) / 1.5;
  const S = Math.pow(2, viewState.zoom - 2);
  const normalizedLng = ((viewState.longitude + 180) % 360 + 360) % 360 - 180;
  const projSync = useMemo(() => d3.geoMercator().scale((512 * 4) / (2 * Math.PI)).translate([256 * 4, 256 * 4]), []);
  const centerPx = projSync([normalizedLng, viewState.latitude]);
  const cx = centerPx ? centerPx[0] : 0;
  const cy = centerPx ? centerPx[1] : 0;
  const perspective = dimensions.h / 2 / Math.tan((36.87 / 2) * (Math.PI / 180));

  const handleResetView = () => {
    setSelectedPoint(null);
    if (mapRef.current) {
      mapRef.current.getMap().flyTo({ center: [0, 20], zoom: 1.5, pitch: 0, bearing: 0, duration: 1500, essential: true });
    }
  };

  return (
    <div className="relative w-full h-full flex-1 bg-[#f1f5f9]" ref={wrapperRef}>
      <style>{`.maplibregl-canvas { opacity: ${mapOpacity} !important; transition: opacity 0.12s linear; } .maplibregl-map { background: transparent !important; }`}</style>

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" style={{ perspective: `${perspective}px` }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', opacity: d3Opacity,
          transform: [`translate(${dimensions.w / 2}px, ${dimensions.h / 2}px)`, `rotateX(${viewState.pitch}deg)`, `rotateZ(${-viewState.bearing}deg)`, `scale(${S})`, `translate(${-cx}px, ${-cy}px)`].join(' '),
          willChange: 'transform, opacity',
        }}>
          <svg className="block absolute" style={{ overflow: 'visible', left: 0, top: 0 }}>
            <path d={hexagonsPathString} fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
          </svg>
        </div>
      </div>

      <div className="absolute inset-0 z-10 w-full h-full">
        <Map
          ref={mapRef}
          style={{ width: '100%', height: '100%' }}
          initialViewState={{ longitude: 0, latitude: 20, zoom: 1.5, pitch: 0, bearing: 0 }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          onMove={handleMove}
          onLoad={handleLoad}
          minZoom={-1}
          maxZoom={16}
          renderWorldCopies={false}
        >
          {clusters.map((cluster) => {
            const [longitude, latitude] = cluster.geometry.coordinates;
            const isCluster = cluster.properties.cluster as boolean;

            if (isCluster) {
              const clusterId = cluster.id as number;
              const pointCount = (cluster.properties as any).point_count;
              return (
                <Marker key={`cluster-${clusterId}`} latitude={latitude} longitude={longitude}>
                  <div className="cursor-pointer relative flex items-center justify-center transition-transform hover:scale-110"
                    onClick={() => {
                      const leaves = supercluster!.getLeaves(clusterId, Infinity);
                      const lats = leaves.map(l => l.geometry.coordinates[1]);
                      const lngs = leaves.map(l => l.geometry.coordinates[0]);
                      mapRef.current.getMap().fitBounds(
                        [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
                        { padding: 150, duration: 3500, essential: true, pitch: 0, bearing: 0 }
                      );
                    }}>
                    <svg width="38" height="38" viewBox="0 0 40 40"><path d="M20 2 L38 11 L38 29 L20 38 L2 29 L2 11 Z" fill="#3b82f6" stroke="#ffffff" strokeWidth="2.5" /></svg>
                    <span className="absolute text-white font-black text-[12px]">{pointCount}</span>
                  </div>
                </Marker>
              );
            }

            const { data } = cluster.properties as any;
            const isCritical = data.lastStatus === 'CRITICAL';
            const isWarning = data.lastStatus === 'WARNING';
            const isRepairing = data.lastStatus === 'REPAIRING';
            const isOffline = data.lastStatus === 'OFFLINE' || data.lastStatus === 'STALE';
            const pointColor = isOffline ? '#94a3b8' : (data.color || '#10b981');

            const isSelected = selectedPoint?.deviceId === data.deviceId;

            return (
              <Marker key={`device-${data.deviceId}`} latitude={latitude} longitude={longitude}>
                <div className={`relative flex items-center justify-center cursor-pointer group ${isSelected ? 'scale-125 z-50' : 'z-10'}`} onClick={() => setSelectedPoint(data)}>
                  {isCritical && <span className="absolute w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75" />}
                  {isWarning && <span className="absolute w-5 h-5 bg-orange-500 rounded-full animate-ping opacity-75" />}
                  {isRepairing && <span className="absolute w-5 h-5 bg-cyan-500 rounded-full animate-bounce opacity-75" />}
                  {isSelected && <span className="absolute w-6 h-6 rounded-full border-2 border-blue-500 animate-pulse" />}

                  <div className={`relative z-10 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-transform ${isOffline ? 'opacity-50 group-hover:opacity-100' : 'group-hover:scale-125'}`}
                    style={{ backgroundColor: pointColor }} />
                </div>
              </Marker>
            );
          })}
        </Map>
      </div>

      <div className="absolute bottom-6 left-6 z-[60]">
        <button
          onClick={handleResetView}
          className="w-12 h-12 bg-white/95 backdrop-blur-xl rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all cursor-pointer outline-none"
        >
          <GpsFixedIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
};