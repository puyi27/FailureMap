import { useMemo, useState } from 'react';
import { useDashboardStore } from '../store';
import * as d3 from 'd3';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const arcGenerator = d3.arc<any>().innerRadius(20).outerRadius(35);
const pieGenerator = d3.pie<any>().value((d: any) => d.value).sort(null);

export const TimelinePanel = () => {
    const selectedPoint = useDashboardStore((s: any) => s.selectedPoint);
    const [pieHover, setPieHover] = useState<any>(null);

    const stats = useMemo(() => {
        if (!selectedPoint?.history) return null;
        const h = selectedPoint.history;
        const total = h.length || 1;
        const healthy = h.filter((x: any) => x.val === 1).length;
        const warn = h.filter((x: any) => x.val === 2).length;
        const crit = h.filter((x: any) => x.val === 3).length;

        const pieData = [
            { id: 'OK', value: healthy, color: '#10b981' },
            { id: 'WARN', value: warn, color: '#f97316' },
            { id: 'CRIT', value: crit, color: '#ef4444' }
        ].filter(d => d.value > 0);

        return {
            pct: Math.round((healthy / total) * 100),
            piePaths: pieGenerator(pieData).map(p => ({ d: arcGenerator(p), ...p.data, pct: (p.data.value / total) * 100 })),
            blocks: h
        };
    }, [selectedPoint]);

    if (!stats) return null;
    const currentPie = pieHover || { id: 'ESTABLE', pct: stats.pct, color: '#10b981' };

    return (
        <div className="pointer-events-auto bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 p-5 flex items-center gap-8 h-32 animate-slide-up">
            <div className="relative w-20 h-20 shrink-0">
                <svg viewBox="-40 -40 80 80" className="w-full h-full">
                    {stats.piePaths.map((p: any) => (
                        <path key={p.id} d={p.d} fill={p.color} stroke="white" strokeWidth="2" onMouseEnter={() => setPieHover(p)} onMouseLeave={() => setPieHover(null)} className="cursor-pointer transition-transform hover:scale-110" />
                    ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-sm font-black leading-none" style={{ color: currentPie.color }}>{Math.round(currentPie.pct)}%</span>
                    <span className="text-[7px] font-black uppercase" style={{ color: currentPie.color }}>{currentPie.id}</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Historial de Disponibilidad</span>
                    <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        <CalendarTodayIcon style={{ fontSize: 10 }} className="text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Últimas 24 Horas</span>
                    </div>
                </div>
                <div className="w-full h-8 flex rounded-full overflow-hidden border border-slate-100 bg-slate-50">
                    {stats.blocks.map((b: any, i: number) => (
                        <div key={i} className="flex-1" style={{ backgroundColor: b.val === 3 ? '#ef4444' : b.val === 2 ? '#f97316' : '#10b981' }} />
                    ))}
                </div>
                <div className="flex justify-between text-[8px] font-black text-slate-400 tracking-widest">
                    <span>INICIO SESIÓN</span>
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> SANO</span>
                        <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#f97316]" /> ALERTA</span>
                        <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" /> CRÍTICO</span>
                    </div>
                    <span>AHORA (LIVE)</span>
                </div>
            </div>
        </div>
    );
};