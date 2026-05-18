import { useState, useMemo, useEffect } from 'react';
import { useDashboardStore } from '../store';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DataObjectIcon from '@mui/icons-material/DataObject';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import SearchIcon from '@mui/icons-material/Search';

type Language = 'es' | 'en' | 'it';

const MONTH_NAMES_BY_LANG: Record<Language, string[]> = {
    es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
};

const WEEKDAY_NAMES_BY_LANG: Record<Language, string[]> = {
    es: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    it: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
};

const TRANSLATIONS: Record<Language, any> = {
    es: {
        title: 'EXPORTAR TELEMETRÍA',
        subtitle: 'Configura y descarga reportes de tu red de nodos.',
        rangeTitle: 'Rango del Reporte',
        selectedPeriod: 'Periodo Seleccionado',
        today: 'Hoy',
        last7Days: 'Últimos 7 días',
        last30Days: 'Últimos 30 días',
        clearRange: 'Limpiar rango',
        companies: 'Compañías',
        cities: 'Ciudades / Regiones',
        status: 'Estados de Red',
        specificDevices: 'Dispositivos Específicos',
        searchPlaceholder: 'Buscar nodo por ID o ubicación...',
        selectAllVis: 'Seleccionar Visibles',
        deselectAllVis: 'Deseleccionar Visibles',
        clear: 'Limpiar',
        clearAll: 'Borrar todo',
        downloadFormat: 'Formato de Descarga',
        columnsTitle: 'Campos a Incluir',
        cancel: 'Cancelar',
        exportBtn: 'Generar Reporte',
        exportingBtn: 'Generando...',
        copyClipboard: 'Copiar Portapapeles',
        copiedMsg: '¡Copiado con éxito!',
        previewTitle: 'Resumen de Exportación',
        previewTotal: 'Nodos a exportar',
        previewFormat: 'Formato',
        previewRange: 'Fechas',
        noDevices: 'No se encontraron dispositivos que coincidan con los filtros.',
        selectAll: 'Todo',
        deselectAll: 'Ninguno',
        showingFirst: 'Mostrando los primeros 60 de {{total}} nodos. Usa la búsqueda para refinar.',
        columnLabels: {
            deviceId: 'ID Dispositivo',
            company: 'Compañía',
            type: 'Tipo',
            info: 'Información',
            lat: 'Latitud',
            lng: 'Longitud',
            region: 'Región',
            timezone: 'Zona Horaria',
            lastStatus: 'Último Estado',
            color: 'Color de Estado',
            lastTick: 'Última Lectura',
            statusTicks: 'Ticks de Estado'
        }
    },
    en: {
        title: 'EXPORT TELEMETRY',
        subtitle: 'Configure and download detailed reports of your node network.',
        rangeTitle: 'Report Range',
        selectedPeriod: 'Selected Period',
        today: 'Today',
        last7Days: 'Last 7 Days',
        last30Days: 'Last 30 Days',
        clearRange: 'Clear range',
        companies: 'Companies',
        cities: 'Cities / Regions',
        status: 'Network Status',
        specificDevices: 'Specific Devices',
        searchPlaceholder: 'Search node by ID or location...',
        selectAllVis: 'Select Visible',
        deselectAllVis: 'Deselect Visible',
        clear: 'Clear',
        clearAll: 'Clear all',
        downloadFormat: 'Download Format',
        columnsTitle: 'Fields to Include',
        cancel: 'Cancel',
        exportBtn: 'Generate Report',
        exportingBtn: 'Generating...',
        copyClipboard: 'Copy to Clipboard',
        copiedMsg: 'Successfully Copied!',
        previewTitle: 'Export Summary',
        previewTotal: 'Nodes to export',
        previewFormat: 'Format',
        previewRange: 'Dates',
        noDevices: 'No devices found matching the current filters.',
        selectAll: 'All',
        deselectAll: 'None',
        showingFirst: 'Showing first 60 of {{total}} nodes. Use search to refine.',
        columnLabels: {
            deviceId: 'Device ID',
            company: 'Company',
            type: 'Type',
            info: 'Info',
            lat: 'Latitude',
            lng: 'Longitude',
            region: 'Region',
            timezone: 'Timezone',
            lastStatus: 'Last Status',
            color: 'Status Color',
            lastTick: 'Last Reading',
            statusTicks: 'Status Ticks'
        }
    },
    it: {
        title: 'ESPORTA TELEMETRIA',
        subtitle: 'Configura e scarica report dettagliati della tua rete di nodi.',
        rangeTitle: 'Intervallo Report',
        selectedPeriod: 'Periodo Selezionato',
        today: 'Oggi',
        last7Days: 'Ultimi 7 Giorni',
        last30Days: 'Ultimi 30 Giorni',
        clearRange: 'Pulisci intervallo',
        companies: 'Aziende',
        cities: 'Città / Regioni',
        status: 'Stati di Rete',
        specificDevices: 'Dispositivi Specifici',
        searchPlaceholder: 'Cerca nodo per ID o posizione...',
        selectAllVis: 'Seleziona Visibili',
        deselectAllVis: 'Deseleziona Visibili',
        clear: 'Pulisci',
        clearAll: 'Cancella tutto',
        downloadFormat: 'Formato di Download',
        columnsTitle: 'Campi da Includere',
        cancel: 'Annulla',
        exportBtn: 'Genera Report',
        exportingBtn: 'Generazione...',
        copyClipboard: 'Copia negli Appunti',
        copiedMsg: 'Copiato con Successo!',
        previewTitle: 'Riepilogo Esportazione',
        previewTotal: 'Nodi da esportare',
        previewFormat: 'Formato',
        previewRange: 'Date',
        noDevices: 'Nessun dispositivo trovato con i filtri correnti.',
        selectAll: 'Tutti',
        deselectAll: 'Nessuno',
        showingFirst: 'Mostrando i primi 60 di {{total}} nodi. Usa la ricerca per filtrare.',
        columnLabels: {
            deviceId: 'ID Dispositivo',
            company: 'Azienda',
            type: 'Tipo',
            info: 'Informazioni',
            lat: 'Latitudine',
            lng: 'Longitudine',
            region: 'Regione',
            timezone: 'Fuso Orario',
            lastStatus: 'Ultimo Stato',
            color: 'Colore Stato',
            lastTick: 'Ultima Lettura',
            statusTicks: 'Ticks di Stato'
        }
    }
};

const AVAILABLE_COLUMNS = [
    'deviceId',
    'company',
    'type',
    'lastStatus',
    'region',
    'lat',
    'lng',
    'lastTick'
];

const getTodayStr = () => new Date().toISOString().split('T')[0];

export const TelemetryExportModal = () => {
    const { isExportModalOpen, setIsExportModalOpen, apiData } = useDashboardStore();

    // English defaults
    const [lang, setLang] = useState<Language>('en');
    const [startDate, setStartDate] = useState(getTodayStr());
    const [endDate, setEndDate] = useState('');
    const [calendarViewDate, setCalendarViewDate] = useState(new Date());

    const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedCities, setSelectedCities] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
    const [selectedColumns, setSelectedColumns] = useState<string[]>(['deviceId', 'company', 'type', 'lastStatus', 'region', 'lat', 'lng']);

    // 1. Debounced Search Term to avoid full list filtering on every keystroke
    const [deviceSearchInput, setDeviceSearchInput] = useState('');
    const [deviceSearch, setDeviceSearch] = useState('');
    useEffect(() => {
        const handler = setTimeout(() => {
            setDeviceSearch(deviceSearchInput);
        }, 150);
        return () => clearTimeout(handler);
    }, [deviceSearchInput]);

    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

    // 2. Memoized Set of selected devices for O(1) instantaneous lookups
    const selectedDevicesSet = useMemo(() => new Set(selectedDevices), [selectedDevices]);

    const [copied, setCopied] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const t = useMemo(() => TRANSLATIONS[lang], [lang]);

    const availableCompanies = useMemo(() => Array.from(new Set(apiData.map((d: any) => d.company).filter(Boolean))) as string[], [apiData]);
    const availableTypes = useMemo(() => Array.from(new Set(apiData.map((d: any) => d.type).filter(Boolean))) as string[], [apiData]);
    const availableCities = useMemo(() => Array.from(new Set(apiData.map((d: any) => d.region).filter(Boolean))) as string[], [apiData]);
    const availableStatuses = ['HEALTHY', 'WARNING', 'CRITICAL', 'REPAIRING'];

    const toggleArray = (setter: any, val: string) => setter((prev: string[]) => prev.includes(val) ? prev.filter((i: string) => i !== val) : [...prev, val]);

    const selectAllFilters = (setter: any, allVals: string[]) => setter(allVals);
    const deselectAllFilters = (setter: any) => setter([]);

    const visibleDevices = useMemo(() => {
        return apiData.filter((d: any) => {
            const matchComp = selectedCompanies.length === 0 || selectedCompanies.includes(d.company);
            const matchType = selectedTypes.length === 0 || selectedTypes.includes(d.type);
            const matchStat = selectedStatuses.length === 0 || selectedStatuses.includes(d.lastStatus);
            const matchCity = selectedCities.length === 0 || selectedCities.includes(d.region);
            const searchLower = deviceSearch.toLowerCase();
            const matchSearch = deviceSearch === '' || d.deviceId.toLowerCase().includes(searchLower) || (d.info && d.info.toLowerCase().includes(searchLower));
            return matchComp && matchType && matchStat && matchCity && matchSearch;
        });
    }, [apiData, selectedCompanies, selectedTypes, selectedStatuses, selectedCities, deviceSearch]);

    // 3. Lazy rendering slice: render only first 60 devices to maintain 60FPS fluid DOM rendering
    const renderedDevices = useMemo(() => {
        return visibleDevices.slice(0, 60);
    }, [visibleDevices]);

    // O(N) selection matching
    const finalExportDevices = useMemo(() => {
        return apiData.filter((d: any) => {
            const matchComp = selectedCompanies.length === 0 || selectedCompanies.includes(d.company);
            const matchType = selectedTypes.length === 0 || selectedTypes.includes(d.type);
            const matchStat = selectedStatuses.length === 0 || selectedStatuses.includes(d.lastStatus);
            const matchCity = selectedCities.length === 0 || selectedCities.includes(d.region);
            const matchDevice = selectedDevices.length === 0 || selectedDevicesSet.has(d.deviceId);
            return matchComp && matchType && matchStat && matchCity && matchDevice;
        });
    }, [apiData, selectedCompanies, selectedTypes, selectedStatuses, selectedCities, selectedDevicesSet]);

    // Set-based extremely fast boolean check
    const areAllVisibleSelected = useMemo(() => {
        return visibleDevices.length > 0 && visibleDevices.every((d: any) => selectedDevicesSet.has(d.deviceId));
    }, [visibleDevices, selectedDevicesSet]);

    // Extremely fast set operations for bulk actions
    const handleSelectAllDevices = () => {
        if (areAllVisibleSelected) {
            const visibleIds = new Set(visibleDevices.map((d: any) => d.deviceId));
            setSelectedDevices(prev => prev.filter(id => !visibleIds.has(id)));
        } else {
            const newIds = visibleDevices.map((d: any) => d.deviceId);
            setSelectedDevices(prev => Array.from(new Set([...prev, ...newIds])));
        }
    };

    const handleDateClick = (dateStr: string) => {
        if (!startDate || (startDate && endDate)) { setStartDate(dateStr); setEndDate(''); }
        else if (startDate && !endDate) {
            if (new Date(dateStr) < new Date(startDate)) setStartDate(dateStr); else setEndDate(dateStr);
        }
    };

    const handlePresetRange = (preset: 'today' | '7days' | '30days' | 'clear') => {
        const todayStr = getTodayStr();
        if (preset === 'today') {
            setStartDate(todayStr);
            setEndDate(todayStr);
        } else if (preset === '7days') {
            const start = new Date();
            start.setDate(start.getDate() - 7);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(todayStr);
        } else if (preset === '30days') {
            const start = new Date();
            start.setDate(start.getDate() - 30);
            setStartDate(start.toISOString().split('T')[0]);
            setEndDate(todayStr);
        } else if (preset === 'clear') {
            setStartDate('');
            setEndDate('');
        }
    };

    const getCalendarDays = () => {
        const year = calendarViewDate.getFullYear(); const month = calendarViewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay(); const offset = firstDay === 0 ? 6 : firstDay - 1;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < offset; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
        return days;
    };

    const getExportDataPayload = () => {
        return finalExportDevices.map((d: any) => {
            const obj: any = {};
            selectedColumns.forEach(col => {
                if (col === 'lastTick' && d[col]) {
                    obj[col] = new Date(d[col]).toISOString();
                } else {
                    obj[col] = d[col];
                }
            });
            return obj;
        });
    };

    const generateCSVString = (payload: any[]) => {
        const headers = selectedColumns.map(col => t.columnLabels[col] || col).join(',') + '\n';
        let csv = headers;
        payload.forEach((r: any) => {
            const row = selectedColumns.map(col => {
                const val = r[col];
                if (val === undefined || val === null) return '""';
                return `"${String(val).replace(/"/g, '""')}"`;
            }).join(',');
            csv += row + '\n';
        });
        return csv;
    };

    const handleCopyToClipboard = () => {
        const payload = getExportDataPayload();
        let textContent = '';
        if (exportFormat === 'json') {
            textContent = JSON.stringify(payload, null, 2);
        } else {
            textContent = generateCSVString(payload);
        }

        navigator.clipboard.writeText(textContent)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(err => {
                console.error('Error copying to clipboard: ', err);
            });
    };

    const handleExport = () => {
        setIsExporting(true);
        const payload = getExportDataPayload();

        setTimeout(() => {
            if (exportFormat === 'json') {
                const dataStr = JSON.stringify(payload, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                triggerDownload(blob, `Telemetry_Export_${Date.now()}.json`);
            } else {
                const csv = generateCSVString(payload);
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                triggerDownload(blob, `Telemetry_Export_${Date.now()}.csv`);
            }
            setIsExporting(false);
            setIsExportModalOpen(false);
        }, 850);
    };

    const triggerDownload = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a'); link.href = url; link.download = filename;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    const formatDateStr = (dateStr: string) => {
        if (!dateStr) return '---';
        return dateStr.split('-').reverse().join('/');
    };

    if (!isExportModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-6 overflow-hidden">
            {/* Elegant glassmorphic backdrop */}
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity duration-300 animate-fade-in" onClick={() => setIsExportModalOpen(false)}></div>

            <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200/80 w-full max-w-5xl relative z-10 flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-scale-in">
                
                {/* HEADER SECTION */}
                <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gradient-to-r from-blue-600/5 via-violet-600/5 to-purple-600/5 shrink-0">
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800 flex items-center gap-3">
                            <div className="bg-blue-600/10 p-2 rounded-xl text-blue-600 flex items-center justify-center shrink-0">
                                <FileDownloadIcon fontSize="medium" className="animate-pulse" />
                            </div>
                            <span className="bg-gradient-to-r from-slate-850 to-slate-700 bg-clip-text text-transparent">{t.title}</span>
                        </h3>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">{t.subtitle}</p>
                    </div>

                    {/* Language Switcher & Close button */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <div className="flex bg-slate-200/60 backdrop-blur-sm rounded-2xl p-1 border border-slate-300/30">
                            {(['es', 'en', 'it'] as Language[]).map((l) => (
                                <button
                                    key={l}
                                    onClick={() => setLang(l)}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer outline-none ${lang === l ? 'bg-white text-blue-600 shadow-sm scale-[1.05]' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    <span>{l === 'es' ? '🇪🇸' : l === 'en' ? '🇬🇧' : '🇮🇹'}</span>
                                    <span>{l}</span>
                                </button>
                            ))}
                        </div>

                        <button onClick={() => setIsExportModalOpen(false)} className="p-2 sm:p-2.5 rounded-full text-slate-450 hover:text-slate-800 hover:bg-slate-100 border border-slate-100 hover:border-slate-300 bg-white transition-all outline-none cursor-pointer flex items-center justify-center shadow-sm">
                            <CloseIcon style={{ fontSize: 18 }} />
                        </button>
                    </div>
                </div>

                {/* MODAL MAIN CONTENT GRID */}
                <div className="flex flex-col lg:flex-row overflow-hidden flex-1">
                    
                    {/* LEFT PANEL: CALENDAR, PRESETS & COLUMNS */}
                    <div className="w-full lg:w-[350px] p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/50 shrink-0 overflow-y-auto scrollbar-thin flex flex-col gap-6">
                        
                        {/* Dates range */}
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-1">{t.rangeTitle}</h4>
                            
                            {/* Date Presets pills */}
                            <div className="flex flex-wrap gap-1.5 mb-3.5">
                                <button onClick={() => handlePresetRange('today')} className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-blue-500 text-[10px] font-black uppercase text-slate-600 rounded-xl transition-all shadow-xs cursor-pointer">{t.today}</button>
                                <button onClick={() => handlePresetRange('7days')} className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-blue-500 text-[10px] font-black uppercase text-slate-600 rounded-xl transition-all shadow-xs cursor-pointer">{t.last7Days}</button>
                                <button onClick={() => handlePresetRange('30days')} className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-blue-500 text-[10px] font-black uppercase text-slate-600 rounded-xl transition-all shadow-xs cursor-pointer">{t.last30Days}</button>
                                <button onClick={() => handlePresetRange('clear')} className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-red-400 hover:text-red-500 text-[10px] font-black uppercase text-slate-400 rounded-xl transition-all shadow-xs cursor-pointer">✕</button>
                            </div>

                            {/* Calendar Grid card */}
                            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm w-full select-none">
                                <div className="flex justify-between items-center mb-3">
                                    <button onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1))} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"><KeyboardArrowLeftIcon fontSize="small" /></button>
                                    <span className="font-black uppercase tracking-wider text-[11px] text-slate-700">{MONTH_NAMES_BY_LANG[lang][calendarViewDate.getMonth()]} {calendarViewDate.getFullYear()}</span>
                                    <button onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1))} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"><KeyboardArrowRightIcon fontSize="small" /></button>
                                </div>
                                <div className="grid grid-cols-7 mb-2">
                                    {WEEKDAY_NAMES_BY_LANG[lang].map(d => <div key={d} className="text-center text-[9px] font-black uppercase text-slate-400">{d}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-y-1">
                                    {getCalendarDays().map((d, i) => {
                                        if (!d) return <div key={`empty-${i}`} className="w-8 h-8"></div>;
                                        const isStart = d === startDate; const isEnd = d === endDate;
                                        const isBetween = startDate && endDate && d > startDate && d < endDate;
                                        let bgClass = "bg-transparent hover:bg-slate-100 text-slate-700"; let roundedClass = "rounded-xl";
                                        if (isStart) { bgClass = "bg-blue-600 text-white font-bold"; if (endDate) roundedClass = "rounded-l-xl rounded-r-none"; }
                                        else if (isEnd) { bgClass = "bg-blue-600 text-white font-bold"; if (startDate) roundedClass = "rounded-r-xl rounded-l-none"; }
                                        else if (isBetween) { bgClass = "bg-blue-50 text-blue-600 font-bold"; roundedClass = "rounded-none"; }

                                        return (
                                            <div key={d} className={`w-full flex justify-center ${isBetween ? 'bg-blue-50' : ''}`}>
                                                <button onClick={() => handleDateClick(d)} className={`w-8 h-8 flex items-center justify-center text-[10px] transition-colors outline-none cursor-pointer ${bgClass} ${roundedClass}`}>{d.split('-')[2]}</button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-3 text-center bg-blue-50/50 rounded-2xl py-2 px-3 border border-blue-100/50">
                                <div className="text-[9px] font-black uppercase text-slate-400 mb-0.5">{t.selectedPeriod}</div>
                                <div className="font-black text-xs text-blue-600 flex justify-center items-center gap-1.5">
                                    <span>{formatDateStr(startDate)}</span>
                                    {endDate && (
                                        <>
                                            <span className="text-slate-400">→</span>
                                            <span>{formatDateStr(endDate)}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Columns selectors */}
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-1">{t.columnsTitle}</h4>
                            <div className="flex flex-wrap gap-1.5 p-3.5 bg-white rounded-3xl border border-slate-200 shadow-xs max-h-[190px] overflow-y-auto scrollbar-thin">
                                {AVAILABLE_COLUMNS.map(col => {
                                    const isSelected = selectedColumns.includes(col);
                                    return (
                                        <button
                                            key={col}
                                            onClick={() => toggleArray(setSelectedColumns, col)}
                                            className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer outline-none ${isSelected ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-xs scale-[1.02]' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500'}`}
                                        >
                                            {isSelected && (
                                                <span className="text-indigo-500 font-bold shrink-0">✓</span>
                                            )}
                                            <span>{t.columnLabels[col] || col}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Format selector */}
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-1">{t.downloadFormat}</h4>
                            <div className="flex gap-3">
                                <button onClick={() => setExportFormat('csv')} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all outline-none cursor-pointer ${exportFormat === 'csv' ? 'border-[#107c41] bg-[#107c41]/5 text-[#107c41] shadow-xs' : 'border-slate-200 bg-white hover:border-[#107c41]/30 text-slate-455'}`}>
                                    <InsertDriveFileIcon style={{ fontSize: 24 }} className="mb-1" />
                                    <span className="font-black uppercase tracking-widest text-[9px]">CSV / Excel</span>
                                </button>
                                <button onClick={() => setExportFormat('json')} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all outline-none cursor-pointer ${exportFormat === 'json' ? 'border-purple-600 bg-purple-50/5 text-purple-600 shadow-xs' : 'border-slate-200 bg-white hover:border-purple-400/30 text-slate-450'}`}>
                                    <DataObjectIcon style={{ fontSize: 24 }} className="mb-1" />
                                    <span className="font-black uppercase tracking-widest text-[9px]">JSON</span>
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT PANEL: FILTROS MULTI-SELECCIÓN Y BÚSQUEDA DE DISPOSITIVOS */}
                    <div className="flex-1 p-5 sm:p-6 lg:p-8 space-y-6 overflow-y-auto scrollbar-thin bg-white">
                        
                        {/* Multi-Filters Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Companies */}
                            <section className="bg-slate-50/50 p-4 sm:p-5 rounded-3xl border border-slate-200/70 flex flex-col h-[200px] hover:border-slate-300 transition-all duration-300 shadow-xs">
                                <div className="flex flex-col gap-1 mb-3 shrink-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 truncate">
                                            {t.companies}
                                        </h4>
                                    </div>
                                    <div className="flex gap-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
                                        <button onClick={() => selectAllFilters(setSelectedCompanies, availableCompanies)} className="text-blue-600 hover:text-blue-700 hover:underline outline-none cursor-pointer transition-colors">{t.selectAll}</button>
                                        <span className="text-slate-300">|</span>
                                        <button onClick={() => deselectAllFilters(setSelectedCompanies)} className="hover:text-slate-650 hover:underline outline-none cursor-pointer transition-colors">{t.deselectAll}</button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5 overflow-y-auto flex-1 scrollbar-thin py-0.5">
                                    {availableCompanies.length === 0 ? <span className="text-[10px] font-bold text-slate-400 p-2 italic">Sin datos</span> : availableCompanies.map(comp => {
                                        const isSelected = selectedCompanies.length === 0 || selectedCompanies.includes(comp);
                                        return (
                                            <button
                                                key={comp}
                                                onClick={() => toggleArray(setSelectedCompanies, comp)}
                                                className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer outline-none ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-xs' : 'border-slate-200 bg-white hover:border-blue-200 text-slate-500'}`}
                                            >
                                                {comp}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Regions */}
                            <section className="bg-slate-50/50 p-4 sm:p-5 rounded-3xl border border-slate-200/70 flex flex-col h-[200px] hover:border-slate-300 transition-all duration-300 shadow-xs">
                                <div className="flex flex-col gap-1 mb-3 shrink-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0"></span>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 truncate">
                                            {t.cities}
                                        </h4>
                                    </div>
                                    <div className="flex gap-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
                                        <button onClick={() => selectAllFilters(setSelectedCities, availableCities)} className="text-purple-600 hover:text-purple-700 hover:underline outline-none cursor-pointer transition-colors">{t.selectAll}</button>
                                        <span className="text-slate-300">|</span>
                                        <button onClick={() => deselectAllFilters(setSelectedCities)} className="hover:text-slate-650 hover:underline outline-none cursor-pointer transition-colors">{t.deselectAll}</button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5 overflow-y-auto flex-1 scrollbar-thin py-0.5">
                                    {availableCities.length === 0 ? <span className="text-[10px] font-bold text-slate-400 p-2 italic">Sin datos</span> : availableCities.map(city => {
                                        const isSelected = selectedCities.length === 0 || selectedCities.includes(city);
                                        return (
                                            <button
                                                key={city}
                                                onClick={() => toggleArray(setSelectedCities, city)}
                                                className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer outline-none ${isSelected ? 'border-purple-500 bg-purple-50/10 text-purple-700 shadow-xs' : 'border-slate-200 bg-white hover:border-purple-200 text-slate-500'}`}
                                            >
                                                {city}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Status */}
                            <section className="bg-slate-50/50 p-4 sm:p-5 rounded-3xl border border-slate-200/70 flex flex-col h-[200px] hover:border-slate-300 transition-all duration-300 shadow-xs">
                                <div className="flex flex-col gap-1 mb-3 shrink-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 truncate">
                                            {t.status}
                                        </h4>
                                    </div>
                                    <div className="flex gap-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
                                        <button onClick={() => selectAllFilters(setSelectedStatuses, availableStatuses)} className="text-emerald-600 hover:text-emerald-700 hover:underline outline-none cursor-pointer transition-colors">{t.selectAll}</button>
                                        <span className="text-slate-300">|</span>
                                        <button onClick={() => deselectAllFilters(setSelectedStatuses)} className="hover:text-slate-650 hover:underline outline-none cursor-pointer transition-colors">{t.deselectAll}</button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5 overflow-y-auto flex-1 scrollbar-thin py-0.5">
                                    {availableStatuses.map(s => {
                                        const isSelected = selectedStatuses.length === 0 || selectedStatuses.includes(s);
                                        let activeBorder = 'border-slate-300 bg-slate-50 text-slate-800';
                                        if (isSelected) {
                                            if (s === 'CRITICAL') activeBorder = 'border-red-500 bg-red-50 text-red-655 shadow-xs';
                                            else if (s === 'WARNING') activeBorder = 'border-orange-500 bg-orange-50 text-orange-655 shadow-xs';
                                            else if (s === 'REPAIRING') activeBorder = 'border-cyan-500 bg-cyan-50 text-cyan-655 shadow-xs';
                                            else activeBorder = 'border-emerald-500 bg-emerald-50 text-emerald-650 shadow-xs';
                                        }

                                        return (
                                            <button
                                                key={s}
                                                onClick={() => toggleArray(setSelectedStatuses, s)}
                                                className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer outline-none ${isSelected ? activeBorder : 'border-slate-200 bg-white hover:border-slate-300 text-slate-450'}`}
                                            >
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                        </div>

                        {/* Specific Devices section */}
                        <section className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-1">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.specificDevices}</h4>
                                <div className="flex gap-4">
                                    <button type="button" onClick={handleSelectAllDevices} className="text-[10px] font-black uppercase text-blue-600 hover:underline outline-none cursor-pointer">
                                        {areAllVisibleSelected ? t.deselectAllVis : t.selectAllVis}
                                    </button>
                                    <button type="button" onClick={() => setSelectedDevices([])} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 hover:underline outline-none cursor-pointer">
                                        {t.clear}
                                    </button>
                                </div>
                            </div>

                            {/* Search bar inside list (Lightweight instantaneous text input) */}
                            <div className="relative">
                                <SearchIcon fontSize="small" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-xs font-bold text-slate-700 placeholder-slate-400"
                                    placeholder={t.searchPlaceholder}
                                    value={deviceSearchInput}
                                    onChange={(e) => setDeviceSearchInput(e.target.value)}
                                />
                            </div>

                            {/* Responsive Grid list of specific devices (LAZY-RENDERED to 60 elements max for 60FPS fluid scrolling) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto p-4 rounded-3xl border border-slate-200/80 bg-slate-50/50 scrollbar-thin">
                                {renderedDevices.map((d: any) => {
                                    // Instantaneous O(1) set lookup instead of expensive N^2 array.includes() lookup
                                    const isDeviceSelected = selectedDevicesSet.has(d.deviceId);
                                    return (
                                        <label
                                            key={d.deviceId}
                                            className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all select-none ${isDeviceSelected ? 'bg-white border-blue-400 shadow-sm scale-[1.01]' : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-xs'}`}
                                        >
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 rounded-lg border-slate-300 focus:ring-blue-400 focus:ring-2 cursor-pointer transition-all shrink-0"
                                                checked={isDeviceSelected}
                                                onChange={() => toggleArray(setSelectedDevices, d.deviceId)}
                                            />
                                            <div className="flex flex-col overflow-hidden flex-1">
                                                <span className="text-[11px] font-black text-slate-800 truncate">{d.info || 'Device'}</span>
                                                <span className="text-[9px] font-mono font-bold text-slate-400 truncate">{d.deviceId}</span>
                                            </div>
                                            <div className="relative flex shrink-0">
                                                <div className={`w-2.5 h-2.5 rounded-full ${d.lastStatus === 'CRITICAL' ? 'bg-[#ef4444]' : d.lastStatus === 'WARNING' ? 'bg-[#f97316]' : d.lastStatus === 'REPAIRING' ? 'bg-[#06b6d4]' : 'bg-[#10b981]'} animate-ping-slow absolute inset-0 opacity-60`}></div>
                                                <div className={`w-2.5 h-2.5 rounded-full ${d.lastStatus === 'CRITICAL' ? 'bg-[#ef4444]' : d.lastStatus === 'WARNING' ? 'bg-[#f97316]' : d.lastStatus === 'REPAIRING' ? 'bg-[#06b6d4]' : 'bg-[#10b981]'} z-10`}></div>
                                            </div>
                                        </label>
                                    );
                                })}
                                {visibleDevices.length === 0 && (
                                    <div className="col-span-full py-6 text-center text-xs font-bold text-slate-400 italic">
                                        {t.noDevices}
                                    </div>
                                )}
                                {visibleDevices.length > 60 && (
                                    <div className="col-span-full text-center text-[9px] font-black text-slate-400 uppercase tracking-widest py-3 border-t border-slate-200/50 mt-2">
                                        {t.showingFirst.replace('{{total}}', visibleDevices.length)}
                                    </div>
                                )}
                            </div>
                        </section>

                    </div>
                </div>

                {/* MODAL FOOTER: EXPORT SUMMARY CARD & BUTTONS */}
                <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:justify-between md:items-center gap-4 rounded-b-[2rem] shrink-0">
                    
                    {/* Live Export Summary Badge */}
                    <div className="flex items-center gap-3.5 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex-1 md:flex-none">
                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            {t.previewTitle}:
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] font-black text-slate-700">
                            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">
                                {finalExportDevices.length} {t.previewTotal}
                            </span>
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg uppercase">
                                {exportFormat}
                            </span>
                            <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg">
                                {selectedColumns.length} Col
                            </span>
                        </div>
                    </div>

                    {/* Actions buttons */}
                    <div className="flex justify-end gap-3 shrink-0">
                        <button onClick={() => setIsExportModalOpen(false)} className="px-5 py-3 rounded-xl font-bold uppercase text-[10px] tracking-wider text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors outline-none cursor-pointer">{t.cancel}</button>
                        
                        {/* Copy to Clipboard with animation state */}
                        <button
                            onClick={handleCopyToClipboard}
                            disabled={finalExportDevices.length === 0}
                            className={`px-5 py-3 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all border outline-none cursor-pointer flex items-center gap-2 shadow-xs ${copied ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                        >
                            {copied ? (
                                <>
                                    <svg className="w-3.5 h-3.5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    <span>{t.copiedMsg}</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                    <span>{t.copyClipboard}</span>
                                </>
                            )}
                        </button>

                        {/* Export file */}
                        <button
                            onClick={handleExport}
                            disabled={finalExportDevices.length === 0 || isExporting}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-black uppercase tracking-wider text-[10px] h-12 px-6 shadow-md hover:shadow-lg transition-all flex items-center gap-2 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExporting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>{t.exportingBtn}</span>
                                </>
                            ) : (
                                <>
                                    <FileDownloadIcon fontSize="small" />
                                    <span>{t.exportBtn}</span>
                                </>
                            )}
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};