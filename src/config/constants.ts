export const MAP_WIDTH = 1200;
export const MAP_HEIGHT = 800;

export const COLORS = {
    background: '#f0f4f8', landHex: '#ffffff', borders: '#cbd5e1', provinces: '#94a3b8',
    critical: '#ef4444', warning: '#f59e0b', healthy: '#10b981', repair: '#a855f7'
};

export const CONTINENT_LIST = ['All', 'Europe', 'North America', 'South America', 'Asia', 'Africa', 'Oceania'];

export const TIME_OPTIONS = [
    { value: 1, label: '1 Hora' },
    { value: 4, label: '4 Horas' },
    { value: 8, label: '8 Horas' },
    { value: 12, label: '12 Horas' },
    { value: 24, label: '24 Horas' }
];

export const HISTORICAL_TIMESLOTS = [
    { start: 0, end: 24, label: 'Todo el día' },
    { start: 0, end: 3, label: '00:00 - 03:00' },
    { start: 3, end: 6, label: '03:00 - 06:00' },
    { start: 6, end: 9, label: '06:00 - 09:00' },
    { start: 9, end: 12, label: '09:00 - 12:00' },
    { start: 12, end: 15, label: '12:00 - 15:00' },
    { start: 15, end: 18, label: '15:00 - 18:00' },
    { start: 18, end: 21, label: '18:00 - 21:00' },
    { start: 21, end: 24, label: '21:00 - 23:59' }
];

export const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const COMPANY_COLORS: Record<string, string> = {
    DataSys: '#3b82f6',
    EcoServe: '#8b5cf6',
    GlobalNet: '#ec4899',
    TechCorp: '#eab308'
};

export const REGION_TIMEZONES: Record<string, string> = {
    'Frankfurt': 'Europe/Berlin', 'Berlin': 'Europe/Berlin', 'Vienna': 'Europe/Vienna',
    'Paris': 'Europe/Paris', 'Rome': 'Europe/Rome', 'Milan': 'Europe/Rome', 'Naples': 'Europe/Rome',
    'Madrid': 'Europe/Madrid', 'Seville': 'Europe/Madrid', 'Barcelona': 'Europe/Madrid',
    'New York': 'America/New_York', 'Los Angeles': 'America/Los_Angeles',
    'Rio de Janeiro': 'America/Sao_Paulo', 'Sao Paulo': 'America/Sao_Paulo',
    'Buenos Aires': 'America/Argentina/Buenos_Aires', 'Montevideo': 'America/Montevideo',
    'Santiago de Chile': 'America/Santiago', 'Tokyo': 'Asia/Tokyo', 'Sydney': 'Australia/Sydney'
};
