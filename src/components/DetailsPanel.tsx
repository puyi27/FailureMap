import { useMemo, useState } from 'react';
import { useDashboardStore } from '../store';
import * as d3 from 'd3';
import CloseIcon from '@mui/icons-material/Close';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import ConstructionIcon from '@mui/icons-material/Construction';
import DownloadIcon from '@mui/icons-material/Download';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import TimerIcon from '@mui/icons-material/Timer';

const STATUS_CFG: Record<string, { label: string; bg: string; dot: string }> = {
  CRITICAL: { label: 'CRITICAL', bg: 'bg-red-105 text-red-655', dot: 'bg-red-500' },
  WARNING: { label: 'WARNING', bg: 'bg-orange-105 text-orange-655', dot: 'bg-orange-500' },
  HEALTHY: { label: 'HEALTHY', bg: 'bg-emerald-105 text-emerald-650', dot: 'bg-emerald-500' },
  RESOLVED: { label: 'RESOLVED', bg: 'bg-blue-105 text-blue-650', dot: 'bg-blue-500' },
  REPAIRING: { label: 'REPAIRING', bg: 'bg-cyan-105 text-cyan-655', dot: 'bg-cyan-500' },
  OFFLINE: { label: 'OFFLINE', bg: 'bg-slate-105 text-slate-655', dot: 'bg-slate-500' },
};

const arcGenerator = d3.arc<any>().innerRadius(18).outerRadius(30);
const pieGenerator = d3.pie<any>().value((d: any) => d.value).sort(null);

const MetricCard = ({ icon, label, value, color }: any) => (
  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col gap-1">
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-white shadow-sm ${color}`}>{icon}</div>
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</span>
    <span className="text-xs font-black text-slate-700">{value}</span>
  </div>
);

export const DetailsPanel = () => {
  const selectedPoint = useDashboardStore((s: any) => s.selectedPoint);
  const setSelectedPoint = useDashboardStore((s: any) => s.setSelectedPoint);
  const resolveDevice = useDashboardStore((s: any) => s.resolveDevice);
  const repairDevice = useDashboardStore((s: any) => s.repairDevice);
  const setIsExportModalOpen = useDashboardStore((s: any) => s.setIsExportModalOpen);
  const [pieHover, setPieHover] = useState<any>(null);

  const stats = useMemo(() => {
    if (!selectedPoint?.history) return null;
    const h = selectedPoint.history;
    const total = h.length || 1;
    const healthy = h.filter((x: any) => x.val === 1).length;
    const warn = h.filter((x: any) => x.val === 2).length;
    const crit = h.filter((x: any) => x.val === 3).length;

    const pieData = [
      { id: 'HEALTHY', value: healthy, color: '#10b981' },
      { id: 'WARNING', value: warn, color: '#f97316' },
      { id: 'CRITICAL', value: crit, color: '#ef4444' }
    ].filter(d => d.value > 0);

    return {
      pct: Math.round((healthy / total) * 100),
      piePaths: pieGenerator(pieData).map(p => ({ d: arcGenerator(p), ...p.data, pct: (p.data.value / total) * 100 })),
      blocks: h
    };
  }, [selectedPoint]);

  const groupedEvents = useMemo(() => {
    if (!selectedPoint?.events) return [];
    const groups: any[] = [];
    let current: any = null;
    selectedPoint.events.forEach((ev: any) => {
      if (!current) current = { ...ev, count: 1, endTime: ev.timestamp };
      else if (current.status === ev.status) { current.count++; current.endTime = ev.timestamp; }
      else { groups.push(current); current = { ...ev, count: 1, endTime: ev.timestamp }; }
    });
    if (current) groups.push(current);
    return groups;
  }, [selectedPoint?.events]);

  if (!selectedPoint) return null;

  const cfg = STATUS_CFG[selectedPoint.lastStatus] || STATUS_CFG['OFFLINE'];
  const currentPie = pieHover || { id: 'STABLE', pct: stats?.pct || 100, color: '#10b981' };
  const isBroken = selectedPoint.lastStatus === 'CRITICAL' || selectedPoint.lastStatus === 'WARNING';

  return (
    <div className="pointer-events-auto w-[400px] h-full bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slide-in">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 relative shrink-0">
        <button onClick={() => setSelectedPoint(null)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors">
          <CloseIcon />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className={`w-3 h-3 rounded-full ${cfg.dot} ${selectedPoint.lastStatus === 'REPAIRING' ? 'animate-bounce' : 'animate-pulse'}`} />
          <span className={`px-2 py-1 rounded-md text-[9px] font-black tracking-widest ${cfg.bg}`}>
            {cfg.label}
          </span>
        </div>

        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1 block">{selectedPoint.company || 'Unknown Company'}</span>
        <h3 className="text-2xl font-black text-slate-800 leading-tight mb-1 pr-6">{selectedPoint.info || 'Unnamed Node'}</h3>
        <p className="text-xs font-mono font-bold text-slate-400">{selectedPoint.deviceId}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-hide">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard icon={<SignalCellularAltIcon fontSize="inherit" />} label="Señal RF" value="-62 dBm" color="text-blue-500" />
          <MetricCard icon={<BatteryChargingFullIcon fontSize="inherit" />} label="Batería" value="89%" color="text-emerald-500" />
          <MetricCard icon={<ThermostatIcon fontSize="inherit" />} label="Temp. Interna" value="42°C" color="text-orange-500" />
          <MetricCard icon={<TimerIcon fontSize="inherit" />} label="Uptime" value="12d 4h" color="text-purple-500" />
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-5 flex flex-col gap-4 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stability (24h)</span>
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 shrink-0">
              <svg viewBox="-40 -40 80 80" className="w-full h-full drop-shadow-sm">
                {stats?.piePaths.map((p: any) => (
                  <path key={p.id} d={p.d} fill={p.color} stroke="white" strokeWidth="2" onMouseEnter={() => setPieHover(p)} onMouseLeave={() => setPieHover(null)} className="cursor-pointer transition-transform hover:scale-110" />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-black leading-none" style={{ color: currentPie.color }}>{Math.round(currentPie.pct)}%</span>
                <span className="text-[7px] font-black uppercase" style={{ color: currentPie.color }}>{currentPie.id}</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="w-full h-6 flex rounded-lg overflow-hidden border border-white bg-slate-200">
                {stats?.blocks.map((b: any, i: number) => (
                  <div key={i} className="flex-1" style={{ backgroundColor: b.val === 3 ? '#ef4444' : b.val === 2 ? '#f97316' : '#10b981' }} />
                ))}
              </div>
              <div className="flex justify-between text-[8px] font-black text-slate-400">
                <span>24H AGO</span>
                <span>LIVE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Historical Telemetry
          </span>
          <div className="space-y-3">
            {groupedEvents.length > 0 ? (
              groupedEvents.slice(0, 10).map((ev: any, i: number) => {
                const evCfg = STATUS_CFG[ev.status] || STATUS_CFG['HEALTHY'];
                return (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${evCfg.bg}`}>{evCfg.label}</span>
                      <span className="text-[10px] font-bold text-slate-400">{new Date(ev.endTime).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 leading-snug">{ev.message}</p>
                    {ev.count > 1 && <span className="text-[9px] font-black text-slate-400 italic mt-1">Repetido {ev.count} veces</span>}
                  </div>
                )
              })
            ) : (
              <div className="py-6 text-center text-xs font-bold text-slate-400">No events registered</div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-3 shrink-0">
        {isBroken && (
          <button onClick={() => repairDevice(selectedPoint.deviceId)} className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-600 text-white font-black rounded-xl shadow-lg transition-all text-xs flex items-center justify-center gap-2">
            <ConstructionIcon fontSize="small" /> ACTIVATE REPAIR MODE
          </button>
        )}

        {selectedPoint.lastStatus === 'REPAIRING' && (
          <button onClick={() => resolveDevice(selectedPoint.deviceId)} className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl shadow-lg transition-all text-xs flex items-center justify-center gap-2">
            <BuildCircleIcon fontSize="small" /> COMPLETE REPAIR (OK)
          </button>
        )}

        <button onClick={() => setIsExportModalOpen(true)} className="w-full py-3 border-2 border-slate-200 text-slate-600 font-black rounded-xl hover:bg-white hover:border-slate-300 transition-all text-xs flex items-center justify-center gap-2">
          <DownloadIcon fontSize="small" /> EXPORT DATA (.CSV)
        </button>
      </div>
    </div>
  );
};