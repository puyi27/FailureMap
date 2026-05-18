import { create } from 'zustand';

export const useDashboardStore = create<any>((set, get) => ({
    apiData: [],
    worldData: null,
    searchQuery: '',
    selectedPoint: null,
    isExportModalOpen: false, // <-- Estado del modal
    filters: {
        continent: 'All',
        status: 'ALL',
        company: 'All',
        deviceType: 'All',
        date: new Date().toISOString().split('T')[0]
    },

    setApiData: (data: any) => set({ apiData: data }),
    setGeoData: (data: any) => set({ worldData: data }),
    setSearchQuery: (query: string) => set({ searchQuery: query }),
    setSelectedPoint: (point: any) => set({ selectedPoint: point }),

    // LA FUNCIÓN CON EL NOMBRE CORRECTO PARA TU MODAL
    setIsExportModalOpen: (isOpen: boolean) => set({ isExportModalOpen: isOpen }),

    setFilters: (newFilters: any) => set((state: any) => ({
        filters: { ...state.filters, ...newFilters }
    })),

    resolveDevice: (deviceId: string) => set((state: any) => {
        const newData = state.apiData.map((d: any) => d.deviceId === deviceId ? {
            ...d,
            lastStatus: 'HEALTHY',
            color: '#10b981',
            events: [{ timestamp: new Date().toISOString(), status: 'RESOLVED', message: 'Maintenance completed successfully (OK)' }, ...(d.events || [])]
        } : d);
        return { apiData: newData, selectedPoint: newData.find((d: any) => d.deviceId === deviceId) };
    }),

    repairDevice: (deviceId: string) => set((state: any) => {
        const newData = state.apiData.map((d: any) => d.deviceId === deviceId ? {
            ...d,
            lastStatus: 'REPAIRING',
            color: '#06b6d4',
            events: [{ timestamp: new Date().toISOString(), status: 'REPAIRING', message: 'Technical intervention initiated' }, ...(d.events || [])]
        } : d);
        return { apiData: newData, selectedPoint: newData.find((d: any) => d.deviceId === deviceId) };
    })
}));