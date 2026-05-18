import { useEffect, useRef } from 'react';
import { useDashboardStore } from '../store';

const COMPANY_COLORS: Record<string, string> = {
  DataSys: '#3b82f6',
  EcoServe: '#8b5cf6',
  GlobalNet: '#ec4899',
  TechCorp: '#eab308',
};

// Solo tooltip — el clusterPopup ahora lo gestiona DetailsPanel
export const MapOverlays = () => {
  const tooltipInfo   = useDashboardStore(state => state.tooltipInfo);
  const clusterPopup  = useDashboardStore(state => state.clusterPopup);
  const tooltipRef    = useRef<HTMLDivElement>(null);

  // Mover el tooltip siguiendo al ratón via transform (sin repaint)
  useEffect(() => {
    if (tooltipRef.current && tooltipInfo.visible && !clusterPopup?.visible) {
      tooltipRef.current.style.transform = `translate(${tooltipInfo.x + 15}px, ${tooltipInfo.y - 15}px)`;
    }
  }, [tooltipInfo.x, tooltipInfo.y, tooltipInfo.visible, clusterPopup?.visible]);

  const isVisible = tooltipInfo.visible && !clusterPopup?.visible;

  return (
    <div
      ref={tooltipRef}
      className="fixed top-0 left-0 px-4 py-3 rounded-2xl pointer-events-none z-[110] shadow-xl bg-slate-900/95 text-white min-w-[200px] will-change-transform transition-opacity duration-100"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {tooltipInfo.faults.length === 1 ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-black">{tooltipInfo.faults[0].info}</span>
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded w-fit uppercase"
            style={{ backgroundColor: COMPANY_COLORS[tooltipInfo.faults[0].company] || '#333' }}
          >
            {tooltipInfo.faults[0].company}
          </span>
        </div>
      ) : (
        <div className="text-[13px] font-black">{tooltipInfo.faults.length} Nodos Agrupados</div>
      )}
    </div>
  );
};