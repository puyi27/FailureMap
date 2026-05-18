import { useState } from 'react';
import { useDashboardStore } from '../store';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import RouterIcon from '@mui/icons-material/Router';
import PublicIcon from '@mui/icons-material/Public';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const CustomSelect = ({ value, options, onChange, icon, defaultLabel }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const displayValue = value === 'ALL' || value === 'All' ? defaultLabel : options.find((o: any) => o.value === value)?.label || value;

    return (
        <div className="relative group">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white/95 backdrop-blur-md rounded-full pl-3 pr-7 py-2 h-9 shadow-sm border border-slate-200 flex items-center gap-2 cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all select-none min-w-[110px]"
            >
                <div className="text-slate-400 flex items-center group-hover:text-blue-500 transition-colors">
                    {icon}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-700 truncate mt-0.5">{displayValue}</span>
                <svg className={`w-3 h-3 text-slate-400 absolute right-2.5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[110]" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute left-0 top-[calc(100%+6px)] min-w-full w-max bg-white/95 backdrop-blur-2xl border border-slate-100 shadow-2xl rounded-2xl py-1.5 z-[120] animate-scale-in origin-top-left overflow-hidden flex flex-col gap-0.5 px-1.5">
                        {options.map((opt: any) => (
                            <div
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={`px-2.5 py-2 text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all rounded-lg flex items-center gap-2 ${value === opt.value ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                            >
                                {value === opt.value && <div className="w-1 h-1 rounded-full bg-blue-500 shrink-0" />}
                                <span className={value === opt.value ? '' : 'ml-3'}>{opt.label}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export const ControlsBar = () => {
    const filters = useDashboardStore((state: any) => state.filters);
    const setFilters = useDashboardStore((state: any) => state.setFilters);
    const searchQuery = useDashboardStore((state: any) => state.searchQuery);
    const setSearchQuery = useDashboardStore((state: any) => state.setSearchQuery);
    const apiData = useDashboardStore((state: any) => state.apiData) || [];
    const setSelectedPoint = useDashboardStore((state: any) => state.setSelectedPoint);
    const setSelectedCity = useDashboardStore((state: any) => state.setSelectedCity);
    const setIsExportModalOpen = useDashboardStore((state: any) => state.setIsExportModalOpen);

    const companies = ['All', ...new Set(apiData.map((d: any) => d.company).filter(Boolean))];
    const types = ['All', 'Gateway', 'Sensor', 'Actuator', 'Camera'];

    const allCities = Array.from(new Set(apiData.map((d: any) => d.region).filter(Boolean))) as string[];
    const matchingCities = searchQuery.trim() ? allCities.filter(city => 
        city.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3) : [];

    const searchResults = searchQuery.trim() ? apiData.filter((d: any) =>
        (d.deviceId && d.deviceId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.info && d.info.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 5) : [];

    const continentOptions = [
        { value: 'All', label: 'Global' },
        { value: 'Europe', label: 'Europe' },
        { value: 'North America', label: 'North America' },
        { value: 'South America', label: 'South America' },
        { value: 'Asia', label: 'Asia' },
        { value: 'Africa', label: 'Africa' },
        { value: 'Oceania', label: 'Oceania' }
    ];

    const statusOptions = [
        { value: 'ALL', label: 'All Statuses' },
        { value: 'CRITICAL', label: 'Critical' },
        { value: 'WARNING', label: 'Warning' },
        { value: 'HEALTHY', label: 'Healthy' },
        { value: 'REPAIRING', label: 'Repairing' }
    ];

    const companyOptions = companies.map((c: any) => ({ value: c, label: c === 'All' ? 'Company' : c }));
    const typeOptions = types.map((t: any) => ({ value: t, label: t === 'All' ? 'Type' : t }));

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2.5">
            <div className="relative pointer-events-auto">
                <div className={`flex items-center bg-white/95 backdrop-blur-xl rounded-full shadow-sm border transition-all px-3 py-2 w-full sm:w-[280px] h-9 ${searchQuery ? 'border-blue-400' : 'border-slate-200'}`}>
                    <SearchIcon className="text-slate-400 mr-2" style={{ fontSize: 16 }} />
                    <input
                        type="text"
                        placeholder="Search node..."
                        className="w-full bg-transparent outline-none text-xs font-bold text-slate-700 mt-0.5"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 ml-1 outline-none flex items-center">
                            <CloseIcon style={{ fontSize: 14 }} />
                        </button>
                    )}
                </div>

                {((searchResults.length > 0) || (matchingCities.length > 0)) && (
                    <div className="absolute top-[calc(100%+8px)] left-0 w-full sm:w-[280px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col z-[150] p-1.5 gap-1">
                        
                        {matchingCities.length > 0 && (
                            <div className="flex flex-col border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                                <span className="px-2.5 py-1 text-[8px] font-black tracking-widest text-slate-400 uppercase">Cities</span>
                                {matchingCities.map((cityName: string) => {
                                    const nodeCount = apiData.filter((d: any) => d.region === cityName).length;
                                    return (
                                        <div 
                                            key={cityName} 
                                            onClick={() => {
                                                setSelectedCity(cityName);
                                                setSearchQuery('');
                                            }} 
                                            className="px-2.5 py-2 hover:bg-blue-50/50 hover:text-blue-700 cursor-pointer rounded-xl flex items-center gap-2 group transition-colors"
                                        >
                                            <LocationOnIcon className="text-slate-400 group-hover:text-blue-500 transition-colors" style={{ fontSize: 14 }} />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-800 group-hover:text-blue-900">{cityName}</span>
                                                <span className="text-[8px] font-bold text-slate-400 group-hover:text-blue-500">{nodeCount} active telemetry nodes</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        
                        {searchResults.length > 0 && (
                            <div className="flex flex-col pt-1">
                                <span className="px-2.5 py-1 text-[8px] font-black tracking-widest text-slate-400 uppercase">Devices</span>
                                {searchResults.map((device: any) => (
                                    <div 
                                        key={device.deviceId} 
                                        onClick={() => { 
                                            setSelectedPoint(device); 
                                            setSearchQuery(''); 
                                        }} 
                                        className="px-2.5 py-2 hover:bg-slate-50 cursor-pointer rounded-xl flex flex-col transition-colors border-b border-slate-50 last:border-0"
                                    >
                                        <span className="text-[10px] font-black text-slate-800">{device.info || 'Device'}</span>
                                        <span className="text-[8px] font-bold text-slate-400">{device.deviceId} • {device.region} • {device.lastStatus}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                )}
            </div>

            <div className="pointer-events-auto flex flex-wrap items-center gap-2">
                <CustomSelect
                    value={filters.continent}
                    options={continentOptions}
                    onChange={(val: string) => setFilters({ continent: val })}
                    icon={<PublicIcon style={{ fontSize: 14 }} />}
                    defaultLabel="Global"
                />

                <CustomSelect
                    value={filters.status}
                    options={statusOptions}
                    onChange={(val: string) => setFilters({ status: val })}
                    icon={<FilterListIcon style={{ fontSize: 14 }} />}
                    defaultLabel="All Statuses"
                />

                <CustomSelect
                    value={filters.company}
                    options={companyOptions}
                    onChange={(val: string) => setFilters({ company: val })}
                    icon={<BusinessIcon style={{ fontSize: 14 }} />}
                    defaultLabel="Company"
                />

                <CustomSelect
                    value={filters.deviceType}
                    options={typeOptions}
                    onChange={(val: string) => setFilters({ deviceType: val })}
                    icon={<RouterIcon style={{ fontSize: 14 }} />}
                    defaultLabel="Type"
                />

                {/* DIRECT EXPORT BUTTON IN NAVBAR */}
                <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="bg-blue-650 hover:bg-blue-700 text-white rounded-full px-4 h-9 shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-all select-none border border-blue-500/25 font-black uppercase tracking-widest text-[9px] mt-0 shrink-0"
                >
                    <FileDownloadIcon style={{ fontSize: 14 }} />
                    <span className="mt-0.5">Export</span>
                </button>
            </div>
        </div>
    );
};